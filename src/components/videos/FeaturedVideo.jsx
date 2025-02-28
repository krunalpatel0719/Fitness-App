import { Clock, Play, Heart, Share2 } from 'lucide-react';

export default function FeaturedVideo({ video, onPlay }) {
  if (!video) return null;
  
  return (
    <div className="mb-16 relative rounded-xl overflow-hidden">
      <div 
        className="relative aspect-video cursor-pointer group"
        onClick={() => onPlay(video)}
      >
        <img 
          src={video.thumbnail || "/video-placeholder.jpg"} 
          alt={video.title} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "/video-placeholder.jpg"; }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-600 bg-opacity-90 rounded-full p-6 transform transition-transform duration-300 group-hover:scale-110">
            <Play fill="white" size={32} />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 p-6 w-full md:w-2/3">
          <div className="flex items-center mb-3">
            <img 
              src={video.channelThumbnail || "/channel-placeholder.jpg"} 
              alt={video.channelTitle} 
              className="w-8 h-8 rounded-full mr-3"
            />
            <span className="text-white font-medium">{video.channelTitle}</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{video.title}</h1>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {video.description || "Watch this great fitness video to improve your workout routine."}
          </p>
          
          <div className="flex items-center text-sm text-gray-300 space-x-4">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 flex space-x-2">
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors duration-300">
          <Heart size={20} />
        </button>
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors duration-300">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}