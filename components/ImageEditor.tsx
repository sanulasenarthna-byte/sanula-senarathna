import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Upload, Wand2, Download, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) return;
    setLoading(true);
    setError(null);
    try {
      const result = await editImage(originalImage, prompt);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to edit image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wand2 className="text-indigo-400" />
          AI Image Editor
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left Column: Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${
              originalImage ? 'border-indigo-500/50 bg-slate-800/20' : 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50'
            }`}
          >
            {originalImage ? (
              <img src={originalImage} alt="Original" className="h-full object-contain rounded-lg" />
            ) : (
              <div className="text-center text-slate-500">
                <Upload size={32} className="mx-auto mb-2" />
                <p className="font-medium">Click to upload image</p>
                <p className="text-xs">JPG, PNG supported</p>
              </div>
            )}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Edit Instruction</label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a vintage filter', 'Make it look like a sketch', 'Remove the background'"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
              />
              <button
                onClick={handleEdit}
                disabled={!originalImage || !prompt || loading}
                className="absolute bottom-3 right-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                Generate
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Result */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-emerald-400" />
            Result
          </h3>
          
          <div className="flex-1 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 relative overflow-hidden group">
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Edited" className="max-w-full max-h-full object-contain" />
                <a 
                  href={generatedImage} 
                  download="edited-image.png"
                  className="absolute bottom-4 right-4 p-3 bg-white text-slate-900 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                  title="Download"
                >
                  <Download size={20} />
                </a>
              </>
            ) : (
              <div className="text-slate-600 flex flex-col items-center">
                {loading ? (
                  <>
                    <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
                    <p className="animate-pulse">Processing image...</p>
                  </>
                ) : (
                  <>
                    <Wand2 size={48} className="mb-4 opacity-20" />
                    <p>Generated image will appear here</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
