-- 日记系统数据库迁移脚本（根据实际功能修正版）
-- 版本: 2.1.0
-- 描述: 根据网站实际功能需求修正，适配 auth.users.id 为 BIGINT 的实例
-- 修正日期: 2025-01-31

-- 启用UUID扩展（用于生成日记ID等）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 用户配置文件表 ====================
-- 注意：代码中实际使用了 user_profiles 表（AuthContext.jsx）
-- 此表与 auth.users 关联，存储用户扩展信息
-- 重要：根据最新错误信息，auth.users.id 是 UUID 类型（不是 BIGINT）
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户配置文件策略：用户只能访问自己的数据
-- 注意：auth.uid() 返回 UUID，直接比较即可
DROP POLICY IF EXISTS "用户只能访问自己的个人信息" ON user_profiles;
CREATE POLICY "用户只能访问自己的个人信息"
    ON user_profiles
    FOR ALL
    USING (auth.uid() = id);

-- 用户配置文件策略：任何人都可以读取用户的基本信息（用于显示用户名等）
DROP POLICY IF EXISTS "任何人都可以读取用户基本信息" ON user_profiles;
CREATE POLICY "任何人都可以读取用户基本信息"
    ON user_profiles
    FOR SELECT
    USING (true);

-- 为用户配置文件表添加索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- ==================== 用户表 ====================
-- 用于扩展的用户信息（如果代码中需要使用 users 表）
-- 注意：根据实际代码，主要使用 user_profiles，但保留此表以防万一
-- 如果 auth.users.id 是 BIGINT，这里需要匹配
-- 但由于我们主要使用 user_profiles，这里先创建兼容版本
-- 如果确认不使用，可以删除此表

