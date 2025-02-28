import axios from 'axios';

const MAX_RESULTS_PER_CHANNEL = 10; // Adjust based on your needs

// Fetch videos from a YouTube channel
async function fetchChannelVideos(channelId, apiKey) {
  try {
    // Get channel data including statistics for subscriber count
    const channelResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,statistics&id=${channelId}&key=${apiKey}`
    );
    
    const channel = channelResponse.data.items[0];
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
    const channelTitle = channel.snippet.title;
    const channelThumbnail = channel.snippet.thumbnails.default.url;
    const subscriberCount = channel.statistics.subscriberCount;
    
    // Get videos from that playlist
    const videosResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${MAX_RESULTS_PER_CHANNEL}&playlistId=${uploadsPlaylistId}&key=${apiKey}`
    );
    
    // Extract video IDs to get view counts in a batch request
    const videoIds = videosResponse.data.items.map(item => item.contentDetails.videoId).join(',');
    
    // Get video statistics in a single batch request to minimize API usage
    const videoStatsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    );
    
    // Create a map of video stats by ID
    const videoStatsMap = {};
    videoStatsResponse.data.items.forEach(item => {
      videoStatsMap[item.id] = {
        viewCount: item.statistics.viewCount,
        duration: formatYouTubeDuration(item.contentDetails.duration)
      };
    });
    
    // Format the response
    return {
      channelId,
      channelTitle,
      channelThumbnail,
      subscriberCount,
      videos: videosResponse.data.items.map(item => {
        const videoId = item.contentDetails.videoId;
        const stats = videoStatsMap[videoId] || {};
        
        return {
          id: videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
          description: item.snippet.description,
          viewCount: stats.viewCount,
          duration: stats.duration
        };
      })
    };
  } catch (error) {
    console.error(`Error fetching videos for channel ${channelId}:`, error);
    return {
      channelId,
      channelTitle: 'Channel unavailable',
      videos: []
    };
  }
}

// Format ISO 8601 duration to human-readable format
function formatYouTubeDuration(duration) {
  if (!duration) return "0:00";
  
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  
  const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
  const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
  const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Main API handler
export async function fetchYouTubeVideos(apiKey, channelIds) {
  try {
    const channelPromises = channelIds.map(channelId => 
      fetchChannelVideos(channelId, apiKey)
    );
    
    const channels = await Promise.all(channelPromises);
    return channels;
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    throw new Error('Failed to fetch YouTube videos');
  }
}