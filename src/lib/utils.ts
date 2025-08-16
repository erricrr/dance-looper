import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getYoutubeVideoId = (url: string): string | null => {
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1];
      } else if (urlObj.pathname.startsWith('/v/')) {
        videoId = urlObj.pathname.split('/v/')[1];
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1];
      }
    }
  } catch (e) {
    return null;
  }
  return videoId;
};

export const parseTimeToSeconds = (time: string): number => {
    const [minutes, seconds] = time.split(':').map(Number);
    return (minutes * 60) + seconds;
};

export const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  return new Date(seconds * 1000).toISOString().substr(14, 5)
}
