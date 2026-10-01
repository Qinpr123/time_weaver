-- Supabase Storage CORS 策略和定期清理配置
-- 版本: 1.0.0
-- 描述: 配置存储桶的CORS策略和安全规则，建立定期清理机制

-- ==================== CORS 策略配置 ====================
-- 注意：CORS策略需要在 Supabase 控制台的 Storage 页面手动配置
-- 配置步骤：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 Storage 页面
-- 3. 选择 "diary-media" 存储桶
-- 4. 点击 "Settings" 标签
-- 5. 在 "CORS Configuration" 部分添加以下配置：

/*
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "https://yourdomain.com"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "headers": ["Authorization", "Content-Type", "x-client-info"],
    "maxAgeSeconds": 86400
  }
]
*/

-- ==================== 定期清理机制 ====================
-- 创建清理过期文件的函数
CREATE OR REPLACE FUNCTION cleanup_expired_media_files()
RETURNS void AS $$
DECLARE
    expired_record RECORD;
    cleanup_cursor CURSOR FOR
        SELECT dm.id, dm.file_path, dm.thumbnail_path, dm.storage_bucket
        FROM diary_media dm
        WHERE dm.created_at < NOW() - INTERVAL '30 days'
          AND dm.diary_id IS NULL; -- 未关联到日记的文件
BEGIN
    -- 打开游标
    OPEN cleanup_cursor;

    -- 循环处理过期文件
    LOOP
        FETCH cleanup_cursor INTO expired_record;
        EXIT WHEN NOT FOUND;

        -- 删除存储桶中的文件
        BEGIN
            -- 删除主文件
            PERFORM storage.delete_object(expired_record.storage_bucket, expired_record.file_path);

            -- 如果存在缩略图，也删除
            IF expired_record.thumbnail_path IS NOT NULL THEN
                PERFORM storage.delete_object(expired_record.storage_bucket, expired_record.thumbnail_path);
            END IF;

            -- 删除数据库记录
            DELETE FROM diary_media WHERE id = expired_record.id;

            -- 记录清理日志
            RAISE NOTICE '清理过期媒体文件: %', expired_record.file_path;

        EXCEPTION
            WHEN OTHERS THEN
                -- 记录错误但不中断清理过程
                RAISE WARNING '清理文件失败 %: %', expired_record.file_path, SQLERRM;
        END;
    END LOOP;

    -- 关闭游标
    CLOSE cleanup_cursor;
END;
$$ LANGUAGE plpgsql;

-- 创建清理无效文件的函数（文件存在但数据库记录丢失的情况）
CREATE OR REPLACE FUNCTION cleanup_orphaned_media_files()
RETURNS void AS $$
DECLARE
    bucket_name TEXT := 'diary-media';
    orphaned_file RECORD;
    file_count INTEGER := 0;
BEGIN
    -- 获取存储桶中所有文件
    FOR orphaned_file IN
        SELECT name as file_path
        FROM storage.objects
        WHERE bucket_id = bucket_name
          AND created_at < NOW() - INTERVAL '7 days' -- 只处理7天前的文件
    LOOP
        -- 检查文件是否在数据库中有对应记录
        IF NOT EXISTS (
            SELECT 1 FROM diary_media
            WHERE file_path = orphaned_file.file_path
               OR thumbnail_path = orphaned_file.file_path
        ) THEN
            -- 删除孤儿文件
            BEGIN
                PERFORM storage.delete_object(bucket_name, orphaned_file.file_path);
                file_count := file_count + 1;
                RAISE NOTICE '清理孤儿文件: %', orphaned_file.file_path;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE WARNING '清理孤儿文件失败 %: %', orphaned_file.file_path, SQLERRM;
            END;
        END IF;
    END LOOP;

    RAISE NOTICE '清理完成，共删除 % 个孤儿文件', file_count;
END;
$$ LANGUAGE plpgsql;

