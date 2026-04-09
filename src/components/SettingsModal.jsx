import React, { useState, useEffect } from 'react';
import { X, Key, Settings, Save } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [whisperKey, setWhisperKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setYoutubeKey(localStorage.getItem('RAPIDAPI_YOUTUBE_KEY') || '');
      setWhisperKey(localStorage.getItem('RAPIDAPI_WHISPER_KEY') || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('RAPIDAPI_YOUTUBE_KEY', youtubeKey.trim());
    localStorage.setItem('RAPIDAPI_WHISPER_KEY', whisperKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm fade-in p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col scale-in relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bring your own RapidAPI keys</p>
          </div>
        </div>

        {(import.meta.env.VITE_RAPIDAPI_KEY || import.meta.env.VITE_RAPIDAPI_WHISPER_KEY) && (
          <div className="mx-6 mt-4 p-3 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium border border-green-200 dark:border-green-900/50">
            Local `.env` keys detected! You don't need to save keys here, and the warning banner is automatically hidden.
          </div>
        )}

        <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-red-500" />
              YouTube-to-MP3 Key
            </label>
            <input
              type="password"
              value={youtubeKey}
              onChange={(e) => setYoutubeKey(e.target.value)}
              placeholder="Paste your RapidAPI key here..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Required to convert YouTube videos. Get it from RapidAPI.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              Whisper Speech Key
            </label>
            <input
              type="password"
              value={whisperKey}
              onChange={(e) => setWhisperKey(e.target.value)}
              placeholder="Paste your RapidAPI key here..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Required to transcribe audio files. GET it from RapidAPI.
            </p>
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-3">
          <button
            onClick={() => {
              setYoutubeKey('c8dfbe48b5msh6de251b1fc5cd86p1218eejsn268e9499dbc4');
              setWhisperKey('c8dfbe48b5msh6de251b1fc5cd86p1218eejsn268e9499dbc4');
            }}
            className="w-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center justify-center"
          >
            Use Free API Key
          </button>
          
          <button
            onClick={handleSave}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <span className="text-green-400 dark:text-green-600 flex items-center gap-2">Saved Successfully</span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save API Keys
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
