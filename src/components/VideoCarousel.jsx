// src/components/VideoCarousel.jsx

"use client";

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';

export default function VideoCarousel({ channel }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollContainerRef = useRef(null);
  
  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (activeIndex < channel.videos.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };
  
  const playVideo = (videoId) => {
    setIsPlaying(true);
  };
  
  return (
    <div className="mb-12">
       <h2 className="text-xl font-bold text-white mb-4"> Recent Videos </h2>
      {/* <div className="flex items-center mb-4 space-x-2">
        <img 
          src={channel.channelThumbnail} 
          alt={channel.channelTitle} 
          className="w-8 h-8 rounded-full"
        />
        <h2 className="text-xl font-bold">{channel.channelTitle}</h2>
        <a 
          href={`https://www.youtube.com/channel/${channel.channelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <ExternalLink size={16} className="ml-1" />
        </a>
      </div> */}
      
      {/* Video Player or Thumbnail */}
      <div className="mb-4 relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {isPlaying ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${channel.videos[activeIndex].id}?autoplay=1`}
            title={channel.videos[activeIndex].title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => playVideo(channel.videos[activeIndex].id)}
          >
            <img
              src={channel.videos[activeIndex].thumbnail}
              alt={channel.videos[activeIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-70 rounded-full p-4 group-hover:bg-red-600 transition-colors">
                <Play fill="white" size={32} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Video Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{channel.videos[activeIndex]?.title}</h3>
        <p className="text-gray-600 text-sm">{new Date(channel.videos[activeIndex]?.publishedAt).toLocaleDateString()}</p>
      </div>
      
      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <button 
          onClick={handlePrev} 
          disabled={activeIndex === 0}
          className={`p-2 rounded-full ${activeIndex === 0 ? 'text-gray-400' : 'text-gray-800 hover:bg-gray-200'}`}
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="text-center">
          {activeIndex + 1} / {channel.videos.length}
        </div>
        
        <button 
          onClick={handleNext} 
          disabled={activeIndex === channel.videos.length - 1}
          className={`p-2 rounded-full ${activeIndex === channel.videos.length - 1 ? 'text-gray-400' : 'text-gray-800 hover:bg-gray-200'}`}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Thumbnails Navigation */}
      <div 
        className="flex space-x-2 mt-4 overflow-x-auto py-2 scrollbar-hide" 
        ref={scrollContainerRef}
      >
        {channel.videos.map((video, index) => (
          <div 
            key={video.id}
            onClick={() => {
              setActiveIndex(index);
              setIsPlaying(false);
            }}
            className={`flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${index === activeIndex ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
            style={{ width: '120px' }}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

