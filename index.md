# WebIntel API

**Link previews and screenshots via one API — built for developers and LLMs.**

Extract Open Graph metadata and capture screenshots from any public URL. REST API plus an MCP server for Claude and AI agents. Free tier available.

- Home: <https://webintel.dev/>
- Sign up / dashboard: <https://api.webintel.dev/dashboard.html>
- OpenAPI spec: <https://webintel.dev/openapi.yaml>
- MCP server card: <https://webintel.dev/.well-known/mcp/server-card.json>
- Agent Skills index: <https://webintel.dev/.well-known/agent-skills/index.json>
- API catalog: <https://webintel.dev/.well-known/api-catalog>
- GitHub: <https://github.com/Mathew-Harvey/webintel-api>

---

## Endpoints

Two endpoints. One key. Zero hassle. Both return clean JSON; screenshots can also stream the image.

### `GET /v1/preview?url={url}`

Extract Open Graph, Twitter Card, and meta tag data from any URL.

Returns: `title`, `description`, `image`, `favicon`, `siteName`, `type`, `language`, `themeColor`, `canonical`, `author`, `twitter.card`, `published`.

### `GET /v1/screenshot?url={url}`

Capture a screenshot of any web page. Configure viewport size, format, full-page capture, dark-mode emulation, and render delay.

Parameters: `url`, `width`, `height`, `format` (`png` / `jpeg` / `webp`), `fullPage`, `darkMode`, `delay`. Response can be `base64 json` or a streamed image.

---

## Quick start

```bash
# Link preview
curl "https://api.webintel.dev/v1/preview?url=https%3A%2F%2Fgithub.com" \
  -H "x-api-key: $WEBINTEL_KEY"

# Screenshot (streamed)
curl "https://api.webintel.dev/v1/screenshot?url=https%3A%2F%2Fexample.com&width=1280&format=webp" \
  -H "x-api-key: $WEBINTEL_KEY" \
  -H "Accept: image/webp" --output example.webp
```

```js
const res = await fetch(
  'https://api.webintel.dev/v1/preview?url=https://github.com',
  { headers: { 'x-api-key': process.env.WEBINTEL_KEY } }
);
const data = await res.json();
```

---

## Built for Claude and AI agents

WebIntel ships as both a REST API and an MCP server. Connect it to Claude Desktop and Claude can call `link_preview` and `take_screenshot` as native tools. Same API key, same rate limits, same billing.

- MCP endpoint: `https://api.webintel.dev/mcp`
- Auth: `x-api-key` header

---

## How it works

1. **Get your API key** — sign up in 30 seconds. Free tier = 100 requests/day across both endpoints. No credit card required.
2. **Make a request** — call the REST API directly, or connect the MCP server to Claude. Works with any language, any framework, any LLM.
3. **Ship your product** — link previews in your chat app, screenshots in your monitoring tool, metadata in your AI agent.

---

## Pricing

| Plan       | Price        | Requests / day | Highlights                                                  |
|------------|--------------|----------------|-------------------------------------------------------------|
| Free       | $0 / month   | 100            | Both endpoints, rate-limit headers, community support.      |
| Pro        | $9 / month   | 5,000          | Priority latency, MCP server access, usage dashboard.       |
| Enterprise | Custom       | Unlimited      | Dedicated infra, custom SLA, priority support.              |

Get started: <https://webintel.dev/#signup>

---

## Contact

- Email: <mailto:hello@webintel.dev>
- Docs: <https://webintel.dev/#docs>
- Source (API): <https://github.com/Mathew-Harvey/webintel-api>
