-- 日记媒体文件元数据表
-- 版本: 1.0.0
-- 描述: 存储用户上传的媒体文件信息，与日记关联

-- 先删除可能存在的旧表
DROP TABLE IF EXISTS diary_media CASCADE;

-- 创建日记媒体表
CREATE TABLE IF NOT EXISTS diary_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diary_id UUID REFERENCES diaries(id) ON DELETE CASCADE,

    -- 文件信息
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- 存储桶中的完整路径
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,

    -- 媒体类型和元数据
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- 视频时长（秒）
    thumbnail_path TEXT, -- 缩略图路径

    -- 存储信息
    storage_bucket TEXT NOT NULL DEFAULT 'diary-media',
    is_public BOOLEAN NOT NULL DEFAULT FALSE,

    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    UNIQUE(user_id, file_path)
);

-- 为日记媒体表添加索引
CREATE INDEX IF NOT EXISTS idx_diary_media_user_id ON diary_media(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_media_diary_id ON diary_media(diary_id);
CREATE INDEX IF NOT EXISTS idx_diary_media_created_at ON diary_media(created_at);
CREATE INDEX IF NOT EXISTS idx_diary_media_media_type ON diary_media(media_type);

-- 启用行级安全
ALTER TABLE diary_media ENABLE ROW LEVEL SECURITY;

-- 策略 1: 用户只能访问自己的媒体文件
DROP POLICY IF EXISTS "用户只能访问自己的媒体文件" ON diary_media;
CREATE POLICY "用户只能访问自己的媒体文件" ON diary_media
    FOR ALL USING (auth.uid() = user_id);

-- 策略 2: 任何人都可以读取公开的媒体文件（如果 is_public = true）
DROP POLICY IF EXISTS "公开媒体文件可访问" ON diary_media;
CREATE POLICY "公开媒体文件可访问" ON diary_media
    FOR SELECT USING (is_public = true);

-- 为日记媒体表创建更新触发器
DROP TRIGGER IF EXISTS update_diary_media_updated_at ON diary_media;
CREATE TRIGGER update_diary_media_updated_at
    BEFORE UPDATE ON diary_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 注释
COMMENT ON TABLE diary_media IS '日记媒体文件元数据表，存储用户上传的文件信息';
COMMENT ON COLUMN diary_media.file_path IS '文件在存储桶中的完整路径，格式：users/{user_id}/{year}/{month}/{filename}';
COMMENT ON COLUMN diary_media.thumbnail_path IS '缩略图路径（用于视频和需要缩略图的图片）';

SELECT '日记媒体表创建完成！' AS status;
