// Durable records contain local-media:<id>, never a session-scoped blob URL.
const DATABASE = 'timeweaver-local-v1';
const STORES = ['diaries', 'media', 'settings'];
const PREFIX = 'local-media:';
let databasePromise;
const urls = new Map();
const references = new Map();

function openDatabase() {
  if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      for (const name of STORES) request.result.createObjectStore(name, { keyPath: name === 'diaries' ? 'date' : 'id' });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); databasePromise = undefined; };
      resolve(request.result);
    };
    request.onerror = () => { databasePromise = undefined; reject(request.error); };
    request.onblocked = () => { databasePromise = undefined; reject(new Error('请关闭其他时光织语页面后重试。')); };
  });
  return databasePromise;
}

export async function transaction(names, mode, action) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(names, mode);
    let result;
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('本机存储失败，请检查可用空间。'));
    try { result = action(tx); } catch (error) { tx.abort(); reject(error); }
  });
}

async function all(name) {
  let result;
  await transaction([name], 'readonly', tx => {
    tx.objectStore(name).getAll().onsuccess = event => { result = event.target.result; };
  });
  return result;
}

function mediaUrl(record) {
  if (!urls.has(record.id)) {
    const url = URL.createObjectURL(record.blob);
    urls.set(record.id, url);
    references.set(url, PREFIX + record.id);
  }
  return urls.get(record.id);
}

function transform(value, mapString) {
  if (typeof value === 'string') return mapString(value);
  if (Array.isArray(value)) return value.map(item => transform(item, mapString));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([key, entry]) => key !== 'file' && entry !== undefined)
    .map(([key, entry]) => [key, transform(entry, mapString)]));
  return value;
}

export function serializeDiary(diary) {
  return transform(diary, value => {
    if (references.has(value)) return references.get(value);
    if (value.startsWith('blob:')) throw new Error('照片尚未保存或已失效，请重新添加后再保存。');
    return value;
  });
}

export async function readDiaries() {
  const [diaries, media] = await Promise.all([all('diaries'), all('media')]);
  media.forEach(mediaUrl);
  return diaries.map(diary => transform(diary, value => {
    if (!value.startsWith(PREFIX)) return value;
    const url = urls.get(value.slice(PREFIX.length));
    if (!url) throw new Error('日记引用的本地媒体缺失，请从完整备份恢复。');
    return url;
  }));
}

export async function putDiary(diary) {
  if (diary.blocks?.some(block => block.media?.some(media => media?.uploading))) {
    throw new Error('照片还在处理中，请等待完成或移除失败的照片。');
  }
  const record = serializeDiary(diary);
  await transaction(['diaries'], 'readwrite', tx => tx.objectStore('diaries').put(record));
  return diary;
}

export async function removeDiary(date) {
  await transaction(['diaries'], 'readwrite', tx => tx.objectStore('diaries').delete(date));
}

export async function addMedia(file) {
  const record = { id: crypto.randomUUID(), blob: file, name: file.name, mimeType: file.type, size: file.size };
  await transaction(['media'], 'readwrite', tx => tx.objectStore('media').add(record));
  const url = mediaUrl(record);
  return { id: record.id, mediaId: record.id, url, thumbnail: file.type.startsWith('image/') ? url : null,
    type: file.type.startsWith('video/') ? 'video' : 'image', fileName: file.name, fileSize: file.size, mimeType: file.type };
}

export async function getSetting(id) { return (await all('settings')).find(row => row.id === id)?.value; }
export async function setSetting(id, value) {
  await transaction(['settings'], 'readwrite', tx => tx.objectStore('settings').put({ id, value }));
}

const toDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

export async function createBackup() {
  // Read all stores in one transaction so metadata and media are a consistent snapshot.
  const data = {};
  await transaction(STORES, 'readonly', tx => {
    for (const name of STORES) tx.objectStore(name).getAll().onsuccess = event => { data[name] = event.target.result; };
  });
  const used = new Set();
  transform(data.diaries, value => { if (value.startsWith(PREFIX)) used.add(value.slice(PREFIX.length)); return value; });
  const media = [];
  for (const item of data.media.filter(item => used.has(item.id))) {
    const { blob, ...metadata } = item;
    media.push({ ...metadata, data: await toDataUrl(blob) });
  }
  return { format: 'timeweaver', version: 1, createdAt: new Date().toISOString(), diaries: data.diaries, media, settings: data.settings };
}

