import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/api';
import { Loader2, Mic, UploadCloud, Copy, Check } from 'lucide-react';

export default function SpeechTranscriber({ onProcessingChange }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typeProgress, setTypeProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  React.useEffect(() => {
    if (!result) {
      setDisplayedText('');
      setTypeProgress(0);
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    setTypeProgress(0);

    const textLength = result.length;
    const totalTime = Math.min(Math.max(textLength * 20, 1000), 5000);
    const updateInterval = 30; // ms
    const totalSteps = totalTime / updateInterval;
    const charsPerStep = textLength / totalSteps;

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += charsPerStep;
      if (currentLength >= textLength) {
        setDisplayedText(result);
        setTypeProgress(100);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(result.slice(0, Math.floor(currentLength)));
        setTypeProgress((currentLength / textLength) * 100);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [result]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('audio/')) {
      setFile(selected);
      setError('');
    } else if (selected) {
      setError('Please upload a valid audio file.');
      setFile(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);
    if (onProcessingChange) onProcessingChange(true);
    setError('');
    setResult('');
    setCopied(false);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + (90 - prev) * 0.15;
      });
    }, 500);

    try {
      const data = await transcribeAudio(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        if (typeof data === 'string') {
          setResult(data);
        } else if (data && data.text) {
          setResult(data.text);
        } else if (data && data.result) {
          setResult(data.result);
        } else {
          setResult(JSON.stringify(data, null, 2));
        }
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError(err.message || 'An error occurred during transcription.');
    } finally {
      setTimeout(() => {
        setLoading(false);
        if (onProcessingChange) onProcessingChange(false);
      }, 500);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto fade-in">
      <div className="flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full mb-6">
        <Mic className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">Speech to Text</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">
        Upload an audio file to automatically transcribe it into text using advanced AI.
      </p>

      <div className="w-full">
        {/* Upload Box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${file ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-900'}`}
        >
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <UploadCloud className={`w-8 h-8 ${file ? 'text-black dark:text-white' : 'text-gray-400'}`} />
          <div className="text-center">
            {file ? (
              <p className="text-sm font-medium text-black dark:text-white truncate max-w-[200px]">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-black dark:text-white">Click to upload audio</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MP3, WAV, M4A</p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleTranscribe}
          disabled={loading || !file}
          className="w-full mt-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center relative overflow-hidden"
        >
          {/* Green Progress Bar that overlaps from left to right behind button text */}
          {loading && (
            <div 
              className="absolute top-0 left-0 h-full bg-green-500/20 dark:bg-green-500/30 transition-all duration-300 ease-out z-0"
              style={{ width: `${uploadProgress}%` }}
            />
          )}

          <div className="relative z-10 flex items-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? `Transcribing... (${Math.round(uploadProgress)}%)` : 'Transcribe Audio'}
          </div>
        </button>
      </div>

      {error && (
        <div className="w-full mt-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="w-full mt-6 p-1 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex flex-col fade-in shadow-sm relative group overflow-hidden">
          {isTyping && (
            <div className="mx-2 mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-75 ease-linear"
                style={{ width: `${typeProgress}%` }}
              />
            </div>
          )}
          <div className={`bg-white dark:bg-gray-900 mx-1 mb-1 ${isTyping ? 'mt-2' : 'mt-1'} rounded-xl p-5 min-h-[120px] max-h-[300px] overflow-y-auto border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-sm leading-relaxed relative`}>
            {displayedText}
            {isTyping && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 translate-y-0.5 animate-pulse" />}
          </div>
          <div className="p-3">
             <button
              onClick={copyToClipboard}
              disabled={isTyping}
              className="flex items-center justify-center gap-2 w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black py-2.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Transcription
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
