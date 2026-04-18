---
name: link-preview
description: Extract Open Graph, Twitter Card, and meta tag data from any public URL using the WebIntel API. Returns title, description, image, favicon, site name, canonical URL, author, theme colour, language, and publication timestamp.
version: 1.0.0
license: MIT
---

# link-preview

Extract rich link-preview metadata for any public URL using the WebIntel `/v1/preview` endpoint.

## When to use

- Rendering link unfurls / previews in chat, email, or social apps.
- Populating metadata fields for agents before quoting a URL.
- Hydrating bookmarks, reading lists, or knowledge graphs.

## Authentication

Obtain an API key from <https://webintel.dev/#signup> and pass it as the `x-api-key` header. The free tier covers 100 requests/day.

## Request

```
GET https://api.webintel.dev/v1/preview?url={encoded_url}
Headers: x-api-key: <your key>
```

## Response shape

```json
{
  "title": "string",
  "description": "string",
  "image": "https://...",
  "favicon": "https://...",
  "siteName": "string",
  "type": "website|article|...",
  "language": "en",
  "themeColor": "#rrggbb",
  "canonical": "https://...",
  "author": "string",
  "published": "ISO-8601",
  "twitter": { "card": "summary_large_image" }
}
```

## Example

```bash
curl "https://api.webintel.dev/v1/preview?url=https%3A%2F%2Fgithub.com" \
  -H "x-api-key: $WEBINTEL_KEY"
```

## Rate limits

Free tier: 100 req/day. Pro: 5,000 req/day. Rate-limit headers are returned on every response.

## Related

- Screenshot skill: `../take-screenshot/SKILL.md`
- OpenAPI spec: <https://webintel.dev/openapi.yaml>
- MCP server card: <https://webintel.dev/.well-known/mcp/server-card.json>
