---
name: take-screenshot
description: Capture a screenshot of any public web page using the WebIntel API. Supports viewport sizing, full-page capture, dark-mode emulation, render delay, and PNG/JPEG/WebP output as either base64 JSON or a streamed image.
version: 1.0.0
license: MIT
---

# take-screenshot

Render and capture a public web page using the WebIntel `/v1/screenshot` endpoint.

## When to use

- Thumbnail generation for dashboards, monitoring, or social previews.
- Providing a visual grounding for agents reasoning about a URL.
- Automated regression/visual-diff workflows.

## Authentication

Obtain an API key from <https://webintel.dev/#signup> and pass it as the `x-api-key` header.

## Request

```
GET https://api.webintel.dev/v1/screenshot?url={encoded_url}&width=1280&format=png&fullPage=false&darkMode=false&delay=0
Headers: x-api-key: <your key>
Accept: application/json   # base64 body
# or
Accept: image/png          # streamed image
```

### Parameters

| Name     | Type    | Default | Notes                              |
|----------|---------|---------|------------------------------------|
| url      | string  | —       | Required, public URL               |
| width    | integer | 1280    | Viewport width (320–3840)          |
| height   | integer | 800     | Viewport height (240–2160)         |
| format   | enum    | png     | `png` / `jpeg` / `webp`            |
| fullPage | bool    | false   | Capture entire scroll height       |
| darkMode | bool    | false   | Emulate `prefers-color-scheme:dark`|
| delay    | integer | 0       | Post-load render delay (ms, ≤10000)|

## Response shape (application/json)

```json
{
  "image": "data:image/png;base64,...",
  "width": 1280,
  "height": 800,
  "format": "png",
  "fullPage": false
}
```

## Example

```bash
curl "https://api.webintel.dev/v1/screenshot?url=https%3A%2F%2Fexample.com&width=1280&format=webp" \
  -H "x-api-key: $WEBINTEL_KEY" \
  -H "Accept: image/webp" --output example.webp
```

## Related

- Link preview skill: `../link-preview/SKILL.md`
- OpenAPI spec: <https://webintel.dev/openapi.yaml>
- MCP server card: <https://webintel.dev/.well-known/mcp/server-card.json>
