import * as cheerio from 'cheerio';
import { youtubeQueue } from '@/lib/youtube-queue';
import { YoutubeVideo } from './types';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetches recent video metadata from a YouTube channel's RSS feed.
 */
export async function fetchRecentVideos(channelId: string, limit = 5): Promise<YoutubeVideo[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  console.log(`[YouTubeHelper] Fetching RSS feed from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const $ = cheerio.load(xmlText, { xmlMode: true });
    const videos: YoutubeVideo[] = [];

    $('entry').slice(0, limit).each((_, entry) => {
      const id = $(entry).find('yt\\:videoId, videoId').text().trim();
      const title = $(entry).find('title').text().trim();
      const description = $(entry).find('media\\:description, description').text().trim();
      const published = $(entry).find('published').text().trim();

      if (id && title) {
        videos.push({ id, title, published, description });
      }
    });

    return videos;
  } catch (error: any) {
    console.error(`[YouTubeHelper] Error fetching RSS feed for channel ${channelId}:`, error.message);
    return [];
  }
}

async function fetchVideoMetadataRaw(videoId: string): Promise<{ title: string; description: string; published?: string; views?: number } | null> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let title = $('meta[name="title"]').attr('content') || 
                $('meta[property="og:title"]').attr('content') || 
                $('title').text().replace(' - YouTube', '').trim();

    let description = $('meta[name="description"]').attr('content') || 
                      $('meta[property="og:description"]').attr('content') || '';

    // 1. Cheerio Meta Extraction
    let published = $('meta[itemprop="datePublished"]').attr('content') || 
                    $('meta[itemprop="uploadDate"]').attr('content') ||
                    $('meta[property="og:video:release_date"]').attr('content');

    let rawViews = $('meta[itemprop="interactionCount"]').attr('content') || 
                   $('meta[itemprop="views"]').attr('content');

    // 2. Fallback: Regex extraction from embedded JSON (ytInitialPlayerResponse / microformat)
    if (!title || title === 'YouTube') {
      const titleMatch = html.match(/\"title\":\"([^\"]+)\"/);
      if (titleMatch && titleMatch[1]) title = titleMatch[1];
    }

    if (!published) {
      const pubMatch = html.match(/\"publishDate\":\"([^\"]+)\"/) || 
                       html.match(/\"uploadDate\":\"([^\"]+)\"/) ||
                       html.match(/\"datePublished\":\"([^\"]+)\"/);
      if (pubMatch && pubMatch[1]) {
        published = pubMatch[1];
      }
    }

    if (!rawViews) {
      const viewsMatch = html.match(/\"viewCount\":\"([^\"]+)\"/) ||
                         html.match(/\"views\":\"([^\"]+)\"/);
      if (viewsMatch && viewsMatch[1]) {
        rawViews = viewsMatch[1];
      }
    }

    const views = parseInt(rawViews || '0', 10) || 0;
    
    console.log(`[YouTubeHelper] Scraped Video ${videoId}: title="${title.substring(0, 40)}...", published=${published || 'N/A'}, views=${views}`);

    return { title, description, published, views };
  } catch (error) {
    console.error(`[YouTubeHelper] Error fetching metadata for video ${videoId}:`, error);
    return null;
  }
}

export async function fetchVideoMetadata(videoId: string): Promise<{ title: string; description: string; published?: string; views?: number } | null> {
  return youtubeQueue.enqueue(() => fetchVideoMetadataRaw(videoId));
}
