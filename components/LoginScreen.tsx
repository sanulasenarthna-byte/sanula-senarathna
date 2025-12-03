import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Zap, Loader2, Moon, Sun, Cpu, Shield, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-100 dark:bg-[#020617] overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Moving Grid */}
        <div className="absolute inset-0 cyber-grid-bg animate-grid-move opacity-50 dark:opacity-100"></div>
        
        {/* Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse-fast mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse mix-blend-screen" style={{animationDuration: '3s'}}></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-slate-200/20 text-slate-800 dark:text-cyan-400 shadow-lg hover:scale-110 hover:bg-white/20 transition-all z-50 group"
      >
        {theme === 'dark' ? <Sun size={24} className="group-hover:rotate-90 transition-transform" /> : <Moon size={24} className="group-hover:-rotate-12 transition-transform" />}
      </button>

      {/* Login Container */}
      <div 
        className="relative z-10 w-full max-w-5xl h-auto min-h-[600px] flex m-4 glass-panel clip-corner shadow-2xl transition-transform duration-100 ease-out"
        style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
      >
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[10%] w-full animate-scanline pointer-events-none z-20"></div>

        {/* Left Side - Visuals (HUD) */}
        <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 border-r border-slate-200/10 bg-black/20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          
          <div className="relative z-10 text-center space-y-8">
             <div className="relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-24 h-24 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-2xl">
                   <Cpu size={48} className="text-cyan-400 animate-pulse" />
                </div>
             </div>
             
             <div>
               <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2 tracking-wider">
                 NEXUS
               </h2>
               <p className="text-cyan-200/70 font-mono tracking-[0.2em] text-sm uppercase">
                 AI Automation Protocol v2.5
               </p>
             </div>

             <div className="grid grid-cols-2 gap-4 text-left mt-8">
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
                   <Shield className="text-cyan-500 mb-2" size={20} />
                   <h3 className="text-slate-300 font-bold text-sm">Secure Access</h3>
                   <p className="text-slate-500 text-xs">Biometric encryption active</p>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
                   <Globe className="text-purple-500 mb-2" size={20} />
                   <h3 className="text-slate-300 font-bold text-sm">Global Node</h3>
                   <p className="text-slate-500 text-xs">Connected to mainnet</p>
                </div>
             </div>
          </div>
          
          {/* Decorative Lines */}
          <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-purple-500/50"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xl">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                 <Zap className="text-cyan-500 fill-current" size={24} />
                 <span>LOGIN_SEQUENCE</span>
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full mb-2"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-mono">Enter credentials to initialize session.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Identity / Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-cyan-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATOR_ID"
                    className="w-full bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-none clip-corner pl-12 pr-4 py-4 focus:border-cyan-500 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] outline-none transition-all font-mono placeholder:text-slate-600"
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-500 transition-all duration-500 group-hover:w-full"></div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Access Key / Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-cyan-500 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-200/50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-none clip-corner pl-12 pr-4 py-4 focus:border-cyan-500 focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] outline-none transition-all font-mono placeholder:text-slate-600"
                  />
                  <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-500 transition-all duration-500 group-hover:w-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                     <input type="checkbox" className="peer sr-only" />
                     <div className="w-4 h-4 border border-slate-400 dark:border-slate-600 rounded-sm peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-all"></div>
                     <div className="absolute inset-0 flex items-center justify-center text-black opacity-0 peer-checked:opacity-100 pointer-events-none">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     </div>
                  </div>
                  <span className="text-slate-600 dark:text-slate-400 group-hover:text-cyan-500 transition-colors">Persist Session</span>
                </label>
                <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 text-xs uppercase tracking-wider font-bold hover:underline">Recover Key?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-slate-900 dark:bg-cyan-600 text-white font-bold py-4 px-6 overflow-hidden clip-corner transition-all hover:bg-slate-800 dark:hover:bg-cyan-500 shadow-lg"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <div className="flex items-center justify-center space-x-3">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            <span className="tracking-widest">INITIALIZE</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </div>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 dark:text-slate-500 text-xs font-mono">
                SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;