-- ==================== 存储桶使用统计 ====================
-- 创建获取存储桶使用情况的函数
CREATE OR REPLACE FUNCTION get_storage_usage_stats(user_id UUID DEFAULT NULL)
RETURNS TABLE(
    total_files BIGINT,
    total_size_bytes BIGINT,
    image_count BIGINT,
    video_count BIGINT,
    avg_file_size_bytes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_files,
        COALESCE(SUM(file_size), 0) as total_size_bytes,
        COUNT(*) FILTER (WHERE media_type = 'image') as image_count,
        COUNT(*) FILTER (WHERE media_type = 'video') as video_count,
        COALESCE(AVG(file_size), 0) as avg_file_size_bytes
    FROM diary_media
    WHERE (get_storage_usage_stats.user_id IS NULL OR user_id = get_storage_usage_stats.user_id)
      AND created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ==================== 文件完整性检查 ====================
-- 创建检查文件完整性的函数
CREATE OR REPLACE FUNCTION check_media_file_integrity()
RETURNS TABLE(
    file_id UUID,
    file_path TEXT,
    file_size BIGINT,
    storage_bucket TEXT,
    integrity_status TEXT
) AS $$
DECLARE
    media_record RECORD;
BEGIN
    FOR media_record IN
        SELECT id, file_path, file_size, storage_bucket
        FROM diary_media
        WHERE created_at >= NOW() - INTERVAL '7 days'
    LOOP
        -- 检查文件是否存在（这里需要扩展存储桶API调用）
        -- 在实际应用中，可能需要调用外部API来验证文件存在性

        -- 暂时返回基本状态
        RETURN QUERY
        SELECT
            media_record.id,
            media_record.file_path,
            media_record.file_size,
            media_record.storage_bucket,
            '需要外部验证'::TEXT as integrity_status;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==================== 安全审计日志 ====================
-- 创建媒体文件访问审计表
CREATE TABLE IF NOT EXISTS media_access_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_id UUID REFERENCES diary_media(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'download', 'upload', 'delete')),
    file_path TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    access_time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT
);

-- 为审计表添加索引
CREATE INDEX IF NOT EXISTS idx_media_audit_user_id ON media_access_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_media_id ON media_access_audit(media_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_access_time ON media_access_audit(access_time);
CREATE INDEX IF NOT EXISTS idx_media_audit_action_type ON media_access_audit(action_type);

-- 启用行级安全
ALTER TABLE media_access_audit ENABLE ROW LEVEL SECURITY;

-- 策略：用户只能查看自己的审计记录
DROP POLICY IF EXISTS "用户只能查看自己的审计记录" ON media_access_audit;
CREATE POLICY "用户只能查看自己的审计记录" ON media_access_audit
    FOR SELECT USING (auth.uid() = user_id);

-- 策略：系统可以插入所有审计记录
DROP POLICY IF EXISTS "系统可以插入审计记录" ON media_access_audit;
CREATE POLICY "系统可以插入审计记录" ON media_access_audit
    FOR INSERT WITH CHECK (true);

-- ==================== 定期任务配置 ====================
-- 创建清理任务的调度（需要 pg_cron 扩展）
-- 注意：以下SQL需要在启用 pg_cron 扩展后执行

/*
-- 每天凌晨3点清理过期文件
SELECT cron.schedule(
    'cleanup-expired-media',
    '0 3 * * *',
    'SELECT cleanup_expired_media_files()'
);

-- 每周日凌晨2点清理孤儿文件
SELECT cron.schedule(
    'cleanup-orphaned-media',
    '0 2 * * 0',
    'SELECT cleanup_orphaned_media_files()'
);

-- 每月1日凌晨1点生成存储使用报告
SELECT cron.schedule(
    'storage-usage-report',
    '0 1 1 * *',
    'INSERT INTO storage_usage_reports SELECT * FROM get_storage_usage_stats()'
);
*/

-- ==================== 使用说明 ====================
COMMENT ON FUNCTION cleanup_expired_media_files() IS '清理30天内未关联到日记的媒体文件';
COMMENT ON FUNCTION cleanup_orphaned_media_files() IS '清理存储桶中存在但数据库中没有记录的孤儿文件';
COMMENT ON FUNCTION get_storage_usage_stats(UUID) IS '获取存储使用统计，可指定用户ID或获取所有用户统计';
COMMENT ON FUNCTION check_media_file_integrity() IS '检查媒体文件完整性（需要扩展实现）';
COMMENT ON TABLE media_access_audit IS '媒体文件访问审计表，记录所有文件操作';

-- ==================== 手动执行示例 ====================
/*
-- 手动清理过期文件
SELECT cleanup_expired_media_files();

-- 手动清理孤儿文件
SELECT cleanup_orphaned_media_files();

-- 查看存储使用情况
SELECT * FROM get_storage_usage_stats();

-- 查看特定用户的存储使用情况
SELECT * FROM get_storage_usage_stats('user-uuid-here');

-- 查看文件完整性检查
SELECT * FROM check_media_file_integrity();
*/

SELECT 'Storage CORS策略和清理机制配置完成！请在Supabase控制台配置CORS并考虑启用pg_cron扩展。' AS status;
