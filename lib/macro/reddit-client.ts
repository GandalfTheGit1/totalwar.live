/**
 * lib/macro/reddit-client.ts
 *
 * Client for fetching public Reddit posts using Reddit's JSON search endpoints.
 * Provides social sentiment, public comments, and early warnings on economic events.
 */

export interface RedditPostItem {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  url: string;
  created_utc: number;
  permalink: string;
  score: number;
  num_comments: number;
}

/**
 * Fetches recent economic discussions from Reddit for a specific search query.
 * Queries /r/economics and general search in parallel.
 */
export async function fetchRedditDiscussions(query: string, limit = 15, searchContext: 'macro' | 'general' = 'macro'): Promise<RedditPostItem[]> {
  const posts: RedditPostItem[] = [];
  const queryStr = encodeURIComponent(query);
  
  // Use a user-agent to avoid Reddit blocking default bot user-agents
  const headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
  };

  let urls: string[] = [];
  
  if (searchContext === 'macro') {
    urls = [
      `https://www.reddit.com/r/economics/search.json?q=${queryStr}&restrict_sr=1&sort=new&limit=${limit}`,
      `https://www.reddit.com/r/stocks/search.json?q=${queryStr}&restrict_sr=1&sort=new&limit=${limit}`,
      `https://www.reddit.com/search.json?q=${queryStr}+economy&sort=new&limit=${limit}`
    ];
  } else {
    // General search across all of Reddit, sorted by relevance to catch privacy/general complaints
    urls = [
      `https://www.reddit.com/search.json?q=${queryStr}&sort=relevance&t=year&limit=${limit * 2}`
    ];
  }

  const fetchPromises = urls.map(async (url) => {
    try {
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (!res.ok) {
        console.warn(`[RedditClient] Failed to fetch from ${url}: ${res.status}`);
        return [];
      }
      
      const json = await res.json();
      const children = json.data?.children || [];
      
      return children.map((child: any): RedditPostItem => {
        const d = child.data;
        return {
          id: d.id || Math.random().toString(36).substr(2, 9),
          title: d.title || '',
          selftext: d.selftext || '',
          author: d.author || 'anonymous',
          subreddit: d.subreddit || 'economics',
          url: d.url || `https://reddit.com${d.permalink}`,
          created_utc: d.created_utc || Math.floor(Date.now() / 1000),
          permalink: d.permalink || '',
          score: d.score || 0,
          num_comments: d.num_comments || 0,
        };
      });
    } catch (err) {
      console.error(`[RedditClient] Error querying ${url}:`, err);
      return [];
    }
  });

  try {
    const results = await Promise.all(fetchPromises);
    
    // Flatten results and deduplicate by permalink / title
    const seen = new Set<string>();
    for (const sublist of results) {
      for (const item of sublist) {
        if (!item.title) continue;
        const key = item.permalink || item.title;
        if (!seen.has(key)) {
          seen.add(key);
          posts.push(item);
        }
      }
    }

    // Sort by creation date descending
    return posts.sort((a, b) => b.created_utc - a.created_utc).slice(0, limit);
  } catch (err) {
    console.error(`[RedditClient] Combined fetch error:`, err);
    return [];
  }
}