-- 检查 auth.users.id 的实际类型（如果是 bigint，取消下面注释并注释掉 UUID 版本）
/*
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/

-- UUID 版本（根据最新错误信息，auth.users.id 是 UUID）
-- 先删除可能存在的错误版本
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为用户表添加索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户表策略：用户只能访问自己的数据
-- 注意：auth.users.id 是 UUID，直接比较即可
DROP POLICY IF EXISTS "用户只能访问自己的数据" ON users;
CREATE POLICY "用户只能访问自己的数据" ON users
    FOR ALL USING (auth.uid() = id);

-- ==================== 日记表 ====================
-- 使用JSONB存储整个日记结构，简化数据模型
-- 根据最新错误信息，auth.users.id 是 UUID，所以这里使用 UUID

-- 先删除可能存在的错误表
DROP TABLE IF EXISTS diaries CASCADE;

-- 创建日记表
-- 注意：user_id 类型匹配 auth.users.id（UUID）
CREATE TABLE IF NOT EXISTS diaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    cover TEXT, -- 封面图片URL
    
    -- 使用JSONB存储整个日记的blocks数组
    blocks JSONB DEFAULT '[]'::JSONB,
    
    -- 元数据
    metadata JSONB DEFAULT '{}'::JSONB, -- 存储额外信息（如天气、心情等）
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 每个用户每天只能有一篇日记
    UNIQUE(user_id, date)
);

-- blocks JSONB结构示例：
-- [
--   {
--     "id": "uuid",
--     "title": "标题",
--     "content": "内容",
--     "media": [
--       {
--         "url": "https://...",
--         "type": "image",
--         "thumbnail": "https://..."
--       }
--     ],
--     "cover": "https://...",
--     "categories": ["美食", "旅行"],
--     "status": {
--       "icon": "😊",
--       "label": "开心",
--       "description": "今天很开心"
--     },
--     "location": "上海"
--   }
-- ]

-- 为日记表添加索引
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(date);
CREATE INDEX IF NOT EXISTS idx_diaries_user_date ON diaries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at);

-- 为JSONB字段创建GIN索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_diaries_blocks ON diaries USING GIN(blocks);
CREATE INDEX IF NOT EXISTS idx_diaries_metadata ON diaries USING GIN(metadata);

-- 启用RLS
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 日记表策略：用户只能访问自己的日记
-- 注意：auth.users.id 是 UUID，直接比较即可
DROP POLICY IF EXISTS "用户只能访问自己的日记" ON diaries;
CREATE POLICY "用户只能访问自己的日记" ON diaries
    FOR ALL USING (auth.uid() = user_id);

-- ==================== 分类表（系统预设分类）====================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    icon TEXT,
    is_system BOOLEAN DEFAULT true, -- 系统预设为true
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入系统默认分类
INSERT INTO categories (name, description, color, icon, is_system) 
VALUES
    ('日常', '日常生活记录', '#A8A29E', '📝', true),
    ('美食', '美食体验', '#C97A63', '🍔', true),
    ('旅行', '旅行游记', '#D4A574', '✈️', true),
    ('玩乐', '娱乐活动', '#B085D6', '🎮', true),
    ('自己', '个人成长', '#8EA1B8', '🧘', true),
    ('朋友', '朋友聚会', '#7FB28B', '👥', true),
    ('家人', '家庭生活', '#9F8268', '👨‍👩‍👧', true),
    ('宠物', '宠物日常', '#CCAA66', '🐶', true),
    ('情侣', '恋爱关系', '#D48C8C', '💑', true),
    ('风景', '自然风光', '#7FA6A8', '🏞️', true),
    ('学习', '学习笔记', '#7C8C6E', '📚', true),
    ('工作', '工作相关', '#8B7355', '💼', true),
    ('运动', '体育锻炼', '#6BA58C', '🏃', true),
    ('作品', '创作作品', '#B78C6C', '🎨', true)
ON CONFLICT (name) DO NOTHING;

-- 分类表公开可读（系统分类）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "分类表公开可读" ON categories;
CREATE POLICY "分类表公开可读" ON categories
    FOR SELECT USING (true);

-- ==================== 用户自定义分类表（可选）====================
-- 先删除可能存在的错误表
DROP TABLE IF EXISTS user_categories CASCADE;

CREATE TABLE IF NOT EXISTS user_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON user_categories(user_id);

-- 启用RLS
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- 用户分类策略：用户只能访问自己的分类
-- 注意：auth.users.id 是 UUID，直接比较即可
DROP POLICY IF EXISTS "用户只能访问自己的分类" ON user_categories;
CREATE POLICY "用户只能访问自己的分类" ON user_categories
    FOR ALL USING (auth.uid() = user_id);

-- ==================== 触发器函数 ====================
-- 自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为用户配置文件表创建触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为用户表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为日记表创建触发器
DROP TRIGGER IF EXISTS update_diaries_updated_at ON diaries;
CREATE TRIGGER update_diaries_updated_at
    BEFORE UPDATE ON diaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== 自动创建用户配置文件触发器 ====================
-- 当 auth.users 有新用户时自动创建 user_profiles 记录
-- 注意：auth.users.id 是 UUID 类型
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,  -- UUID 类型，直接使用
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING; -- 如果已存在则跳过
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== 辅助函数 ====================
-- 获取用户某个月的所有日记
CREATE OR REPLACE FUNCTION get_user_diaries_by_month(
    p_user_id UUID, -- UUID 类型
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    id UUID,
    date DATE,
    title TEXT,
    cover TEXT,
    blocks JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.date,
        d.title,
        d.cover,
        d.blocks,
        d.created_at
    FROM diaries d
    WHERE d.user_id = p_user_id
        AND EXTRACT(YEAR FROM d.date) = p_year
        AND EXTRACT(MONTH FROM d.date) = p_month
    ORDER BY d.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户某一年的所有日记
CREATE OR REPLACE FUNCTION get_user_diaries_by_year(
    p_user_id UUID, -- UUID 类型
    p_year INTEGER
)
RETURNS TABLE (
    id UUID,
    date DATE,
    title TEXT,
    cover TEXT,
    blocks JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.date,
        d.title,
        d.cover,
        d.blocks,
        d.created_at
    FROM diaries d
    WHERE d.user_id = p_user_id
        AND EXTRACT(YEAR FROM d.date) = p_year
    ORDER BY d.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== 注释 ====================
COMMENT ON TABLE user_profiles IS '用户个人信息表（与auth.users关联），代码中实际使用此表';
COMMENT ON TABLE users IS '用户信息扩展表（备用）';
COMMENT ON TABLE diaries IS '日记主表，使用JSONB存储灵活的blocks结构';
COMMENT ON TABLE categories IS '系统预设分类表';
COMMENT ON TABLE user_categories IS '用户自定义分类表';

COMMENT ON COLUMN diaries.blocks IS '日记内容块数组，存储标题、内容、媒体、分类等信息';
COMMENT ON COLUMN diaries.metadata IS '日记元数据，存储天气、心情等额外信息';
COMMENT ON COLUMN diaries.cover IS '日记封面图URL';
COMMENT ON COLUMN diaries.user_id IS '用户ID（UUID类型，匹配auth.users.id）';

-- ==================== 完成提示 ====================
SELECT '数据库迁移完成！已根据实际功能需求修正，使用 UUID 类型匹配 auth.users.id' AS status;

