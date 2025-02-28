import { fetchYouTubeVideos } from '@/lib/youtube';
import { NextResponse } from 'next/server';

// Cache duration in seconds (6 hours)
export const revalidate = 21600;

// In-memory cache (will persist until server restart)
let cachedData = null;
let cacheTime = null;

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  const channelIds = [
    'UC68TLK0mAEzUyHx5x5k-S1Q', // Google Developers
    'UCERm5yFZ1SptUEU4wZ2vJvw', // Jeremy Ethier
    'UCfQgsKhHjSyRLOp9mnffqVg',
    'UCB2wtYpfbCpYDc5TeTwuqFA',
    'UCEjIjshJ8bvvCkGNk0pkYcA',
    'UCe0TLA0EsQbE-MjuHXevj2A', // Athlean-X
    'UCCgLoMYIyP0U56dEhEL1wXQ',
    'UCaBqRxHEMomgFU-AkSfodCw', 
    'UCiP6wD_tYlYLYh3agzbByWQ',
    'UCFKE7WVJfvaHW5q283SxchA',
    'UCj0V0aG4LcdHmdPJ7aTtSCQ',
    'UCYidQwKhM3WTDKpT8pwfJzw',
    'UCqRdvREgI2qLnKtiMfswzZQ',
    'UCBF73y3tK1gYu9p2ag9wJEQ',
    
  ];
  
 


  try {
    // Check if we have valid cached data (cache for 6 hours)
    const now = Date.now();
    if (cachedData && cacheTime && (now - cacheTime < revalidate * 1000)) {
      console.log('Serving YouTube data from cache');
      return NextResponse.json(cachedData);
    }
    
    console.log('Fetching fresh YouTube data');
    const data = await fetchYouTubeVideos(apiKey, channelIds);
    
    // Update the cache
    cachedData = data;
    cacheTime = now;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    // If we have stale cache, return it during errors rather than failing
    if (cachedData) {
      console.log('Error occurred, falling back to stale cache');
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}