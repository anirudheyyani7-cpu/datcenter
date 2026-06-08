export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 60 * 60 * 1000;
const memCaches = { global: { articles: null, timestamp: 0 }, india: { articles: null, timestamp: 0 } };

const QUERY_GLOBAL =
  '("data center" OR datacenter OR hyperscale OR colocation OR "colo facility" OR ' +
  '"server farm" OR "edge computing" OR "cloud infrastructure" OR "power density" OR ' +
  '"cooling capacity" OR "PUE" OR "raised floor" OR "network operations center") ' +
  'AND NOT (sport OR football OR soccer OR basketball OR cricket OR celebrity OR entertainment)';

const QUERY_INDIA =
  '("data center" OR datacenter OR hyperscale OR colocation OR "cloud infrastructure") ' +
  'AND (india OR mumbai OR bangalore OR bengaluru OR hyderabad OR "delhi ncr" OR pune OR chennai OR noida) ' +
  'AND NOT (sport OR football OR cricket OR celebrity OR entertainment)';

const DC_KEYWORDS_GLOBAL = [
  'datacenter', 'data center', 'data centre', 'hyperscale', 'colocation', 'colo',
  'server farm', 'edge computing', 'cloud infrastructure', 'cloud campus',
  'power density', 'cooling', 'pue ', 'raised floor', 'rack capacity',
  'network operations', 'noc ', 'uptime institute', 'tier iv', 'tier iii',
  'megawatt', ' mw ', 'interconnect', 'peering', 'ix ', 'internet exchange',
  'aws', 'azure', 'google cloud', 'equinix', 'digital realty', 'ntt', 'cyrusone',
  'coresite', 'ironmountain', 'vantage', 'stack infrastructure', 'compass datacenters',
];

const DC_KEYWORDS_INDIA = [
  ...DC_KEYWORDS_GLOBAL,
  'india', 'mumbai', 'bangalore', 'bengaluru', 'hyderabad', 'delhi ncr', 'pune', 'chennai', 'noida',
  'adani', 'nxtra', 'nxtgen', 'ctrl s', 'ctrlS', 'yotta', 'sify', 'netmagic',
  'reliance jio', 'tata communications', 'sterlite', 'hiranandani', 'essar',
];

function makeFilter(keywords) {
  return (article) => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    return keywords.some(kw => text.includes(kw.toLowerCase()));
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') === 'india' ? 'india' : 'global';
  const cache = memCaches[mode];
  const now = Date.now();

  if (cache.articles && now - cache.timestamp < CACHE_TTL_MS) {
    return Response.json({ articles: cache.articles, cached: true, mode, nextRefresh: new Date(cache.timestamp + CACHE_TTL_MS).toISOString() });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return Response.json({ articles: [], cached: false, error: 'NEWS_API_KEY not configured.' }, { status: 500 });
  }

  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', mode === 'india' ? QUERY_INDIA : QUERY_GLOBAL);
    url.searchParams.set('language', 'en');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '30');
    url.searchParams.set('apiKey', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return Response.json({ articles: [], cached: false, error: err.message || `NewsAPI error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const filterFn = makeFilter(mode === 'india' ? DC_KEYWORDS_INDIA : DC_KEYWORDS_GLOBAL);
    const articles = (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]')
      .filter(filterFn)
      .slice(0, 12)
      .map(a => ({
        title: a.title,
        description: a.description || '',
        url: a.url,
        urlToImage: a.urlToImage || null,
        source: a.source?.name || 'Unknown',
        publishedAt: a.publishedAt,
      }));

    memCaches[mode] = { articles, timestamp: now };
    return Response.json({ articles, cached: false, mode, nextRefresh: new Date(now + CACHE_TTL_MS).toISOString() });
  } catch (err) {
    return Response.json({ articles: [], cached: false, error: err.message }, { status: 500 });
  }
}
