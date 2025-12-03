import { ChartData } from '../types';

export const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
  
  return {
    stats: [
      { title: "Total Views", value: "2.4M", change: 12.5, type: 'views' },
      { title: "Subscribers/Followers", value: "85.2K", change: 2.1, type: 'users' },
      { title: "Engagement Rate", value: "8.4%", change: -0.4, type: 'engagement' },
      { title: "Shares", value: "12.5K", change: 18.2, type: 'shares' },
    ],
    chartData: [
      { name: 'Mon', yt: 4000, fb: 2400 },
      { name: 'Tue', yt: 3000, fb: 1398 },
      { name: 'Wed', yt: 2000, fb: 9800 },
      { name: 'Thu', yt: 2780, fb: 3908 },
      { name: 'Fri', yt: 1890, fb: 4800 },
      { name: 'Sat', yt: 2390, fb: 3800 },
      { name: 'Sun', yt: 3490, fb: 4300 },
    ] as ChartData[]
  };
};