"use client";
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from './VideoCard';

export default function VideoCarousel({ channel, onPlay }) {
  const carouselRef = useRef(null);
  
  const scroll = (direction) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const cardWidth = 288; // 72rem (w-72) + 1rem spacing
      
      let scrollAmount;
      if (direction === 'left') {
        // Scroll exactly a number of complete cards to the left
        scrollAmount = -Math.floor(container.clientWidth / cardWidth) * cardWidth;
      } else {
        // Scroll exactly a number of complete cards to the right
        scrollAmount = Math.floor(container.clientWidth / cardWidth) * cardWidth;
      }
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-black dark:text-white mb-4">Recent Videos</h2>
      
      <div className="relative group">
        <div 
          ref={carouselRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {channel.videos.map((video) => (
            <div key={video.id} className="flex-shrink-0 w-72">
              <VideoCard video={video} onPlay={onPlay} />
            </div>
          ))}
        </div>
        
        {/* Navigation arrows - only show if there are enough videos to scroll */}
        {channel.videos.length > 3 && (
          <>
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white dark:bg-black bg-opacity-50 hover:bg-opacity-70 text-black dark:text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white dark:bg-black bg-opacity-50 hover:bg-opacity-70 text-black dark:text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none z-10"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}