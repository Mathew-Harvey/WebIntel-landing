// Cloudflare Pages middleware: Markdown for Agents content negotiation.
//
// When a request carries `Accept: text/markdown` for a route that has a
// matching `.md` sibling (e.g. `/` -> `/index.md`), return the markdown
// instead of the HTML. HTML remains the default for browsers.
//
// Also adds RFC 8288 `Link` headers pointing agents at discovery resources
// and sets `Vary: Accept` so caches handle negotiation correctly.

const DISCOVERY_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.yaml>; rel="service-desc"; type="application/vnd.oai.openapi"',
  '</#docs>; rel="service-doc"; type="text/html"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(', ');

function wantsMarkdown(accept) {
  if (!accept) return false;
  const lowered = accept.toLowerCase();
  if (!lowered.includes('text/markdown')) return false;
  // If the client prefers HTML (q=1) over markdown, prefer HTML.
  const parts = lowered.split(',').map(s => s.trim());
  const mdPart = parts.find(p => p.startsWith('text/markdown'));
  const htmlPart = parts.find(p => p.startsWith('text/html'));
  const q = (p) => {
    if (!p) return 0;
    const m = p.match(/q=([0-9.]+)/);
    return m ? parseFloat(m[1]) : 1;
  };
  return q(mdPart) >= q(htmlPart);
}

function markdownSibling(pathname) {
  if (pathname === '/' || pathname === '') return '/index.md';
  if (pathname.endsWith('/')) return `${pathname}index.md`;
  if (pathname.endsWith('.md')) return pathname;
  if (/\.[a-z0-9]+$/i.test(pathname)) return null; // has a different extension
  return `${pathname}.md`;
}

export const onRequest = async ({ request, next, env }) => {
  const url = new URL(request.url);

  if (request.method === 'GET' && wantsMarkdown(request.headers.get('accept'))) {
    const mdPath = markdownSibling(url.pathname);
    if (mdPath) {
      const mdUrl = new URL(mdPath, url);
      const mdReq = new Request(mdUrl.toString(), {
        method: 'GET',
        headers: { accept: 'text/markdown,*/*;q=0.1' },
      });
      const mdRes = await env.ASSETS.fetch(mdReq);
      if (mdRes.ok) {
        const headers = new Headers(mdRes.headers);
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('Vary', 'Accept');
        headers.set('Link', DISCOVERY_LINKS);
        return new Response(mdRes.body, { status: 200, headers });
      }
    }
  }

  const res = await next();
  const headers = new Headers(res.headers);
  headers.append('Vary', 'Accept');
  if (!headers.has('Link')) headers.set('Link', DISCOVERY_LINKS);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
};
