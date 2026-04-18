// Cloudflare Worker for webintel.dev
//
// Purpose
// -------
// The origin (Render) serves static HTML. This Worker sits on a Cloudflare
// route in front of that origin and adds two things the Render static site
// can't do on its own:
//
//   1. RFC 8288 Link response headers on every HTML response pointing agents
//      at discovery resources (api-catalog, service-desc, service-doc,
//      mcp-server-card, agent-skills, sitemap).
//
//   2. Markdown for Agents: when the request carries `Accept: text/markdown`
//      on an HTML route, the Worker transparently fetches the `.md` sibling
//      from the same origin and returns it with `Content-Type: text/markdown`
//      plus `Vary: Accept`. Browsers continue to get HTML.
//
// Deploy
// ------
// See cloudflare/wrangler.toml. Typical deploy:
//
//     cd cloudflare
//     npx wrangler deploy
//
// Route: webintel.dev/* (set in wrangler.toml).

const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.yaml>; rel="service-desc"; type="application/vnd.oai.openapi"',
  '</#docs>; rel="service-doc"; type="text/html"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(', ');

function parseAccept(header) {
  if (!header) return [];
  return header.split(',').map((part) => {
    const [type, ...params] = part.trim().split(';').map((s) => s.trim());
    let q = 1;
    for (const p of params) {
      const m = p.match(/^q=([0-9.]+)$/i);
      if (m) q = parseFloat(m[1]);
    }
    return { type: type.toLowerCase(), q };
  });
}

function wantsMarkdown(acceptHeader) {
  const entries = parseAccept(acceptHeader);
  if (!entries.length) return false;
  const mdQ = Math.max(
    ...entries.filter((e) => e.type === 'text/markdown' || e.type === 'text/*').map((e) => e.q),
    0,
  );
  if (mdQ === 0) return false;
  const htmlQ = Math.max(
    ...entries.filter((e) => e.type === 'text/html' || e.type === 'application/xhtml+xml').map((e) => e.q),
    0,
  );
  // Prefer markdown when the client quality for markdown is at least as high
  // as for HTML, or when HTML isn't in the Accept list at all.
  return mdQ >= htmlQ;
}

function markdownPathFor(pathname) {
  if (pathname === '/' || pathname === '') return '/index.md';
  if (pathname.endsWith('/')) return `${pathname}index.md`;
  if (pathname.endsWith('.md')) return pathname;
  if (/\.[a-z0-9]+$/i.test(pathname)) return null; // different extension, not HTML
  return `${pathname}.md`;
}

async function tryMarkdown(request, url) {
  const mdPath = markdownPathFor(url.pathname);
  if (!mdPath) return null;
  const mdUrl = new URL(mdPath, url);
  const mdReq = new Request(mdUrl.toString(), {
    method: 'GET',
    headers: { accept: 'text/markdown,*/*;q=0.1' },
    redirect: 'follow',
  });
  const res = await fetch(mdReq);
  if (!res.ok) return null;
  const headers = new Headers(res.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('Vary', 'Accept');
  headers.set('Link', DISCOVERY_LINKS);
  headers.set('X-Markdown-Source', mdPath);
  const body = await res.text();
  // Best-effort token count (whitespace-delimited) for `x-markdown-tokens`
  // so downstream tooling can budget context.
  try {
    const tokens = body.trim().split(/\s+/).length;
    headers.set('x-markdown-tokens', String(tokens));
  } catch (_) { /* ignore */ }
  return new Response(body, { status: 200, headers });
}

function withDiscoveryHeaders(response) {
  const headers = new Headers(response.headers);
  const existing = headers.get('Link');
  if (existing) {
    // Append missing rels rather than clobber.
    const have = existing.toLowerCase();
    const additions = DISCOVERY_LINKS.split(', ').filter((link) => {
      const rel = link.match(/rel="([^"]+)"/);
      return !(rel && have.includes(`rel="${rel[1]}"`));
    });
    if (additions.length) headers.set('Link', `${existing}, ${additions.join(', ')}`);
  } else {
    headers.set('Link', DISCOVERY_LINKS);
  }
  const vary = headers.get('Vary');
  if (!vary || !/\baccept\b/i.test(vary)) {
    headers.set('Vary', vary ? `${vary}, Accept` : 'Accept');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && wantsMarkdown(request.headers.get('accept'))) {
      const md = await tryMarkdown(request, url);
      if (md) return md;
    }

    const originResponse = await fetch(request);
    const contentType = originResponse.headers.get('content-type') || '';
    if (contentType.startsWith('text/html')) {
      return withDiscoveryHeaders(originResponse);
    }
    return originResponse;
  },
};
