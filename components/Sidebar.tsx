import React from 'react';
import { LayoutDashboard, PenTool, TrendingUp, MessageSquare, Menu, X, Mic, BrainCircuit, Image as ImageIcon, Film, LogOut, Sun, Moon, Cpu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={18} /> },
    { id: 'create', label: 'CONTENT_STUDIO', icon: <PenTool size={18} /> },
    { id: 'image-editor', label: 'IMG_PROCESSOR', icon: <ImageIcon size={18} /> },
    { id: 'video-studio', label: 'VEO_STUDIO', icon: <Film size={18} /> },
    { id: 'trends', label: 'TREND_RADAR', icon: <TrendingUp size={18} /> },
    { id: 'inbox', label: 'AUTO_REPLY', icon: <MessageSquare size={18} /> },
    { id: 'chat', label: 'NEURAL_CHAT', icon: <BrainCircuit size={18} /> },
    { id: 'live', label: 'VOICE_LINK', icon: <Mic size={18} /> },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 text-cyan-400 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-50/90 dark:bg-[#020617]/90 backdrop-blur-xl border-r border-slate-200 dark:border-cyan-900/30 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col shadow-2xl`}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-center h-24 border-b border-slate-200 dark:border-cyan-900/30 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent animate-scanline opacity-50"></div>
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-950 border border-cyan-500/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Cpu className="text-cyan-400 animate-pulse" size={24} />
            </div>
            <div>
               <h1 className="text-lg font-black tracking-wider text-slate-800 dark:text-white font-display">
                NEXUS
               </h1>
               <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-purple-500"></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-6 px-3 space-y-1 pb-20 scrollbar-thin scrollbar-thumb-cyan-900">
          {menuItems.map((item) => {
             const isActive = activeTab === item.id;
             return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`group relative w-full flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-300 border border-transparent overflow-hidden ${
                  isActive 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-cyan-500 dark:hover:text-cyan-300'
                }`}
              >
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                </div>
                <span className="font-bold tracking-wider text-sm font-display">{item.label}</span>
                
                {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer Controls */}
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-cyan-900/30 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 px-1">
             <button 
               onClick={toggleTheme}
               className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-cyan-500 rounded-lg transition-colors"
               title="Toggle Visual Mode"
             >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></div>
             <button 
               onClick={onLogout}
               className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
               title="Terminate Session"
             >
               <LogOut size={20} />
             </button>
          </div>

          <div className="relative bg-slate-200 dark:bg-slate-950 rounded-lg p-3 border border-slate-300 dark:border-slate-800">
            {/* Corner Markers */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyan-500"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-cyan-500"></div>
            
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 font-bold mb-2">Active Nodes</p>
            <div className="flex items-center justify-between mt-2">
               <div className="flex items-center space-x-2">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">YT_UPLINK</span>
               </div>
               <span className="text-[10px] text-green-500 font-mono">98ms</span>
            </div>
            <div className="flex items-center justify-between mt-1">
               <div className="flex items-center space-x-2">
                  <div className="relative w-2 h-2">
                    <div className="relative w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">FB_NODE</span>
               </div>
               <span className="text-[10px] text-green-500 font-mono">45ms</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;