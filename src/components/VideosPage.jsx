"use client";
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Heart, Share2 } from 'lucide-react';
import FeaturedVideo from './videos/FeaturedVideo';
import ChannelSection from './videos/ChannelSection';

const fetcher = (...args) => fetch(...args).then(res => res.json());

export default function VideosPage() {
  const CACHE_KEY = 'youtube_videos_cache';
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  
  // Check for cached data on component mount
  const [initialData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Check if cache is still valid
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
          }
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
    }
    return null;
  });

  // Use SWR for data fetching with caching
  const { data: channels, error, isLoading } = useSWR('/api/videos', fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0, 
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('Error writing to localStorage:', e);
        }
      }
    }
  });
  
  useEffect(() => {
    if (channels && channels.length > 0 && channels[0].videos && channels[0].videos.length > 0) {
      setFeaturedVideo({
        ...channels[0].videos[0],
        channelTitle: channels[0].channelTitle,
        channelThumbnail: channels[0].channelThumbnail,
        channelId: channels[0].channelId
      });
    }
  }, [channels]);
  
  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  if (isLoading && !initialData) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading videos...</p>
        </div>
      </div>
    );
  }
  
  if (error && !channels) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded">
          <p>Failed to load videos. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Featured Videos</h1>
        
        {/* Video Player or Featured Video */}
        {isPlaying && selectedVideo ? (
          <div className="mb-16 aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            
            <div className="bg-zinc-800 p-4 rounded-b-xl">
              <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-sm text-gray-300 space-x-4">
                  <div>
                    {new Date(selectedVideo.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full transition-colors duration-300">
                    <Heart size={20} />
                  </button>
                  <button className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full transition-colors duration-300">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          featuredVideo && <FeaturedVideo video={featuredVideo} onPlay={handlePlayVideo} />
        )}
        
        {/* Channel Sections */}
        {channels?.map((channel) => (
          <ChannelSection 
            key={channel.channelId} 
            channel={channel} 
            onPlay={handlePlayVideo}
          />
        ))}
      </div>
      
      {isLoading && initialData && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full text-sm">
          Refreshing data...
        </div>
      )}
    </div>
  );
}