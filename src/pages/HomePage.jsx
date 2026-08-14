import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pencil,
  FileText,
  Megaphone,
  MessageSquare,
  ClipboardList,
  BarChart3,
  BookOpen,
  Image as ImageIcon,
  MessageCircle,
  Calendar,
  PenTool,
  FileEdit,
  Sparkles,
} from 'lucide-react';

const categories = [
  { id: 'all', name: '全部' },
  { id: 'work', name: '工作' },
  { id: 'education', name: '学习/教育' },
  { id: 'daily', name: '日常生活' },
  { id: 'marketing', name: '商业营销' },
  { id: 'art', name: '文学艺术' },
  { id: 'rewrite', name: '回复和改写' },
];

const cards = [
  {
    id: 1,
    title: '通用',
    desc: '通用精彩，妙笔生花',
    icon: Pencil,
    color: 'bg-emerald-500',
    category: 'all',
    route: '/search'
  },
  {
    id: 2,
    title: '文章',
    desc: '撰写主流平台文章',
    icon: FileText,
    color: 'bg-blue-500',
    category: 'all'
  },
  {
    id: 3,
    title: '宣传文案',
    desc: '撰写各平台的推广文案',
    icon: Megaphone,
    color: 'bg-red-500',
    category: 'marketing'
  },
  {
    id: 4,
    title: '话术',
    desc: '满足不同场景表达需求',
    icon: MessageSquare,
    color: 'bg-blue-500',
    category: 'work'
  },
  {
    id: 5,
    title: '研究报告',
    desc: '深度研究，精准分析',
    icon: ClipboardList,
    color: 'bg-blue-500',
    category: 'work'
  },
  {
    id: 6,
    title: '总结汇报',
    desc: '凝练你的工作成效',
    icon: BarChart3,
    color: 'bg-blue-500',
    category: 'work'
  },
  {
    id: 7,
    title: '小红书',
    desc: '打造吸睛的小红书内容',
    icon: BookOpen,
    color: 'bg-red-500',
    category: 'marketing',
    url: 'https://www.xiaohongshu.com'
  },
  {
    id: 8,
    title: '朋友圈',
    desc: '精心设计的朋友圈文案',
    icon: ImageIcon,
    color: 'bg-green-500',
    category: 'daily',
    url: 'https://weixin.qq.com'
  },
  {
    id: 9,
    title: '微博',
    desc: '撰写吸引眼球的微博',
    icon: MessageCircle,
    color: 'bg-red-500',
    category: 'marketing',
    url: 'https://weibo.com'
  },
  {
    id: 10,
    title: '计划',
    desc: '量身定制工作生活计划',
    icon: Calendar,
    color: 'bg-blue-500',
    category: 'daily'
  },
  {
    id: 11,
    title: '脚本',
    desc: '构思精美剧本框架',
    icon: PenTool,
    color: 'bg-slate-600',
    category: 'art'
  },
  {
    id: 12,
    title: '申请',
    desc: '轻松生成各类申请',
    icon: FileEdit,
    color: 'bg-blue-500',
    category: 'work'
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredCards = activeCategory === 'all'
    ? cards
    : cards.filter(card => card.category === activeCategory || card.category === 'all');

  const handleCardClick = (card) => {
    if (card.route) {
      navigate(card.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">AI 写作</h1>
        </div>
        <p className="text-slate-500 text-lg">AI辅助创作，重塑表达边界</p>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4 pb-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
            const IconComponent = card.icon;
            const CardContent = (
              <>
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-sm">
                  {card.desc}
                </p>
              </>
            );

            if (card.url) {
              return (
                <a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-slate-100 group block no-underline"
                >
                  {CardContent}
                </a>
              );
            }

            if (card.route) {
              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-slate-100 group"
                >
                  {CardContent}
                </div>
              );
            }

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-slate-100 group"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
