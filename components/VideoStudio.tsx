import React, { useState, useRef, useEffect } from 'react';
import { generateVeoVideo, analyzeVideoContent } from '../services/geminiService';
import { Video, Film, Upload, Play, Loader2, Info, AlertCircle, FileVideo, Sparkles, Clock } from 'lucide-react';

type Tab = 'generate' | 'analyze';

const VideoStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [refImage, setRefImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Initializing...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasKey, setHasKey] = useState(false);

  // Analysis State
  const [analysisVideo, setAnalysisVideo] = useState<string | null>(null);
  const [analysisVideoMime, setAnalysisVideoMime] = useState<string>('');
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    checkKey();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const checkKey = async () => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasKey(has);
      } else {
        // Fallback for dev environments where injection might not happen immediately
        // In a real scenario, we'd wait or assume false.
        // For this demo, we'll default to true if the object is missing to avoid blocking UI if running locally without the wrapper.
        setHasKey(true); 
      }
    } catch (e) {
      console.warn("API Key check failed", e);
    }
  };

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success after dialog close, or polling check could be added
      setHasKey(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Generation Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!hasKey) {
      await handleSelectKey();
      return;
    }
    
    setGenLoading(true);
    setGenError(null);
    setGeneratedVideoUrl(null);
    setStatusText('Preparing request...');
    setElapsedTime(0);

    // Start Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    try {
      const url = await generateVeoVideo(prompt, refImage, aspectRatio, (status) => {
        setStatusText(status);
      });
      setGeneratedVideoUrl(url);
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setGenError("Session expired or invalid key. Please select your API Key again.");
      } else {
        setGenError(e.message || "Failed to generate video");
      }
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setGenLoading(false);
    }
  };

  // --- Analysis Handlers ---
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setAnalyzeError("File too large. Please use a video under 20MB for this demo.");
        return;
      }
      setAnalyzeError(null);
      setAnalysisVideoMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => setAnalysisVideo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisVideo) return;
    setAnalyzeLoading(true);
    setAnalyzeError(null);
    try {
      const result = await analyzeVideoContent(analysisVideo, analysisVideoMime, analysisPrompt);
      setAnalysisResult(result);
    } catch (e: any) {
      setAnalyzeError(e.message || "Analysis failed");
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Film className="text-indigo-400" />
          Video Studio
        </h2>
        <div className="flex bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Veo Generator
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analyze' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Video Understanding
          </button>
        </div>
      </div>

      {activeTab === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto">
             {!hasKey && (
               <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                 <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                 <div>
                   <h4 className="text-amber-500 font-bold text-sm">Action Required</h4>
                   <p className="text-amber-200/80 text-sm mt-1 mb-3">
                     Veo video generation requires a specific paid project API key.
                   </p>
                   <button 
                     onClick={handleSelectKey}
                     className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
                   >
                     Select API Key
                   </button>
                   <p className="text-[10px] text-slate-500 mt-2">
                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-slate-400">View billing documentation</a>
                   </p>
                 </div>
               </div>
             )}

             <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">Video Prompt</label>
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Describe the video you want to generate (e.g., 'A cyberpunk city with neon lights in rain')..."
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reference Image (Optional)</label>
                  <div 
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50 rounded-xl h-24 flex items-center justify-center cursor-pointer transition-all relative overflow-hidden"
                  >
                    {refImage ? (
                      <img src={refImage} alt="Ref" className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <Upload size={20} />
                        <span className="text-xs mt-1">Upload</span>
                      </div>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setAspectRatio('16:9')}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${aspectRatio === '16:9' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        <div className="w-6 h-3 border-2 border-current rounded-sm mb-1" />
                        <span className="text-xs">16:9</span>
                      </button>
                      <button 
                        onClick={() => setAspectRatio('9:16')}
                        className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${aspectRatio === '9:16' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        <div className="w-3 h-5 border-2 border-current rounded-sm mb-1" />
                        <span className="text-xs">9:16</span>
                      </button>
                   </div>
                </div>
             </div>

             <button
               onClick={handleGenerate}
               disabled={genLoading || !prompt}
               className="w-full py-4 mt-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
             >
               {genLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
               Generate Video
             </button>

             {genError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                {genError}
              </div>
             )}
          </div>

          {/* Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
             {generatedVideoUrl ? (
               <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <video 
                    src={generatedVideoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-w-full max-h-[80%] rounded-lg shadow-2xl bg-black"
                  />
                  <a 
                    href={generatedVideoUrl} 
                    download="veo_generation.mp4"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Download MP4
                  </a>
               </div>
             ) : (
                <div className="text-center">
                  {genLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-indigo-400">
                          {formatTime(elapsedTime)}
                        </div>
                      </div>
                      <h3 className="text-white font-bold mt-6 text-lg animate-pulse">Generating Video...</h3>
                      <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">{statusText}</p>
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-950 px-3 py-1 rounded-full">
                         <Clock size={12} />
                         <span>Takes ~1-2 minutes</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                      <Video size={64} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">Video Preview</p>
                      <p className="text-sm">Generated content will appear here</p>
                    </div>
                  )}
                </div>
             )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
           {/* Analysis Input */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
              <div 
                onClick={() => videoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  analysisVideo ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50'
                }`}
              >
                {analysisVideo ? (
                  <div className="flex flex-col items-center text-emerald-400">
                    <FileVideo size={48} className="mb-2" />
                    <p className="font-bold">Video Selected</p>
                    <p className="text-xs opacity-70">Click to change</p>
                  </div>
                ) : (
                   <div className="flex flex-col items-center text-slate-500">
                     <Upload size={32} className="mb-2" />
                     <p>Upload Video for Analysis</p>
                     <p className="text-xs mt-1">MP4, WebM (Max 20MB)</p>
                   </div>
                )}
                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Question or Prompt</label>
                <textarea
                   value={analysisPrompt}
                   onChange={(e) => setAnalysisPrompt(e.target.value)}
                   placeholder="e.g. 'Describe the main action in this video' or 'What emotions are shown?'"
                   className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzeLoading || !analysisVideo}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {analyzeLoading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                Analyze Video
              </button>

              {analyzeError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {analyzeError}
                </div>
              )}
           </div>

           {/* Analysis Output */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <Info size={20} className="text-blue-400" />
               Analysis Result
             </h3>
             {analysisResult ? (
               <div className="prose prose-invert prose-slate">
                 <p className="whitespace-pre-wrap leading-relaxed">{analysisResult}</p>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                 {analyzeLoading ? (
                   <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                 ) : (
                   <div className="text-center">
                     <FileVideo size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Upload a video to see insights here.</p>
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoStudio;
