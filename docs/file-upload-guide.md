# 前端文件上传功能指南

## 概述

本指南详细介绍了前端图片和视频文件的上传、存储和读取功能，使用Supabase客户端SDK与后端diary-media存储桶建立安全连接。

## 功能特性

### 核心功能
- ✅ 图片和视频文件上传
- ✅ 安全的Supabase存储桶连接
- ✅ 用户认证和权限控制
- ✅ 响应式设计（桌面端和移动端）
- ✅ 错误处理和用户友好提示
- ✅ 文件验证和格式检查
- ✅ 上传进度显示
- ✅ 断点续传支持
- ✅ 并发控制
- ✅ 本地存储后备方案

### 安全特性
- 🔒 基于用户ID的文件隔离
- 🔒 RLS（行级安全）策略
- 🔒 安全的CORS配置
- 🔒 文件访问审计
- 🔒 定期清理机制

## 配置要求

### 环境变量
在 `.env` 文件中配置以下变量：

```env
# Supabase配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 可选：nocode Function上传端点
VITE_NOCODE_FUNCTION_UPLOAD=https://your-project.supabase.co/functions/v1/storage-upload

# 可选：本地存储模式
VITE_USE_LOCAL_STORAGE=false
```

### Supabase存储桶配置

1. **创建存储桶**
   - 登录 Supabase Dashboard
   - 进入 Storage 页面
   - 创建名为 `diary-media` 的存储桶
   - 设置：私有桶，文件大小限制50MB，允许的MIME类型：`image/*, video/*`

2. **配置CORS策略**
   - 在存储桶设置中添加以下CORS配置：
   ```json
   [
     {
       "origin": ["http://localhost:5173", "http://localhost:3000", "https://yourdomain.com"],
       "methods": ["GET", "POST", "PUT", "DELETE"],
       "headers": ["Authorization", "Content-Type", "x-client-info"],
       "maxAgeSeconds": 86400
     }
   ]
   ```

3. **执行数据库迁移**
   - 运行 `002_storage_setup.sql` - 存储桶RLS策略
   - 运行 `003_diary_media_table.sql` - 媒体文件元数据表
   - 运行 `004_storage_cors_and_cleanup.sql` - CORS和清理机制

## 使用方式

### 1. 基本文件上传

```jsx
import MediaUploader from '../components/MediaUploader';

function MyComponent() {
  const handleUploadComplete = (files) => {
    console.log('上传成功:', files);
  };

  const handleUploadError = (errors) => {
    console.error('上传失败:', errors);
  };

  return (
    <MediaUploader
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      maxFiles={10}
    />
  );
}
```

### 2. 媒体展示

```jsx
import MediaGallery from '../components/MediaGallery';

function MyComponent() {
  const media = [
    { type: 'image', url: 'image-url', thumbnail: 'thumbnail-url' },
    { type: 'video', url: 'video-url', thumbnail: 'video-thumbnail' }
  ];

  return (
    <MediaGallery
      media={media}
      maxColumns={4}
      showControls={true}
    />
  );
}
```

### 3. 直接使用文件上传服务

```javascript
import fileUploadService from '../lib/fileUploadService';

// 单个文件上传
const result = await fileUploadService.uploadFile(
  file,
  userId,
  date,
  {
    onProgress: (progress) => console.log(`进度: ${progress}%`),
    useFunction: true,
    extractThumbnail: true
  }
);

// 批量上传
const { results, errors } = await fileUploadService.uploadFiles(
  files,
  userId,
  date,
  {
    onFileProgress: (index, progress) => console.log(`文件${index}: ${progress}%`),
    onComplete: (results, errors) => console.log('批量上传完成')
  }
);
```

## 错误处理

### 常见错误类型

| 错误代码 | 描述 | 解决方案 |
|---------|------|----------|
| `invalid-type` | 不支持的文件格式 | 检查文件类型，支持JPG、PNG、GIF、WebP、MP4、MOV等 |
| `file-too-large` | 文件大小超过限制 | 文件大小限制为50MB |
| `network-error` | 网络连接失败 | 检查网络连接，自动切换到本地存储 |
| `bucket-not-found` | 存储桶不存在 | 在Supabase控制台创建存储桶 |
| `permission-denied` | 权限不足 | 检查用户认证和RLS策略 |

### 错误处理示例

```javascript
try {
  const result = await fileUploadService.uploadFile(file, userId, date);
} catch (error) {
  if (error.message.includes('network')) {
    // 网络错误处理
    showNetworkError();
  } else if (error.message.includes('bucket')) {
    // 存储桶错误处理
    showBucketError();
  } else {
    // 其他错误处理
    showGenericError(error.message);
  }
}
```

## 性能优化

### 1. 文件分片上传
- 大文件自动分片上传（5MB分片）
- 支持断点续传
- 并发控制（最大3个并发上传）

### 2. 缩略图优化
- 视频自动提取第一帧作为缩略图
- 图片使用WebP格式压缩
- 懒加载和渐进式加载

### 3. 缓存策略
- 使用浏览器缓存存储已上传文件
- 本地存储后备方案
- CDN加速（如果配置）

## 测试和监控

### 运行功能测试

```javascript
import fileUploadTest from '../lib/fileUploadTest';

// 完整测试套件
const results = await fileUploadTest.runFullTest(userId, testFile);
console.log('测试结果:', results);

// 性能基准测试
const benchmark = await fileUploadTest.runPerformanceBenchmark(
  userId,
  testFiles,
  5 // 迭代次数
);

// 生成测试报告
const report = fileUploadTest.generateTestReport(results);
```

### 监控指标

- 上传成功率
- 平均上传时间
- 文件完整性
- 存储使用情况
- 错误率统计

## 安全考虑

### 1. 认证和授权
- 所有文件操作都需要用户认证
- 基于用户ID的文件路径隔离
- RLS策略确保用户只能访问自己的文件

### 2. 文件验证
- MIME类型验证
- 文件大小限制
- 文件名安全检查
- 病毒扫描（如果配置）

### 3. 访问控制
- 私有存储桶配置
- 签名URL访问
- 访问时间限制
- 审计日志记录

## 故障排除

### 常见问题

1. **上传失败，显示"存储桶不存在"**
   - 检查Supabase控制台是否创建了`diary-media`存储桶
   - 验证存储桶名称拼写

2. **权限错误（403）**
   - 检查用户是否已登录
   - 验证RLS策略配置
   - 检查文件路径格式

3. **网络连接失败**
   - 检查网络连接
   - 验证Supabase服务状态
   - 启用本地存储后备方案

4. **文件格式不支持**
   - 检查文件MIME类型
   - 验证存储桶允许的文件类型
   - 检查文件扩展名

### 调试工具

使用浏览器开发者工具：
- 网络标签页查看上传请求
- 控制台查看错误信息
- 应用标签页查看本地存储

## 扩展功能

### 自定义文件处理器
```javascript
class CustomFileProcessor {
  async processFile(file) {
    // 自定义文件处理逻辑
    return processedFile;
  }
}
```

### 第三方存储集成
```javascript
class CloudStorageAdapter {
  async upload(file) {
    // 集成其他云存储服务
  }
}
```

## 版本历史

- v1.0.0 (2024-01-01): 初始版本发布
  - 基础文件上传功能
  - Supabase存储桶集成
  - 响应式界面设计
  - 错误处理机制

## 支持

如有问题，请参考：
- [Supabase文档](https://supabase.com/docs)
- [项目GitHub仓库](https://github.com/your-repo)
- [问题反馈](https://github.com/your-repo/issues)
