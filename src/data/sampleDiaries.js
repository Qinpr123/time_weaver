// 系统内置示例日记数据 - 使用可靠的在线图片URL
const sampleDiaries = {
  // 1. 纯文字日记 - 简短（短文本 + 底部装饰）
  '2025-10-01': {
    id: '1',
    date: '2025-10-01',
    title: '十月的第一天',
    blocks: [
      {
        id: '1-1',
        title: '新的开始',
        content: '十月开始了，天气渐渐转凉。今天决定开始记录每天的点点滴滴，希望能坚持下来。',
        categories: ['日常'],
        status: { icon: '😊', description: '期待' }
      }
    ],
    createdAt: '2025-10-01T08:30:00Z',
    updatedAt: '2025-10-01T08:30:00Z'
  },

  // 2. 图文并茂 - 单内容块（正常的图文混合）
  '2025-10-02': {
    id: '2',
    date: '2025-10-02',
    title: '秋日公园散步',
    blocks: [
      {
        id: '2-1',
        title: '公园美景',
        content: '今天下午去公园散步，秋天的树叶开始变黄，阳光透过树叶洒在地上，很美。',
        location: '市中心公园',
        categories: ['日常', '风景'],
        status: { icon: '☀️', description: '晴天' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', caption: '公园秋色' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', caption: '落叶小道' }
        ],
        cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-02T16:45:00Z',
    updatedAt: '2025-10-02T16:45:00Z'
  },

  // 3. 多内容块日记（三个块，涵盖工作、美食、学习）
  '2025-10-03': {
    id: '3',
    date: '2025-10-03',
    title: '忙碌的周四',
    blocks: [
      {
        id: '3-1',
        title: '工作会议',
        content: '上午开了两个小时的项目会议，讨论了很多重要的议题。',
        location: '公司会议室',
        categories: ['工作'],
        status: { icon: '💼', description: '工作' }
      },
      {
        id: '3-2',
        title: '午餐时光',
        content: '和同事一起去吃了新开的日料店，味道很不错。',
        location: '商业街日料店',
        categories: ['美食'],
        status: { icon: '🍣', description: '满足' }
      },
      {
        id: '3-3',
        title: '晚间学习',
        content: '晚上在家学习新的编程技术，感觉收获很大。',
        categories: ['学习'],
        status: { icon: '💡', description: '学习' }
      }
    ],
    createdAt: '2025-10-03T21:30:00Z',
    updatedAt: '2025-10-03T21:30:00Z'
  },

  // 4. 纯图片日记 - 大量图片（8张图片的网格布局）
  '2025-10-04': {
    id: '4',
    date: '2025-10-04',
    title: '城市街拍',
    blocks: [
      {
        id: '4-1',
        title: '摄影日',
        content: '捕捉城市的美。',
        location: '城市街道',
        categories: ['作品', '玩乐'],
        status: { icon: '📷', description: '创作' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop', caption: '街头艺术' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?w=800&h=600&fit=crop', caption: '建筑细节' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', caption: '行人' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=600&fit=crop', caption: '街角咖啡店' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop', caption: '黄昏光影' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', caption: '霓虹灯' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop', caption: '城市轮廓' }
        ],
        cover: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-04T19:20:00Z',
    updatedAt: '2025-10-04T19:20:00Z'
  },

  // 5. 纯文字日记 - 极简（只有内容）
  '2025-10-05': {
    id: '5',
    date: '2025-10-05',
    title: '简单的一天',
    blocks: [
      {
        id: '5-1',
        content: '今天没什么特别的事情，就是普通的一天。',
        categories: ['日常']
      }
    ],
    createdAt: '2025-10-05T20:00:00Z',
    updatedAt: '2025-10-05T20:00:00Z'
  },

  // 6. 图文混合 - 中等长度（2张图 + 中等文字）
  '2025-10-06': {
    id: '6',
    date: '2025-10-06',
    title: '周末烘焙',
    blocks: [
      {
        id: '6-1',
        title: '自制面包',
        content: '今天尝试做了全麦面包，虽然外形不太完美，但是味道很不错。发酵的过程需要耐心，但是看到面团慢慢膨胀的感觉很治愈。',
        location: '家里厨房',
        categories: ['美食', '日常'],
        status: { icon: '🥖', description: '成功' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop', caption: '发酵中的面团' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800&h=600&fit=crop', caption: '出炉的面包' }
        ],
        cover: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-06T15:30:00Z',
    updatedAt: '2025-10-06T15:30:00Z'
  },

  // 7. 多内容块 + 多图片（登山主题，3个块）
  '2025-10-07': {
    id: '7',
    date: '2025-10-07',
    title: '登山日记',
    blocks: [
      {
        id: '7-1',
        title: '登山准备',
        content: '一早起来准备登山装备，检查了水、食物和登山杖。',
        categories: ['运动'],
        status: { icon: '🧗', description: '准备' }
      },
      {
        id: '7-2',
        title: '山顶风景',
        content: '登顶后的风景太美了，可以看到整个城市。',
        location: '西山山顶',
        categories: ['旅行', '风景'],
        status: { icon: '🏔️', description: '山顶' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', caption: '山顶全景' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', caption: '云海' }
        ],
        cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop'
      },
      {
        id: '7-3',
        title: '下山途中',
        content: '下山时遇到了一只小松鼠，很可爱。',
        categories: ['旅行'],
        status: { icon: '🐿️', description: '偶遇' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1475627277858-a57e7a5d0e6c?w=800&h=600&fit=crop', caption: '小松鼠' }
        ]
      }
    ],
    createdAt: '2025-10-07T18:45:00Z',
    updatedAt: '2025-10-07T18:45:00Z'
  },

  // 8. 艺术展参观 - 3个内容块，多图展示
  '2025-10-08': {
    id: '8',
    date: '2025-10-08',
    title: '艺术展参观',
    blocks: [
      {
        id: '8-1',
        title: '现代艺术区',
        content: '现代艺术展区的作品很有创意。',
        location: '市美术馆',
        categories: ['玩乐'],
        status: { icon: '🎨', description: '欣赏' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop', caption: '抽象画' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1578912991728-03644c9efbe2?w=800&h=600&fit=crop', caption: '雕塑' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop', caption: '装置艺术' }
        ],
        cover: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
      },
      {
        id: '8-2',
        title: '古典艺术区',
        content: '古典油画区的作品很精美。',
        categories: ['玩乐'],
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop', caption: '肖像画' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1578912991728-03644c9efbe2?w=800&h=600&fit=crop', caption: '风景画' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop', caption: '静物画' }
        ]
      },
      {
        id: '8-3',
        title: '摄影展区',
        content: '摄影作品记录了很多精彩的瞬间。',
        categories: ['作品', '玩乐'],
        status: { icon: '📸', description: '摄影' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?w=800&h=600&fit=crop', caption: '黑白摄影' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', caption: '自然摄影' }
        ]
      }
    ],
    createdAt: '2025-10-08T16:20:00Z',
    updatedAt: '2025-10-08T16:20:00Z'
  },

  // 9. 宠物日常 - 多图拼贴（5张图）
  '2025-10-09': {
    id: '9',
    date: '2025-10-09',
    title: '猫咪日常',
    blocks: [
      {
        id: '9-1',
        content: '今天猫咪很可爱。',
        categories: ['宠物'],
        status: { icon: '🐱', description: '可爱' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop', caption: '睡觉' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c50?w=800&h=600&fit=crop', caption: '玩耍' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=600&fit=crop', caption: '吃饭' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop', caption: '晒太阳' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=800&h=600&fit=crop', caption: '好奇' }
        ],
        cover: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-09T14:10:00Z',
    updatedAt: '2025-10-09T14:10:00Z'
  },

  // 10. 详细文字 + 单张图片（长文本）
  '2025-10-10': {
    id: '10',
    date: '2025-10-10',
    title: '读书笔记',
    blocks: [
      {
        id: '10-1',
        title: '《时间简史》读后感',
        content: '今天读完了《时间简史》，对宇宙的起源和演化有了更深入的理解。霍金用通俗的语言解释了复杂的物理概念，让人对时间和空间的关系有了新的认识。特别对黑洞的部分很感兴趣，那种引力强大到连光都无法逃脱的天体，真是宇宙中最神秘的存在之一。通过阅读这本书，我不仅学到了很多物理知识，也对宇宙的浩瀚和奇妙有了更深的敬畏。',
        categories: ['学习'],
        status: { icon: '📚', description: '收获' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', caption: '《时间简史》封面' }
        ],
        cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-10T21:15:00Z',
    updatedAt: '2025-10-10T21:15:00Z'
  },

  // 11. 包含视频内容的日记
  '2025-10-11': {
    id: '11',
    date: '2025-10-11',
    title: '观看有趣的短片',
    blocks: [
      {
        id: '11-1',
        title: 'Big Buck Bunny',
        content: '今天看了一部很有趣的动画短片，主角是一只善良的大兔子。动画画面精美，故事温馨，让人心情愉悦。看完后还和朋友们分享了，大家都很喜欢。',
        location: '家里',
        categories: ['玩乐'],
        status: { icon: '😊', description: '开心' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', caption: '动画场景' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop', caption: '精彩画面' },
          { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', caption: '完整短片' }
        ],
        cover: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-11T20:00:00Z',
    updatedAt: '2025-10-11T20:00:00Z'
  },

  // 12. 纯文字 - 较长（超长文本，测试文字溢出）
  '2025-10-12': {
    id: '12',
    date: '2025-10-12',
    title: '思考人生',
    blocks: [
      {
        id: '12-1',
        title: '深夜随想',
        content: '有时候会在深夜思考人生的意义。我们每天都在忙碌，为了工作、为了生活，但偶尔也需要停下来，想想自己真正想要的是什么。人生不应该只是机械地重复每一天，而应该有一些让自己感到充实和快乐的事情。也许应该多花时间在兴趣爱好上，或者学习一些新的技能。真正的人生应该是有意义的，能够给自己和他人带来价值的。',
        categories: ['自己'],
        status: { icon: '🤔', description: '思考' }
      }
    ],
    createdAt: '2025-10-12T23:45:00Z',
    updatedAt: '2025-10-12T23:45:00Z'
  },

  // 13. 花卉摄影 - 4张图片拼贴
  '2025-10-13': {
    id: '13',
    date: '2025-10-13',
    title: '秋日花卉',
    blocks: [
      {
        id: '13-1',
        title: '公园花卉',
        content: '公园里的花还在开放。',
        location: '植物园',
        categories: ['风景', '玩乐'],
        status: { icon: '🌻', description: '花香' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&h=600&fit=crop', caption: '向日葵' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop', caption: '桂花' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&h=600&fit=crop', caption: '秋海棠' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1519039366245-5c7494055ec8?w=800&h=600&fit=crop', caption: '特写' }
        ],
        cover: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-13T14:20:00Z',
    updatedAt: '2025-10-13T14:20:00Z'
  },

  // 14. 健身记录 - 纯文字，有地点和状态
  '2025-10-14': {
    id: '14',
    date: '2025-10-14',
    title: '健身记录',
    blocks: [
      {
        id: '14-1',
        title: '健身房锻炼',
        content: '今天练了胸部和手臂，感觉很有成就感。',
        location: '健身中心',
        categories: ['运动'],
        status: { icon: '💪', description: '力量' }
      }
    ],
    createdAt: '2025-10-14T19:00:00Z',
    updatedAt: '2025-10-14T19:00:00Z'
  },

  // 15. 综合日记 - 3个块，混合类型
  '2025-10-15': {
    id: '15',
    date: '2025-10-15',
    title: '综合日记',
    blocks: [
      {
        id: '15-1',
        content: '早上起来天气不错。',
        categories: ['日常']
      },
      {
        id: '15-2',
        title: '工作进展',
        content: '项目有了新的进展，解决了几个技术难题。',
        categories: ['工作'],
        status: { icon: '💻', description: '技术' }
      },
      {
        id: '15-3',
        title: '晚餐',
        content: '晚上自己做了顿饭。',
        categories: ['美食'],
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', caption: '晚餐' }
        ]
      }
    ],
    createdAt: '2025-10-15T20:30:00Z',
    updatedAt: '2025-10-15T20:30:00Z'
  },

  // 16. 极简 - 只有内容
  '2025-10-16': {
    id: '16',
    date: '2025-10-16',
    title: '休息日',
    blocks: [
      {
        id: '16-1',
        content: '休息。',
        categories: ['日常']
      }
    ],
    createdAt: '2025-10-16T12:00:00Z',
    updatedAt: '2025-10-16T12:00:00Z'
  },

  // 17. 学习笔记 - 多块详细分类
  '2025-10-17': {
    id: '17',
    date: '2025-10-17',
    title: '技术学习',
    blocks: [
      {
        id: '17-1',
        title: 'React学习笔记',
        content: '今天学习了React Hooks的高级用法，包括useContext和useReducer的配合使用。',
        categories: ['学习', '工作'],
        status: { icon: '⚛️', description: 'React' }
      },
      {
        id: '17-2',
        title: '算法练习',
        content: '练习了几道动态规划的题目，感觉还需要多练习。',
        categories: ['学习'],
        status: { icon: '🧮', description: '算法' }
      }
    ],
    createdAt: '2025-10-17T22:10:00Z',
    updatedAt: '2025-10-17T22:10:00Z'
  },

  // 18. 旅行记录 - 海滩主题，2个块
  '2025-10-18': {
    id: '18',
    date: '2025-10-18',
    title: '海边一日游',
    blocks: [
      {
        id: '18-1',
        title: '海滩时光',
        content: '海水很蓝，沙滩很软。',
        location: '黄金海岸',
        categories: ['旅行', '风景'],
        status: { icon: '🌊', description: '海滩' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop', caption: '海景' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop', caption: '沙滩' }
        ],
        cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop'
      },
      {
        id: '18-2',
        title: '海鲜大餐',
        content: '新鲜的海鲜真是太美味了！',
        location: '海边餐厅',
        categories: ['美食'],
        status: { icon: '🦐', description: '海鲜' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', caption: '海鲜拼盘' }
        ]
      }
    ],
    createdAt: '2025-10-18T18:45:00Z',
    updatedAt: '2025-10-18T18:45:00Z'
  },

  // 19. 创意写作
  '2025-10-19': {
    id: '19',
    date: '2025-10-19',
    title: '诗歌尝试',
    blocks: [
      {
        id: '19-1',
        title: '秋思',
        content: '秋风起兮白云飞，\n草木黄落兮雁南归。\n兰有秀兮菊有芳，\n怀佳人兮不能忘。',
        categories: ['作品'],
        status: { icon: '📝', description: '创作' }
      }
    ],
    createdAt: '2025-10-19T16:20:00Z',
    updatedAt: '2025-10-19T16:20:00Z'
  },

  // 20. 朋友聚会 - 多人场景
  '2025-10-20': {
    id: '20',
    date: '2025-10-20',
    title: '朋友聚会',
    blocks: [
      {
        id: '20-1',
        title: '周末聚餐',
        content: '和朋友们一起吃了火锅，聊了很多有趣的话题。',
        location: '火锅店',
        categories: ['朋友', '美食'],
        status: { icon: '🍲', description: '聚餐' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop', caption: '火锅' }
        ],
        cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-20T19:30:00Z',
    updatedAt: '2025-10-20T19:30:00Z'
  },

  // 21. 超长图片测试 - 竖版长图（测试极端长宽比）
  '2025-10-21': {
    id: '21',
    date: '2025-10-21',
    title: '艺术创作',
    blocks: [
      {
        id: '21-1',
        title: '壁画欣赏',
        content: '这幅画太高了！',
        location: '艺术博物馆',
        categories: ['作品', '玩乐'],
        status: { icon: '🎭', description: '艺术' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=600&fit=crop', caption: '超长壁画' }
        ],
        cover: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-21T15:00:00Z',
    updatedAt: '2025-10-21T15:00:00Z'
  },

  // 22. 狮子短视频 - 包含视频（Google sample videos）
  '2025-10-22': {
    id: '22',
    date: '2025-10-22',
    title: '动物园一日游',
    blocks: [
      {
        id: '22-1',
        title: '野生动物',
        content: '今天去了野生动物园，拍到了非常震撼的野生动物视频。看到它们自由自在的样子，感觉大自然的魅力真的很强大。',
        location: '野生动物园',
        categories: ['旅行', '玩乐'],
        status: { icon: '🦁', description: '兴奋' },
        media: [
          { type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', caption: '野生动物视频' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', caption: '动物特写' }
        ],
        cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-22T16:00:00Z',
    updatedAt: '2025-10-22T16:00:00Z'
  },

  // 23. 园艺种植 - 多图展示
  '2025-10-23': {
    id: '23',
    date: '2025-10-23',
    title: '阳台种植',
    blocks: [
      {
        id: '23-1',
        title: '蔬菜成长',
        content: '种的小菜苗长大了。',
        location: '家里阳台',
        categories: ['日常'],
        status: { icon: '🌱', description: '成长' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=600&fit=crop', caption: '小菜苗' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1597848212624-b5b04f4bc3b2?w=800&h=600&fit=crop', caption: '长叶子了' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1597848212624-b5b04f4bc3b2?w=800&h=600&fit=crop', caption: '快成熟' }
        ],
        cover: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-23T16:30:00Z',
    updatedAt: '2025-10-23T16:30:00Z'
  },

  // 24. 家人聚餐 - 家人主题
  '2025-10-24': {
    id: '24',
    date: '2025-10-24',
    title: '家庭聚会',
    blocks: [
      {
        id: '24-1',
        title: '周末聚餐',
        content: '全家人一起吃了顿大餐，聊家常很开心。',
        location: '家里',
        categories: ['家人', '美食'],
        status: { icon: '👨‍👩‍👧‍👦', description: '家庭' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', caption: '家宴' }
        ],
        cover: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-24T18:00:00Z',
    updatedAt: '2025-10-24T18:00:00Z'
  },

  // 25. 情侣约会 - 浪漫场景
  '2025-10-25': {
    id: '25',
    date: '2025-10-25',
    title: '浪漫约会',
    blocks: [
      {
        id: '25-1',
        title: '星空下的晚餐',
        content: '今晚的夜空特别美，星星很多。',
        location: '天台餐厅',
        categories: ['情侣', '美食'],
        status: { icon: '⭐', description: '浪漫' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', caption: '星空下' }
        ],
        cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-25T20:00:00Z',
    updatedAt: '2025-10-25T20:00:00Z'
  },

  // 26. 风景摄影 - 横版超宽图（测试极端长宽比）
  '2025-10-26': {
    id: '26',
    date: '2025-10-26',
    title: '日出风景',
    blocks: [
      {
        id: '26-1',
        title: '山顶日出',
        content: '早早起来看日出。',
        location: '山顶观景台',
        categories: ['风景', '旅行'],
        status: { icon: '🌅', description: '日出' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop', caption: '日出全景' }
        ],
        cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-26T07:30:00Z',
    updatedAt: '2025-10-26T07:30:00Z'
  },

  // 27. 运动记录 - 多种运动
  '2025-10-27': {
    id: '27',
    date: '2025-10-27',
    title: '运动日',
    blocks: [
      {
        id: '27-1',
        title: '晨跑',
        content: '早上跑了5公里，感觉很舒畅。',
        location: '城市公园',
        categories: ['运动'],
        status: { icon: '🏃', description: '跑步' }
      },
      {
        id: '27-2',
        title: '游泳',
        content: '下午去游泳馆游泳。',
        location: '游泳馆',
        categories: ['运动'],
        status: { icon: '🏊', description: '游泳' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop', caption: '游泳' }
        ]
      }
    ],
    createdAt: '2025-10-27T20:30:00Z',
    updatedAt: '2025-10-27T20:30:00Z'
  },

  // 28. 创意作品 - 手工作品
  '2025-10-28': {
    id: '28',
    date: '2025-10-28',
    title: '手工制作',
    blocks: [
      {
        id: '28-1',
        title: '陶艺作品',
        content: '今天完成了一个陶艺杯子。',
        location: '陶艺工作室',
        categories: ['作品', '玩乐'],
        status: { icon: '🏺', description: '手工' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', caption: '陶艺过程' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&h=600&fit=crop', caption: '成品' }
        ],
        cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-28T16:00:00Z',
    updatedAt: '2025-10-28T16:00:00Z'
  },

  // 29. 自己时光 - 个人放松
  '2025-10-29': {
    id: '29',
    date: '2025-10-29',
    title: '独自的午后',
    blocks: [
      {
        id: '29-1',
        title: '咖啡时光',
        content: '一个人静静地喝咖啡，看窗外。',
        location: '咖啡店',
        categories: ['自己', '日常'],
        status: { icon: '☕', description: '放松' },
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop', caption: '咖啡' }
        ],
        cover: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop'
      }
    ],
    createdAt: '2025-10-29T15:00:00Z',
    updatedAt: '2025-10-29T15:00:00Z'
  },

  // 30. 十月总结 - 回顾日记
  '2025-10-30': {
    id: '30',
    date: '2025-10-30',
    title: '十月回顾',
    blocks: [
      {
        id: '30-1',
        title: '本月总结',
        content: '十月已经快结束了，这段时间经历了很多事情。从月初的新开始，到中间的各种活动，再到现在的平静。学会了记录生活，也收获了很多美好的回忆。希望接下来的日子也能这样充实而有意义。每一天都值得记录，每一个瞬间都值得珍惜。',
        categories: ['自己'],
        status: { icon: '📖', description: '回顾' }
      }
    ],
    createdAt: '2025-10-30T21:00:00Z',
    updatedAt: '2025-10-30T21:00:00Z'
  }
};

// 获取示例日记的所有日期
export const getSampleDates = () => {
  return Object.keys(sampleDiaries).sort();
};

// 根据日期获取示例日记
export const getSampleDiary = (date) => {
  return sampleDiaries[date] || null;
};

// 获取所有示例日记
export const getAllSampleDiaries = () => {
  return Object.values(sampleDiaries).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
};

// 根据分类筛选示例日记
export const getSampleDiariesByCategory = (category) => {
  return Object.values(sampleDiaries).filter(diary =>
    diary.blocks.some(block =>
      block.categories && block.categories.includes(category)
    )
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
};

// 搜索示例日记
export const searchSampleDiaries = (query) => {
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return Object.values(sampleDiaries).filter(diary => {
    // 搜索标题
    if (diary.title?.toLowerCase().includes(lowercaseQuery)) return true;
    
    // 搜索内容块
    if (diary.blocks?.some(block => {
      return block.title?.toLowerCase().includes(lowercaseQuery) ||
             block.content?.toLowerCase().includes(lowercaseQuery) ||
             block.location?.toLowerCase().includes(lowercaseQuery) ||
             block.categories?.some(cat => cat.toLowerCase().includes(lowercaseQuery));
    })) return true;
    
    return false;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export default sampleDiaries;
