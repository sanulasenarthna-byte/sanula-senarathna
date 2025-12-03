import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import TrendAnalyzer from './components/TrendAnalyzer';
import ReplyAssistant from './components/ReplyAssistant';
import ImageEditor from './components/ImageEditor';
import SmartChat from './components/SmartChat';
import VoiceAgent from './components/VoiceAgent';
import VideoStudio from './components/VideoStudio';
import LoginScreen from './components/LoginScreen';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('isLoggedIn');
    if (session === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <ContentGenerator />;
      case 'image-editor':
        return <ImageEditor />;
      case 'video-studio':
        return <VideoStudio />;
      case 'trends':
        return <TrendAnalyzer />;
      case 'inbox':
        return <ReplyAssistant />;
      case 'chat':
        return <SmartChat />;
      case 'live':
        return <VoiceAgent />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300 relative overflow-hidden font-sans">
      
      {/* Global Background Grid for App */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute inset-0 cyber-grid-bg opacity-30 dark:opacity-40"></div>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:ml-64 transition-all duration-300 relative z-10">
        <div className="container mx-auto p-4 lg:p-8 pt-20 lg:pt-8 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;