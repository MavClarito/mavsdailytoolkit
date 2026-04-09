import React, { useState, useEffect } from 'react';
import YoutubeConverter from './components/YoutubeConverter';
import SpeechTranscriber from './components/SpeechTranscriber';
import SettingsModal from './components/SettingsModal';
import { Moon, Sun, Database, Settings, ArrowRight } from 'lucide-react';
import { setQuotaListener } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [isDark, setIsDark] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quotas, setQuotas] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasKeys, setHasKeys] = useState(true);

  useEffect(() => {
    // Check system preference or saved preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const yKey = localStorage.getItem('RAPIDAPI_YOUTUBE_KEY') || import.meta.env.VITE_RAPIDAPI_KEY;
    const wKey = localStorage.getItem('RAPIDAPI_WHISPER_KEY') || import.meta.env.VITE_RAPIDAPI_WHISPER_KEY;
    if (!yKey || !wKey) {
      setHasKeys(false);
    }

    setQuotaListener((source, remaining, limit) => {
      setQuotas(prev => ({ ...prev, [source]: { remaining, limit } }));
    });
  }, []);

  const currentQuota = quotas[activeTab];

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-gray-100 font-sans flex flex-col items-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">

      {/* Absolute Progress Bar */}
      {isProcessing && (
        <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800 z-50 overflow-hidden">
          <div className="h-full bg-black dark:bg-white animate-[progress_1.5s_ease-in-out_infinite]_origin-left" />
        </div>
      )}

      {/* Theme & Settings Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-40">
        {!hasKeys ? (
          <div className="hidden sm:flex items-center text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-3 py-1.5 rounded-full mr-2 shadow-sm animate-pulse border border-blue-200 dark:border-blue-900/50">
            Click this, then select “Use Free API Key” to enable the tools. <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        ) : (
          <div className="hidden sm:flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-3 py-1.5 rounded-full mr-2 shadow-sm border border-emerald-200 dark:border-emerald-900/50">
            Great, you already have keys!
          </div>
        )}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          title="API Settings"
        >
          <Settings className="w-5 h-5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white" />
          {!hasKeys && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-gray-400 hover:text-white" /> : <Moon className="w-5 h-5 text-gray-500 hover:text-black" />}
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-10 mt-8">
        <img src="/MLogo.png" alt="Mav Tools Logo" className="w-16 h-16 mb-4 drop-shadow-sm" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Mav Tools</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center">
          A minimalist suite of powerful tools designed for speed and simplicity.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[600px] flex flex-col items-center">

        {/* Tab Selection */}
        <div className="flex w-full bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl mb-10 transition-colors">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === 'youtube'
              ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            YouTube to MP3
          </button>
          <button
            onClick={() => setActiveTab('speech')}
            className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === 'speech'
              ? 'bg-white dark:bg-gray-800 shadow-sm text-black dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            Speech Transcription
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full relative transition-colors duration-300">
          {activeTab === 'youtube' && <YoutubeConverter onProcessingChange={setIsProcessing} />}
          {activeTab === 'speech' && <SpeechTranscriber onProcessingChange={setIsProcessing} />}
        </div>

        {currentQuota && (
          <div className="w-full max-w-sm mt-8 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/40 flex flex-col gap-2 fade-in">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> {activeTab === 'youtube' ? 'YouTube' : 'Whisper'} Tokens</span>
              <span>{currentQuota.remaining} / {currentQuota.limit} left</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${currentQuota.remaining / currentQuota.limit < 0.2 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.max(0, Math.min(100, (currentQuota.remaining / currentQuota.limit) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>


      <div className="mt-auto pt-16 text-xs text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} Mav Tools. All rights reserved.
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          const yKey = localStorage.getItem('RAPIDAPI_YOUTUBE_KEY') || import.meta.env.VITE_RAPIDAPI_KEY;
          const wKey = localStorage.getItem('RAPIDAPI_WHISPER_KEY') || import.meta.env.VITE_RAPIDAPI_WHISPER_KEY;
          setHasKeys(!!(yKey && wKey));
        }}
      />
    </div>
  );
}

export default App;
