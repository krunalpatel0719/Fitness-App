"use client";
import { useState } from 'react';
import { Eye, Clock, Play } from 'lucide-react';
import { formatViewCount } from './utils';

export default function VideoCard({ video, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative cursor-pointer transition-transform duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(video)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <img 
          src={video.thumbnail || `/video-placeholder.jpg`} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.src = "/video-placeholder.jpg"; }}
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {video.duration || "10:00"}
        </div>
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="bg-red-600 rounded-full p-3 transform transition-transform duration-300 hover:scale-110">
            <Play fill="white" size={24} />
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className={`text-sm font-medium line-clamp-2 transition-colors duration-300 ${isHovered ? 'text-blue-400' : 'text-gray-700 dark:text-gray-100'}`}>
          {video.title}
        </h3>
        <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
          {video.viewCount && (
            <div className="flex items-center">
              <Eye size={12} className="mr-1" />
              <span>{formatViewCount(video.viewCount)} views</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock size={12} className="mr-1" />
            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}