export function validateBackup(backup) {
  if (backup?.format !== 'timeweaver' || backup.version !== 1 || !Array.isArray(backup.diaries) || !Array.isArray(backup.media) || !Array.isArray(backup.settings)) {
    throw new Error('不是受支持的时光织语完整备份。');
  }
  const ids = new Set();
  for (const media of backup.media) {
    if (!media.id || ids.has(media.id) || typeof media.data !== 'string' || !/^data:(image|video)\/[\w.+-]+;base64,/.test(media.data)) throw new Error('备份媒体格式无效或存在重复。');
    ids.add(media.id);
  }
  const dates = new Set();
  for (const diary of backup.diaries) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(diary.date) || dates.has(diary.date) || !Array.isArray(diary.blocks) || typeof diary.title !== 'string') throw new Error('日记格式或日期无效。');
    if (new Date(diary.date + 'T12:00:00Z').toISOString().slice(0, 10) !== diary.date) throw new Error('备份日期无效。');
    dates.add(diary.date);
    for (const block of diary.blocks) {
      if (!block || typeof block !== 'object' || (block.media !== undefined && !Array.isArray(block.media)) || (block.content !== undefined && typeof block.content !== 'string') || (block.categories !== undefined && !Array.isArray(block.categories))) throw new Error('内容块格式无效。');
    }
  }
  transform(backup.diaries, value => {
    if (value.startsWith('blob:') || (value.startsWith(PREFIX) && !ids.has(value.slice(PREFIX.length)))) throw new Error('备份包含失效或缺失的媒体。');
    if (/^(javascript|file):/i.test(value)) throw new Error('备份包含不支持的资源地址。');
    return value;
  });
  return { diaries: backup.diaries.length, media: backup.media.length };
}

export async function restoreBackup(backup) {
  validateBackup(backup);
  const replacements = new Map(backup.media.map(item => [item.id, crypto.randomUUID()]));
  const media = backup.media.map(item => {
    const base64 = item.data.slice(item.data.indexOf(',') + 1);
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    const mimeType = item.data.slice(5, item.data.indexOf(';'));
    return { id: replacements.get(item.id), name: item.name, mimeType, size: bytes.length, blob: new Blob([bytes], { type: mimeType }) };
  });
  const diaries = backup.diaries.map(diary => transform(diary, value => {
    if (value.startsWith(PREFIX)) return PREFIX + replacements.get(value.slice(PREFIX.length));
    return replacements.get(value) || value;
  }));
  let imported = 0;
  let skipped = 0;
  await transaction(STORES, 'readwrite', tx => {
    const store = tx.objectStore('diaries');
    const used = new Set();
    store.getAll().onsuccess = event => {
      const existing = new Map(event.target.result.map(item => [item.date, item]));
      for (const diary of diaries) {
        const current = existing.get(diary.date);
        // A fresh install contains bundled examples. A restored personal entry
        // should reclaim the same date, while two personal entries still never
        // overwrite one another.
        if (current && !(current.isSample && !diary.isSample)) { skipped++; continue; }
        if (current) store.delete(diary.date);
        store.add(diary); imported++;
        transform(diary, value => { if (value.startsWith(PREFIX)) used.add(value.slice(PREFIX.length)); return value; });
      }
      for (const item of media) if (used.has(item.id)) tx.objectStore('media').add(item);
      // Only restore app-owned preferences, never arbitrary storage keys.
      for (const setting of backup.settings) if (setting.id === 'categories' && Array.isArray(setting.value) && setting.value.every(v => typeof v === 'string')) {
        const settings = tx.objectStore('settings');
        settings.get(setting.id).onsuccess = e => { if (!e.target.result) settings.put(setting); };
      }
    };
  });
  return { imported, skipped };
}

// Explicit maintenance only: never delete media merely to make room for new files.
export async function cleanUnusedMedia() {
  let removed = 0;
  await transaction(['diaries', 'media'], 'readwrite', tx => {
    tx.objectStore('diaries').getAll().onsuccess = event => {
      const used = new Set();
      transform(event.target.result, value => { if (value.startsWith(PREFIX)) used.add(value.slice(PREFIX.length)); return value; });
      tx.objectStore('media').openCursor().onsuccess = e => {
        const cursor = e.target.result;
        if (!cursor) return;
        if (!used.has(cursor.key)) { cursor.delete(); removed++; }
        cursor.continue();
      };
    };
  });
  return removed;
}
