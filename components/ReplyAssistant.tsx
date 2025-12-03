import React, { useState } from 'react';
import { Platform, MockComment } from '../types';
import { generateReplySuggestion } from '../services/geminiService';
import { MessageCircle, ThumbsUp, Send, RefreshCw, Youtube, Facebook, Sparkles } from 'lucide-react';

const MOCK_COMMENTS: MockComment[] = [
  { id: '1', user: 'Alex Tech', text: 'Great video! Could you explain how the agent handles auth?', platform: Platform.YOUTUBE, timestamp: '2h ago', avatar: 'AT' },
  { id: '2', user: 'Sarah Jenks', text: 'I tried this but got an error on step 3. Please help!', platform: Platform.FACEBOOK, timestamp: '5h ago', avatar: 'SJ' },
  { id: '3', user: 'CryptoKing', text: 'Is this actually profitable or just hype?', platform: Platform.YOUTUBE, timestamp: '1d ago', avatar: 'CK' },
  { id: '4', user: 'DevLife', text: 'The UI looks amazing. What library did you use?', platform: Platform.FACEBOOK, timestamp: '1d ago', avatar: 'DL' },
];

const ReplyAssistant: React.FC = () => {
  const [selectedComment, setSelectedComment] = useState<MockComment | null>(null);
  const [suggestedReply, setSuggestedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(MOCK_COMMENTS);

  const handleSelectComment = async (comment: MockComment) => {
    setSelectedComment(comment);
    setSuggestedReply('');
    setLoading(true);
    const reply = await generateReplySuggestion(comment.text, comment.platform);
    setSuggestedReply(reply);
    setLoading(false);
  };

  const handleSend = () => {
    if (!selectedComment) return;
    // Remove from list to simulate reply
    setComments(comments.filter(c => c.id !== selectedComment.id));
    setSelectedComment(null);
    setSuggestedReply('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* List */}
      <div className="lg:w-1/3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Inbox</h3>
          <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">{comments.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {comments.map(comment => (
            <button
              key={comment.id}
              onClick={() => handleSelectComment(comment)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selectedComment?.id === comment.id 
                  ? 'bg-indigo-600/10 border border-indigo-500/50' 
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                    {comment.avatar}
                  </div>
                  <span className="font-semibold text-slate-200 text-sm">{comment.user}</span>
                </div>
                {comment.platform === Platform.YOUTUBE ? <Youtube size={14} className="text-red-500"/> : <Facebook size={14} className="text-blue-500"/>}
              </div>
              <p className="text-slate-400 text-sm line-clamp-2">{comment.text}</p>
              <span className="text-xs text-slate-600 mt-2 block">{comment.timestamp}</span>
            </button>
          ))}
          {comments.length === 0 && (
            <div className="text-center p-8 text-slate-500">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p>All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
        {selectedComment ? (
          <>
            <div className="mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                    {selectedComment.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedComment.user}</h3>
                    <p className="text-xs text-slate-500">via {selectedComment.platform}</p>
                  </div>
              </div>
              <p className="text-lg text-slate-200 bg-slate-800/50 p-4 rounded-xl">"{selectedComment.text}"</p>
            </div>

            <div className="flex-1 flex flex-col">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                   <Sparkles size={14} /> AI Suggestion
                 </label>
                 <button 
                  onClick={() => handleSelectComment(selectedComment)}
                  className="text-xs text-slate-500 hover:text-white flex items-center gap-1"
                 >
                   <RefreshCw size={12} /> Regenerate
                 </button>
               </div>
               
               <div className="relative flex-1">
                 {loading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-800/30 rounded-xl">
                      <div className="flex items-center space-x-2 text-indigo-400">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                   </div>
                 ) : null}
                 <textarea
                    value={suggestedReply}
                    onChange={(e) => setSuggestedReply(e.target.value)}
                    className="w-full h-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Type your reply..."
                 />
               </div>
               
               <div className="mt-4 flex justify-end space-x-3">
                 <button 
                    onClick={() => setSelectedComment(null)}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                    onClick={handleSend}
                    disabled={!suggestedReply || loading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                 >
                   <Send size={16} /> Reply
                 </button>
               </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <MessageCircle size={48} className="mb-4 text-slate-700" />
            <p className="text-lg">Select a comment to reply</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyAssistant;