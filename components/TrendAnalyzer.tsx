import React, { useState } from 'react';
import { analyzeTrends } from '../services/geminiService';
import { TrendResult } from '../types';
import { Search, Globe, ArrowRight, Loader2 } from 'lucide-react';

const TrendAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrendResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const result = await analyzeTrends(query);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Trend Watch</h2>
        <p className="text-slate-400">Discover what's viral in your niche using real-time search data.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a niche (e.g., 'Tech gadgets', 'Vegan recipes', 'Crypto')"
          className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-xl transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={24} />
        <button 
          type="submit"
          disabled={loading || !query}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
        </button>
      </form>

      {data && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe size={20} className="text-emerald-400" />
              Trend Report: <span className="text-indigo-400">{data.query}</span>
            </h3>
            <div className="prose prose-invert prose-slate max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
            </div>
            
            {data.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Sources</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{source.title}</p>
                        <p className="text-xs text-slate-500 truncate">{new URL(source.url).hostname}</p>
                      </div>
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendAnalyzer;