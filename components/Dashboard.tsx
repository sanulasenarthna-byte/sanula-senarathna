import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Eye, ThumbsUp, Share2, Loader2, Youtube, Facebook, Activity, Zap } from 'lucide-react';
import { getDashboardStats } from '../services/mockService';
import { ChartData } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const iconMap: Record<string, any> = {
  views: Eye,
  users: Users,
  engagement: ThumbsUp,
  shares: Share2,
};

const colorMap: Record<string, string> = {
  views: 'cyan',
  users: 'emerald',
  engagement: 'amber',
  shares: 'purple',
};

const StatCard = ({ title, value, change, type }: any) => {
  const Icon = iconMap[type];
  const colorBase = colorMap[type];
  
  // Dynamic tailwind classes handling
  // We use specific styles for the "Techno" look instead of dynamic classes for more control
  let accentColor = '';
  let iconColor = '';
  
  switch(type) {
      case 'views': accentColor = 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'; iconColor = 'text-cyan-400'; break;
      case 'users': accentColor = 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'; iconColor = 'text-emerald-400'; break;
      case 'engagement': accentColor = 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'; iconColor = 'text-amber-400'; break;
      case 'shares': accentColor = 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'; iconColor = 'text-purple-400'; break;
      default: accentColor = 'border-slate-700'; iconColor = 'text-slate-400';
  }

  return (
    <div className={`relative bg-slate-50 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 clip-corner group hover:border-opacity-100 transition-all duration-300 ${accentColor}`}>
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 p-2 opacity-50">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-transparent to-${colorBase}-500/20 blur-xl`}></div>
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 ${iconColor} rounded-lg`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-mono font-bold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          <span>{change > 0 ? '+' : ''}{change}%</span>
          {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </div>
      </div>
      
      <h3 className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 dark:text-white font-display tracking-wide">{value}</p>
      
      {/* Tech Line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-700 group-hover:w-full opacity-50"></div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        setChartData(data.chartData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
        </div>
      </div>
    );
  }

  // Chart Styling based on theme
  const isDark = theme === 'dark';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tooltipBg = isDark ? '#020617' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
            <Activity className="text-cyan-500" />
            COMMAND_CENTER
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm mt-1">
            System metrics and performance analytics
            </p>
        </div>
        <div className="flex space-x-2">
          <span className="px-4 py-2 bg-slate-200 dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider rounded border border-slate-300 dark:border-cyan-900/50 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Data Feed
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Trends */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-20 h-[1px] bg-cyan-500"></div>
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                ENGAGEMENT_VELOCITY
             </h3>
             <div className="flex gap-2">
                 <div className="h-1 w-1 bg-slate-500 rounded-full"></div>
                 <div className="h-1 w-1 bg-slate-500 rounded-full"></div>
                 <div className="h-1 w-1 bg-slate-500 rounded-full"></div>
             </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="coloryt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorfb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} fontFamily="Rajdhani" />
                <YAxis stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} fontFamily="Rajdhani" />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: isDark ? '#fff' : '#000', borderRadius: '0px', fontFamily: 'Rajdhani', border: '1px solid #334155' }}
                  itemStyle={{ fontSize: 12, fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="yt" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#coloryt)" name="YouTube" animationDuration={2000} />
                <Area type="monotone" dataKey="fb" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorfb)" name="Facebook" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-[1px] bg-purple-500"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-8">
            WEEKLY_THROUGHPUT
          </h3>
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} fontFamily="Rajdhani" />
                <YAxis stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} fontFamily="Rajdhani" />
                <Tooltip 
                  cursor={{fill: isDark ? '#1e293b' : '#f1f5f9', opacity: 0.5}}
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: isDark ? '#fff' : '#000', borderRadius: '0px', fontFamily: 'Rajdhani', border: '1px solid #334155' }}
                />
                <Bar dataKey="yt" fill="#ef4444" name="YouTube" radius={[2, 2, 0, 0]} animationDuration={1500} />
                <Bar dataKey="fb" fill="#06b6d4" name="Facebook" radius={[2, 2, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Quick KPI Row - Tech Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-red-500/20 p-5 rounded-lg flex items-center justify-between relative overflow-hidden group">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 transition-all group-hover:w-2"></div>
           <div className="flex items-center gap-4 pl-2">
              <div className="p-3 bg-red-500/10 rounded border border-red-500/30 text-red-500"><Youtube size={24} /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">YouTube Signal</p>
                <p className="text-slate-900 dark:text-white font-black text-xl font-display">48% <span className="text-sm font-normal text-slate-500">TRAFFIC</span></p>
              </div>
           </div>
           <div className="text-right">
             <p className="text-emerald-500 font-bold font-mono">+12%</p>
           </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-blue-500/20 p-5 rounded-lg flex items-center justify-between relative overflow-hidden group">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transition-all group-hover:w-2"></div>
           <div className="flex items-center gap-4 pl-2">
              <div className="p-3 bg-blue-500/10 rounded border border-blue-500/30 text-blue-500"><Facebook size={24} /></div>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Facebook Signal</p>
                <p className="text-slate-900 dark:text-white font-black text-xl font-display">52% <span className="text-sm font-normal text-slate-500">IMPRESSIONS</span></p>
              </div>
           </div>
           <div className="text-right">
             <p className="text-emerald-500 font-bold font-mono">+8%</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;