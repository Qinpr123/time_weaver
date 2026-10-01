import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, HardDrive } from 'lucide-react';
import { createBackup, validateBackup, restoreBackup, cleanUnusedMedia } from '../lib/localStore';
import { useDiary } from '../contexts/DiaryContext';

export default function Profile() {
  const navigate = useNavigate();
  const input = useRef(null);
  const { refreshDiaries } = useDiary();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const download = async () => {
    setBusy(true); setMessage('');
    try {
      const data = await createBackup();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `timeweaver-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setMessage(`备份已生成：${data.diaries.length} 篇日记、${data.media.length} 个本地媒体。请妥善保存文件。`);
    } catch (error) { setMessage(`备份失败：${error.message}`); }
    finally { setBusy(false); }
  };

  const restore = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setMessage('');
    try {
      const data = JSON.parse(await file.text());
      const counts = validateBackup(data);
      if (!window.confirm(`备份包含 ${counts.diaries} 篇日记、${counts.media} 个媒体。将导入本机；已有相同日期会跳过。继续吗？`)) return;
      const result = await restoreBackup(data);
      await refreshDiaries();
      setMessage(`已导入 ${result.imported} 篇，跳过 ${result.skipped} 篇同日期日记。`);
    } catch (error) { setMessage(`恢复失败：${error.message}`); }
    finally { setBusy(false); event.target.value = ''; }
  };

  const cleanup = async () => {
    setBusy(true); setMessage('');
    try { setMessage(`已清理 ${await cleanUnusedMedia()} 个未被日记引用的媒体。`); }
    catch (error) { setMessage(`清理失败：${error.message}`); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-[#F8F6F0] paper-texture text-[#2C2C2C]">
    <header className="bg-white/80 border-b border-[#E7E5E4] sticky top-0 z-10">
      <div className="max-w-3xl mx-auto h-16 px-4 flex items-center gap-4">
        <button aria-label="返回" onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-[#F8F6F0]"><ArrowLeft /></button>
        <h1 className="text-lg font-semibold">本机数据</h1>
      </div>
    </header>
    <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 sm:p-6">
        <div className="flex gap-3 items-start"><HardDrive className="text-[#D4A574] shrink-0" /><div>
          <h2 className="font-semibold">日记保存在当前浏览器</h2>
          <p className="text-sm text-[#6B6B6B] mt-2">清除网站数据、更换浏览器或设备前，请下载完整备份。备份包含照片和视频，可能比较大。</p>
        </div></div>
      </div>
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 sm:p-6 space-y-4">
        <h2 className="font-semibold">完整备份与恢复</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button disabled={busy} onClick={download} className="min-h-11 px-4 py-3 bg-[#D4A574] text-white rounded-lg flex gap-2 items-center justify-center disabled:opacity-50"><Download size={18} />下载完整备份</button>
          <button disabled={busy} onClick={() => input.current?.click()} className="min-h-11 px-4 py-3 border border-[#D4A574] text-[#8B7355] rounded-lg flex gap-2 items-center justify-center disabled:opacity-50"><Upload size={18} />从备份恢复</button>
          <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={restore} />
        </div>
        <p className="text-sm text-[#6B6B6B]">恢复时会跳过已有日期，不会覆盖当前日记。</p>
      </div>
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-5 sm:p-6">
        <h2 className="font-semibold">空间管理</h2>
        <p className="text-sm text-[#6B6B6B] my-3">移除日记中的照片后，可以清理不再被引用的媒体文件。</p>
        <button disabled={busy} onClick={cleanup} className="min-h-11 px-4 py-2 border rounded-lg disabled:opacity-50">清理未使用媒体</button>
      </div>
      {message && <p role="status" className="text-sm bg-white p-4 rounded-lg border border-[#E7E5E4]">{message}</p>}
    </main>
  </div>;
}
