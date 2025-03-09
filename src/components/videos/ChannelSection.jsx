import { Bell, ExternalLink } from 'lucide-react';
import VideoCarousel from './VideoCarousel';
import { formatSubscriberCount } from './utils';

export default function ChannelSection({ channel, onPlay }) {
  if (!channel || !channel.videos || channel.videos.length === 0) return null;
  
  const formattedSubscribers = formatSubscriberCount(channel.subscriberCount);
  
  return (
    <div className="mb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <img 
            src={channel.channelThumbnail || "/channel-placeholder.jpg"} 
            alt={channel.channelTitle} 
            className="w-10 h-10 rounded-full border-2 border-blue-500 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-xl font-bold text-black dark:text-white flex items-center truncate">
              <span className="truncate">{channel.channelTitle}</span>
              <a 
                href={`https://www.youtube.com/channel/${channel.channelId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </a>
            </h2>
            <p className="text-sm text-gray-400">
              {formattedSubscribers} subscribers
            </p>
          </div>
        </div>
        
        <a 
          href={`https://www.youtube.com/channel/${channel.channelId}?sub_confirmation=1`}
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full flex items-center justify-center transition-colors duration-300 w-full sm:w-auto"
        >
          <Bell className="mr-2 w-5 h-5" />
          Subscribe
        </a>
      </div>
      
      <VideoCarousel 
        channel={channel}
        onPlay={onPlay}
      />
    </div>
  );
}