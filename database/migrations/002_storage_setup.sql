-- Supabase Storage 存储桶配置和策略
-- 版本: 1.0.0
-- 描述: 配置用户媒体文件存储桶和安全策略

-- ==================== 存储桶说明 ====================
-- 注意：存储桶需要在 Supabase 控制台的 Storage 页面手动创建
-- 创建步骤：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 Storage 页面
-- 3. 创建以下存储桶：
--    - diary-media (私有桶)
--    - avatars (公开桶，可选)
-- 
-- 存储桶设置：
-- - diary-media: 
--     - Public bucket: 否（私有）
--     - File size limit: 50MB（可根据需要调整）
--     - Allowed MIME types: image/*, video/*
-- - avatars:
--     - Public bucket: 是（公开）
--     - File size limit: 5MB
--     - Allowed MIME types: image/*

-- ==================== Storage RLS 策略 ====================
-- 为 storage.objects 表启用 RLS
-- 注意：storage.objects 表是系统表，RLS 默认已启用

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "用户只能访问自己的媒体文件" ON storage.objects;
DROP POLICY IF EXISTS "用户只能上传到自己的文件夹" ON storage.objects;
DROP POLICY IF EXISTS "用户只能删除自己的媒体文件" ON storage.objects;
DROP POLICY IF EXISTS "公开头像可访问" ON storage.objects;

-- 策略 1: 用户只能读取自己的媒体文件（diary-media 桶）
CREATE POLICY "用户只能访问自己的媒体文件"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'diary-media' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 2: 用户只能上传到自己的文件夹（diary-media 桶）
CREATE POLICY "用户只能上传到自己的文件夹"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'diary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 3: 用户只能更新自己的媒体文件（diary-media 桶）
CREATE POLICY "用户只能更新自己的媒体文件"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'diary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'diary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 4: 用户只能删除自己的媒体文件（diary-media 桶）
CREATE POLICY "用户只能删除自己的媒体文件"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'diary-media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 5: 公开头像可访问（avatars 桶，如果使用公开桶）
CREATE POLICY "公开头像可访问"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 策略 6: 用户只能上传自己的头像（avatars 桶）
CREATE POLICY "用户只能上传自己的头像"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 7: 用户只能更新自己的头像（avatars 桶）
CREATE POLICY "用户只能更新自己的头像"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 8: 用户只能删除自己的头像（avatars 桶）
CREATE POLICY "用户只能删除自己的头像"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ==================== 辅助函数 ====================
-- 获取文件的公共 URL（用于公开桶）
CREATE OR REPLACE FUNCTION get_storage_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- ==================== 注释 ====================
COMMENT ON POLICY "用户只能访问自己的媒体文件" ON storage.objects IS 
'用户只能访问 diary-media 桶中自己文件夹下的文件，路径格式：{user_id}/{year}/{month}/{filename}';

COMMENT ON POLICY "用户只能上传到自己的文件夹" ON storage.objects IS 
'用户只能上传文件到 diary-media 桶中自己的文件夹';

COMMENT ON POLICY "用户只能更新自己的媒体文件" ON storage.objects IS 
'用户只能更新 diary-media 桶中自己的文件';

COMMENT ON POLICY "用户只能删除自己的媒体文件" ON storage.objects IS 
'用户只能删除 diary-media 桶中自己的文件';

-- ==================== 使用说明 ====================
-- 1. 在 Supabase 控制台创建存储桶：
--    - 存储桶名称: diary-media
--    - 是否公开: 否（私有）
--    - 文件大小限制: 50MB
--    - 允许的 MIME 类型: image/*, video/*
--
-- 2. 文件路径结构：
--    - 用户媒体: {user_id}/{year}/{month}/{filename}
--      示例: a1b2c3d4-e5f6-7890-abcd-ef1234567890/2025/01/image.jpg
--    - 用户头像: {user_id}/{filename}
--      示例: a1b2c3d4-e5f6-7890-abcd-ef1234567890/avatar.jpg
--
-- 3. 获取文件 URL：
--    - 公开桶（avatars）: 使用 getPublicUrl()
--    - 私有桶（diary-media）: 使用 getSignedUrl() 或 createSignedUrl()
--
-- 4. 在代码中使用：
--    - 上传文件: db.storage.uploadFile('diary-media', filePath, file)
--    - 获取公共 URL: STORAGE_PATHS.getPublicUrl('avatars', filePath)
--    - 获取签名 URL: await STORAGE_PATHS.getSignedUrl('diary-media', filePath)

SELECT 'Storage RLS 策略配置完成！请在 Supabase 控制台创建 diary-media 和 avatars 存储桶' AS status;
