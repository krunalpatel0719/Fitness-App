import { fetchYouTubeVideos } from '@/lib/youtube';
import { NextResponse } from 'next/server';

export const revalidate = 21600;

let cachedData = null;
let cacheTime = null;

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  const channelIds = [
    'UC68TLK0mAEzUyHx5x5k-S1Q',
    'UCERm5yFZ1SptUEU4wZ2vJvw', 
    'UCfQgsKhHjSyRLOp9mnffqVg',
    'UCB2wtYpfbCpYDc5TeTwuqFA',
    'UCEjIjshJ8bvvCkGNk0pkYcA',
    'UCe0TLA0EsQbE-MjuHXevj2A',
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
    const now = Date.now();
    if (cachedData && cacheTime && (now - cacheTime < revalidate * 1000)) {
      return NextResponse.json(cachedData);
    }
    
    const data = await fetchYouTubeVideos(apiKey, channelIds);
    
    cachedData = data;
    cacheTime = now;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}