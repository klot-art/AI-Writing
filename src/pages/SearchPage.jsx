import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Send, Sparkles, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';

// ==================== 配置区域 ====================
// 请在此处填入你的 Kimi API Key
// 获取方式：登录 https://platform.moonshot.cn/ -> 创建 API Key
const KIMI_API_KEY = '';

// Kimi API 配置 - Moonshot 开放平台
const KIMI_CONFIG = {
  // 开发环境使用 Vite 代理
  baseURL: '/api/kimi/v1',
  // 生产环境: https://api.moonshot.cn/v1

  // 可选模型:
  // 'kimi-latest'     - 最新版本（推荐）
  // 'kimi-k2'         - K2 系列
  // 'kimi-k2-72b'     - K2 72B 版本
  // 'kimi-k1.5'       - K1.5 版本
  model: 'kimi-latest',

  temperature: 0.7,
  max_tokens: 2000,
};
// ==================================================

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const resultEndRef = useRef(null);

  // 自动滚动到结果底部
  useEffect(() => {
    if (resultEndRef.current) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  // 调用 Kimi API
  const callKimiAPI = async (userQuery) => {
    if (!KIMI_API_KEY) {
      throw new Error('请先配置 Kimi API Key');
    }

    const response = await fetch(`${KIMI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: KIMI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的写作助手，擅长根据用户需求生成高质量的文章、文案、报告等内容。你的回答应该：1. 结构清晰 2. 内容有深度 3. 语言流畅自然 4. 符合中文写作习惯'
          },
          {
            role: 'user',
            content: userQuery
          }
        ],
        temperature: KIMI_CONFIG.temperature,
        max_tokens: KIMI_CONFIG.max_tokens,
        stream: true, // 开启流式响应
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    return response;
  };

  // 处理流式响应
  const handleStreamResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                setResult(fullText);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullText;
  };

  // 搜索处理
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult('');
    setError(null);

    try {
      const response = await callKimiAPI(query);
      await handleStreamResponse(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || '请求失败，请检查网络或 API Key');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  // 复制结果
  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 重新生成
  const handleRegenerate = () => {
    if (query.trim()) {
      handleSearch();
    }
  };

  // 回车发送
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800">通用写作</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* API Key 提示 */}
        {!KIMI_API_KEY && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium mb-1">API Key 未配置</p>
              <p className="text-sm text-amber-700">
                请在代码中配置 KIMI_API_KEY 变量，或访问
                <a
                  href="https://platform.moonshot.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline mx-1"
                >
                  Moonshot 平台
                </a>
                获取 API Key
              </p>
            </div>
          </div>
        )}

        {/* Search Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4" />
            输入您的写作需求
          </h2>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例如：帮我写一篇关于人工智能的科普文章，要求通俗易懂，适合大众阅读..."
              className="w-full min-h-[120px] p-4 pr-14 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className={`absolute bottom-4 right-4 p-2.5 rounded-xl transition-all duration-200 ${
                loading || !query.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">按 Enter 发送，Shift + Enter 换行</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium mb-1">请求出错</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Result Area */}
        {(result || loading) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Result Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-sm font-medium text-slate-600">
                  {loading ? 'Kimi 正在生成中...' : '生成完成'}
                </span>
              </div>
              {result && !loading && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新生成
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Result Content */}
            <div className="p-6">
              {loading && !result ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {result}
                  </div>
                </div>
              )}
              <div ref={resultEndRef} />
            </div>
          </div>
        )}

        {/* Tips */}
        {!result && !loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: '📝 文章写作', desc: '新闻稿、博客、论文等各类文章' },
              { title: '💼 商业文案', desc: '广告、营销、品牌宣传文案' },
              { title: '💬 社交媒体', desc: '小红书、微博、朋友圈内容' },
            ].map((tip, index) => (
              <div
                key={index}
                className="bg-white/60 rounded-xl p-4 border border-slate-200/60 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer"
                onClick={() => setQuery(`帮我写一篇${tip.desc}，主题自拟`)}
              >
                <h3 className="font-medium text-slate-800 mb-1">{tip.title}</h3>
                <p className="text-sm text-slate-500">{tip.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
