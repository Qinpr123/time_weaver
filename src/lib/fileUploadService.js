import { addMedia } from './localStore';

class FileUploadService {
  absoluteMaxSize = 500 * 1024 * 1024;
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
  validateFile(file) {
    const errors = [];
    if (!this.allowedTypes.includes(file.type)) errors.push({ code: 'invalid-type', message: '请选择 JPG、PNG、GIF、WebP、MP4、MOV 或 WebM 文件。' });
    if (file.size > this.absoluteMaxSize) errors.push({ code: 'file-too-large', message: '文件超过 500MB，无法保存到浏览器。' });
    return errors.length ? errors : null;
  }
  async uploadFile(file, _userId, _date, { onProgress } = {}) {
    const errors = this.validateFile(file);
    if (errors) throw new Error(errors.map(item => item.message).join(' '));
    onProgress?.(10);
    const saved = await addMedia(file);
    if (saved.type === 'video') {
      try {
        const thumbnail = await new Promise((resolve, reject) => {
          const video = document.createElement('video');
          const url = URL.createObjectURL(file);
          const finish = (value, error) => { URL.revokeObjectURL(url); video.removeAttribute('src'); video.load(); error ? reject(error) : resolve(value); };
          const timer = setTimeout(() => finish(null, new Error('视频预览超时')), 7000);
          video.muted = true;
          video.preload = 'metadata';
          video.onloadeddata = () => { video.currentTime = Math.min(0.2, Math.max(0, video.duration - 0.1)); };
          video.onseeked = () => {
            clearTimeout(timer);
            const canvas = document.createElement('canvas');
            const ratio = Math.min(1, 800 / Math.max(video.videoWidth, video.videoHeight));
            canvas.width = Math.max(1, Math.round(video.videoWidth * ratio));
            canvas.height = Math.max(1, Math.round(video.videoHeight * ratio));
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => blob ? finish(blob) : finish(null, new Error('无法提取视频画面')), 'image/jpeg', 0.8);
          };
          video.onerror = () => { clearTimeout(timer); finish(null, new Error('无法读取视频')); };
          video.src = url;
        });
        const thumb = await addMedia(new File([thumbnail], `${file.name}-preview.jpg`, { type: 'image/jpeg' }));
        saved.thumbnail = thumb.url;
      } catch { saved.thumbnail = `${import.meta.env.BASE_URL}activities/undraw_images_v4j9.png`; }
    }
    onProgress?.(100);
    return saved;
  }
  async uploadFiles(files, userId, date, options = {}) {
    const results = [], errors = [];
    for (let i = 0; i < files.length; i++) {
      try { results.push(await this.uploadFile(files[i], userId, date, { onProgress: value => options.onFileProgress?.(i, value) })); }
      catch (error) { errors.push({ file: files[i].name, error: error.message }); }
    }
    options.onComplete?.(results, errors);
    return { results, errors };
  }
  async checkNetworkStatus() { return { online: true, message: '本机存储可用' }; }
}
export const fileUploadService = new FileUploadService();
export default fileUploadService;
