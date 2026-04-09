import React, { useState, useEffect } from 'react';
import { convertYoutubeToMp3 } from '../services/api';
import { Loader2, Download, PlaySquare } from 'lucide-react';

export default function YoutubeConverter({ onProcessingChange }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  
  const [previewInfo, setPreviewInfo] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const extractVideoId = (inputUrl) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = inputUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractedId = extractVideoId(url);
  const displayVideoId = extractedId || currentVideoId;
  const isPreviewingNew = extractedId && extractedId !== currentVideoId;
  const showResult = result && currentVideoId === displayVideoId;

  useEffect(() => {
    if (!extractedId) {
      setPreviewInfo(null);
      return;
    }
    
    setPreviewInfo((prev) => prev?.videoId !== extractedId ? null : prev);
    
    let isMounted = true;
    setPreviewLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${extractedId}`);
        const data = await res.json();
        if (isMounted) {
          if (!data.error) {
            setPreviewInfo({ videoId: extractedId, title: data.title });
          } else {
            setPreviewInfo({ videoId: extractedId, title: 'Unknown Video' });
          }
        }
      } catch (e) {
        if (isMounted) setPreviewInfo({ videoId: extractedId, title: 'Unknown Video' });
      } finally {
        if (isMounted) setPreviewLoading(false);
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [extractedId]);

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setCurrentVideoId(videoId);
    setLoading(true);
    if (onProcessingChange) onProcessingChange(true);
    
    try {
      const data = await convertYoutubeToMp3(videoId);
      
      if (data.status === 'ok' || data.title) {
        setResult(data);
      } else if (data.msg) {
        throw new Error(data.msg);
      } else {
        throw new Error('Failed to parse download link.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setLoading(false);
      if (onProcessingChange) onProcessingChange(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto fade-in">
      <div className="flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full mb-6">
        <PlaySquare className="w-8 h-8" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">YouTube to MP3</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">
        Enter a YouTube video link to convert and download as an MP3 file instantly.
      </p>

      <form onSubmit={handleConvert} className="w-full flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[110px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Convert'}
        </button>
      </form>

      {error && (
        <div className="w-full mt-6 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {displayVideoId && (
        <div className="w-full mt-6 p-6 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-4 fade-in shadow-sm">
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-2 relative">
             <img 
               src={`https://img.youtube.com/vi/${displayVideoId}/hqdefault.jpg`} 
               alt="Youtube Thumbnail" 
               className={`w-full h-full object-cover ${(loading || (previewLoading && isPreviewingNew)) ? 'opacity-50 grayscale' : 'opacity-100'} transition-all`}
             />
             {(loading || (previewLoading && isPreviewingNew)) && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-10 h-10 animate-spin text-white drop-shadow-lg" />
               </div>
             )}
          </div>
          
          <div>
            {(previewLoading && isPreviewingNew && !previewInfo) ? (
               <div className="flex flex-col gap-2">
                 <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
                 <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md" />
               </div>
            ) : (
              <>
                 <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2" title={showResult && result.title ? result.title : previewInfo?.title}>
                   {showResult && result.title 
                     ? result.title 
                     : (previewInfo?.videoId === displayVideoId 
                         ? previewInfo.title 
                         : 'Unknown Video')}
                 </h3>
                 {showResult && result.filesize ? (
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                     Size: {(result.filesize / 1024 / 1024).toFixed(2)} MB
                   </p>
                 ) : loading ? (
                   <p className="text-blue-500 dark:text-blue-400 text-sm mt-1 animate-pulse">
                     Converting video... This may take a moment.
                   </p>
                 ) : (
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                     Ready to convert
                   </p>
                 )}
              </>
            )}
          </div>

          {showResult && result.link && (
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white py-3 rounded-xl font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download MP3
            </a>
          )}
        </div>
      )}
    </div>
  );
}
