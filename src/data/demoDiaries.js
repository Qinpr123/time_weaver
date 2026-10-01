import sampleDiaries from './sampleDiaries';

// A curated month shows the core diary formats without making every calendar
// day look like a repeated photo card.
export const DEMO_INITIAL_DATE = new Date(2026, 8, 1);
const SHOWCASE_DATES = new Set(['01', '02', '03', '04', '08', '10', '11', '12', '15', '18', '20', '21', '22', '23', '29', '30']);

// Keep the rich photo set used by the original calendar demo. The dates move
// to September 2026 so an interviewer opens the app directly into completed work.
const base = import.meta.env.BASE_URL;
const localPhoto = name => `${base}demo-photos/${name}`;
const warmDiaryPhoto = localPhoto('warm-diary.jpg');

// Text-only pages use distinct, bundled covers so every visible calendar tile
// remains meaningful without relying on the retired image-search endpoint.
const TEXT_ONLY_COVERS = {
  '2026-09-01': warmDiaryPhoto,
  '2026-09-03': warmDiaryPhoto,
  '2026-09-12': warmDiaryPhoto,
  '2026-09-30': warmDiaryPhoto
};

// One local photo is assigned to each attachment slot. A day with multiple
// pictures always gets different files before any file is reused elsewhere.
const LOCAL_MEDIA_BY_DATE = {
  '2026-09-02': ['forest.jpg', 'mountain.jpg'],
  '2026-09-04': ['city-street.jpg', 'city-evening.jpg', 'art-gallery.jpg', 'artwork.jpg', 'coffee-shop.jpg', 'dinner.jpg', 'bookshelf.jpg'],
  '2026-09-08': ['art-gallery.jpg', 'artwork.jpg', 'bookshelf.jpg', 'city-evening.jpg', 'dinner.jpg', 'coffee-shop.jpg', 'forest.jpg', 'mountain.jpg'],
  '2026-09-10': ['library.jpg'],
  '2026-09-11': ['city-evening.jpg', 'artwork.jpg', 'city-street.jpg'],
  '2026-09-15': ['salad.jpg'],
  '2026-09-18': ['beach.jpg', 'swimming.jpg', 'mountain.jpg'],
  '2026-09-20': ['dinner.jpg'],
  '2026-09-21': ['mural.jpg'],
  '2026-09-22': ['forest.jpg', 'mountain.jpg'],
  '2026-09-23': ['seedlings.jpg', 'forest.jpg', 'coffee-shop.jpg'],
  '2026-09-29': ['coffee.jpg']
};

const SEPTEMBER_COPY = {
  '2026-09-01': {
    title: '九月的第一天',
    content: '九月开始了，天气渐渐转凉。今天决定开始记录每天的点点滴滴，希望能坚持下来。'
  },
  '2026-09-30': {
    title: '九月回顾',
    content: '九月已经快结束了，这段时间经历了很多事情。从月初的新开始，到中间的各种活动，再到现在的平静，每一天都值得珍藏。'
  }
};

export const DEMO_SEED_VERSION = '2026-09-local-photo-showcase-v5';

export const demoDiaries = Object.fromEntries(Object.entries(sampleDiaries).flatMap(([oldDate, source]) => {
  const day = oldDate.slice(-2);
  if (!SHOWCASE_DATES.has(day)) return [];
  const date = oldDate.replace(/^2025-10-/, '2026-09-');
  const copyOverride = SEPTEMBER_COPY[date];
  const sourceCopy = copyOverride ? {
    ...source,
    title: copyOverride.title,
    blocks: source.blocks.map((block, index) => index === 0 ? { ...block, content: copyOverride.content } : block)
  } : source;
  const localMedia = LOCAL_MEDIA_BY_DATE[date] || [];
  let mediaIndex = 0;
  const blocks = (sourceCopy.blocks || []).map((block, index) => {
    const media = block.media?.map(item => {
      const assetIndex = mediaIndex++;
      const photo = localPhoto(localMedia[assetIndex % localMedia.length]);
      // Keep the video case in the demo while making its poster stable locally.
      return item.type === 'video' ? { ...item, thumbnail: photo } : { ...item, url: photo, thumbnail: undefined };
    });
    return {
      ...block,
      media,
      cover: media?.length ? (media[0].thumbnail || media[0].url) : index === 0 ? TEXT_ONLY_COVERS[date] : undefined
    };
  });
  return [[date, {
    ...sourceCopy,
    id: `demo-${date}`,
    date,
    blocks,
    isSample: true,
    createdAt: sourceCopy.createdAt?.replace(/^2025-10-/, '2026-09-'),
    updatedAt: sourceCopy.updatedAt?.replace(/^2025-10-/, '2026-09-')
  }]];
}));

export default demoDiaries;
