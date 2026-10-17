import { exec } from 'child_process';
import { youtubeQueue } from '@/lib/youtube-queue';
import { YoutubeVideoItem } from './types';

async function searchSingleYouTubeQueryRaw(q: string, limit: number): Promise<YoutubeVideoItem[]> {
  const encodedQuery = encodeURIComponent(q);
  const pythonCmd = `python3 -c "
import urllib.request, re, json, ssl, datetime
ssl._create_default_https_context = ssl._create_unverified_context
url = \\"https://www.youtube.com/results?search_query=${encodedQuery}\\"
headers = {
    'Referer': 'https://www.youtube.com/feed/subscriptions',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}
req = urllib.request.Request(url, headers=headers)
results = []
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    m = re.search(r'var ytInitialData = ({.*?});</script>', html)
    if m:
        data = json.loads(m.group(1))
        
        def find_renderers(obj):
            renderers = []
            if isinstance(obj, dict):
                if 'videoRenderer' in obj:
                    renderers.append(obj['videoRenderer'])
                for v in obj.values():
                    renderers.extend(find_renderers(v))
            elif isinstance(obj, list):
                for item in obj:
                    renderers.extend(find_renderers(item))
            return renderers

        for r in find_renderers(data)[:${limit}]:
            vid = r.get('videoId')
            if not vid: continue
            title = r.get('title', {}).get('runs', [{}])[0].get('text', '')
            pub_text = r.get('publishedTimeText', {}).get('simpleText', '')
            views_text = r.get('viewCountText', {}).get('simpleText') or r.get('shortViewCountText', {}).get('simpleText') or ''
            
            views_clean = re.sub(r'[^\\d]', '', views_text.replace('.', '').replace(',', ''))
            views_val = int(views_clean) if views_clean.isdigit() else 0
            
            pub_date = None
            if pub_text:
                nums = re.findall(r'\\d+', pub_text)
                val = int(nums[0]) if nums else 1
                now = datetime.datetime.now()
                if 'month' in pub_text.lower() or 'mes' in pub_text.lower():
                    pub_date = (now - datetime.timedelta(days=val*30)).strftime('%Y-%m-%dT%H:%M:%SZ')
                elif 'year' in pub_text.lower() or 'año' in pub_text.lower():
                    pub_date = (now - datetime.timedelta(days=val*365)).strftime('%Y-%m-%dT%H:%M:%SZ')
                elif 'day' in pub_text.lower() or 'día' in pub_text.lower():
                    pub_date = (now - datetime.timedelta(days=val)).strftime('%Y-%m-%dT%H:%M:%SZ')
                elif 'week' in pub_text.lower() or 'semana' in pub_text.lower():
                    pub_date = (now - datetime.timedelta(days=val*7)).strftime('%Y-%m-%dT%H:%M:%SZ')
                else:
                    pub_date = now.strftime('%Y-%m-%dT%H:%M:%SZ')
                    
            results.append({
                'id': vid,
                'title': title,
                'published': pub_date or datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
                'publishedText': pub_text,
                'views': views_val
            })
    print(json.dumps(results))
except Exception as e:
    print(json.dumps([]))
"`;
  return new Promise((resolve) => {
    exec(pythonCmd, (error, stdout) => {
      if (error || !stdout.trim()) {
        return resolve([]);
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve([]);
      }
    });
  });
}

export async function searchSingleYouTubeQuery(q: string, limit: number): Promise<YoutubeVideoItem[]> {
  return youtubeQueue.enqueue(() => searchSingleYouTubeQueryRaw(q, limit));
}

async function fetchVideoTranscriptRaw(videoId: string): Promise<string | null> {
  console.log(`[YouTubeHelper] Invoking Python to get transcript for video: ${videoId}`);

  const pythonCmd = `python3 -c "
import json
from youtube_transcript_api import YouTubeTranscriptApi
try:
    print(json.dumps(YouTubeTranscriptApi().fetch('${videoId}', languages=['en', 'en-US']).to_raw_data()))
except Exception as e:
    print(json.dumps({'error': type(e).__name__, 'msg': str(e)}))
"`;

  return new Promise((resolve) => {
    exec(pythonCmd, (error, stdout, stderr) => {
      if (error && !stdout.trim()) {
        console.warn(`[YouTubeHelper] Failed to fetch transcript for ${videoId}: ${error.message.substring(0, 100)}...`);
        return resolve(null);
      }

      try {
        const rawData = JSON.parse(stdout);
        if (rawData && rawData.error) {
          console.log(`[YouTubeHelper] Python Error for ${videoId}: ${rawData.error} - ${rawData.msg || ''}`);
          if (rawData.error === 'IpBlocked') {
            return resolve("ERROR_IP_BLOCKED");
          }
          return resolve(null);
        }
        if (Array.isArray(rawData)) {
          const textSegments = rawData.map((item: any) => item.text);
          const fullText = textSegments.join(' ');
          return resolve(fullText);
        }
        resolve(null);
      } catch (err: any) {
        console.error(`[YouTubeHelper] Error parsing Python stdout for ${videoId}:`, err.message);
        resolve(null);
      }
    });
  });
}

export async function fetchVideoTranscript(videoId: string): Promise<string | null> {
  return youtubeQueue.enqueue(() => fetchVideoTranscriptRaw(videoId));
}
