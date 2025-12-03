import React, { useState } from 'react';
import { Platform, ContentType, GeneratedContent } from '../types';
import { generateSocialContent } from '../services/geminiService';
import { Sparkles, Youtube, Facebook, Copy, Image as ImageIcon, Check } from 'lucide-react';

const ContentGenerator: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>(Platform.YOUTUBE);
  const [contentType, setContentType] = useState<ContentType>(ContentType.SCRIPT);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional & Engaging');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateSocialContent(platform, contentType, topic, tone);
      setResult(data);
    } catch (e) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-indigo-400" />
            Content Studio
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Platform</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlatform(Platform.YOUTUBE)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all ${
                    platform === Platform.YOUTUBE
                      ? 'bg-red-500/10 border-red-500 text-red-500'
                      : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  <Youtube size={18} />
                  <span>YouTube</span>
                </button>
                <button
                  onClick={() => setPlatform(Platform.FACEBOOK)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all ${
                    platform === Platform.FACEBOOK
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                      : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-800/80'
                  }`}
                >
                  <Facebook size={18} />
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {Object.values(ContentType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Topic or Idea</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The future of AI agents in 2025..."
                className="w-full h-32 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tone</label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                loading || !topic
                  ? 'bg-slate-700 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-indigo-500/25 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Content'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="space-y-6">
        {result ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full overflow-y-auto max-h-[calc(100vh-8rem)]">
             <div className="flex justify-between items-start mb-6">
               <h3 className="text-xl font-bold text-white">Generated Result</h3>
               <button
                 onClick={() => copyToClipboard(`${result.title}\n\n${result.body}`)}
                 className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                 title="Copy All"
               >
                 {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
               </button>
             </div>

             <div className="space-y-6">
               <div className="bg-slate-800/50 rounded-xl p-4">
                 <span className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">Title / Headline</span>
                 <p className="text-lg font-medium text-white">{result.title}</p>
               </div>

               <div className="bg-slate-800/50 rounded-xl p-4">
                 <span className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block">Body / Script</span>
                 <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{result.body}</p>
               </div>

               <div className="bg-slate-800/50 rounded-xl p-4">
                 <span className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block">Hashtags</span>
                 <div className="flex flex-wrap gap-2">
                   {result.hashtags.map((tag, i) => (
                     <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">#{tag.replace('#', '')}</span>
                   ))}
                 </div>
               </div>

               {result.imagePrompt && (
                 <div className="bg-slate-800/50 rounded-xl p-4 border border-indigo-500/20">
                    <div className="flex items-center space-x-2 mb-2 text-indigo-400">
                      <ImageIcon size={16} />
                      <span className="text-xs uppercase tracking-wider font-bold">AI Image Prompt Idea</span>
                    </div>
                   <p className="text-slate-300 text-sm italic">"{result.imagePrompt}"</p>
                 </div>
               )}
             </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-6 h-full flex flex-col items-center justify-center text-slate-500">
            <Sparkles size={48} className="mb-4 text-slate-700" />
            <p className="text-lg">Ready to create magic?</p>
            <p className="text-sm">Fill out the form to generate AI-powered content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;