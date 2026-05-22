export const revalidate = 3600;

let memCache = { articles: null, timestamp: 0 };
const CACHE_TTL_MS = 60 * 60 * 1000;

// Narrow NewsAPI query — all terms are datacenter-domain specific
const QUERY =
  '("data center" OR datacenter OR hyperscale OR colocation OR "colo facility" OR ' +
  '"server farm" OR "edge computing" OR "cloud infrastructure" OR "power density" OR ' +
  '"cooling capacity" OR "PUE" OR "raised floor" OR "network operations center") ' +
  'AND NOT (sport OR football OR soccer OR basketball OR cricket OR celebrity OR entertainment)';

// Secondary keyword filter applied after API response to catch any strays.
// An article must match at least one of these in its title or description.
const DC_KEYWORDS = [
  'datacenter', 'data center', 'data centre', 'hyperscale', 'colocation', 'colo',
  'server farm', 'edge computing', 'cloud infrastructure', 'cloud campus',
  'power density', 'cooling', 'pue ', 'raised floor', 'rack capacity',
  'network operations', 'noc ', 'uptime institute', 'tier iv', 'tier iii',
  'megawatt', ' mw ', 'interconnect', 'peering', 'ix ', 'internet exchange',
  'aws', 'azure', 'google cloud', 'equinix', 'digital realty', 'ntt', 'cyrusone',
  'coresite', 'ironmountain', 'vantage', 'stack infrastructure', 'compass datacenters',
];

function isDatacenterArticle(article) {
  const text = `${article.title} ${article.description}`.toLowerCase();
  return DC_KEYWORDS.some(kw => text.includes(kw));
}

export async function GET() {
  const now = Date.now();

  if (memCache.articles && now - memCache.timestamp < CACHE_TTL_MS) {
    return Response.json({
      articles: memCache.articles,
      cached: true,
      nextRefresh: new Date(memCache.timestamp + CACHE_TTL_MS).toISOString(),
    });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { articles: [], cached: false, error: 'NEWS_API_KEY not configured.' },
      { status: 500 }
    );
  }

  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', QUERY);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    // Fetch more than we need so the keyword filter still leaves 12 good results
    url.searchParams.set('pageSize', '30');
    url.searchParams.set('apiKey', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return Response.json(
        { articles: [], cached: false, error: err.message || `NewsAPI error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .filter(isDatacenterArticle)
      .slice(0, 12)
      .map(a => ({
        title: a.title,
        description: a.description || '',
        url: a.url,
        urlToImage: a.urlToImage || null,
        source: a.source?.name || 'Unknown',
        publishedAt: a.publishedAt,
      }));

    memCache = { articles, timestamp: now };
    return Response.json({
      articles,
      cached: false,
      nextRefresh: new Date(now + CACHE_TTL_MS).toISOString(),
    });
  } catch (err) {
    return Response.json(
      { articles: [], cached: false, error: err.message },
      { status: 500 }
    );
  }
}
