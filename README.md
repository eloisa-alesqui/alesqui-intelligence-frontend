# Alesqui Intelligence — Frontend

React SPA providing the complete user interface for Alesqui Intelligence: AI chat, API management, import setup wizard, administration panel, and diagnostics.

## Stack

| Component | Technology |
|-----------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| HTTP client | Axios (JWT + refresh interceptors) |
| Streaming | SSE via `@microsoft/fetch-event-source` |
| Icons | Lucide React |

## Prerequisites

- Node.js 20+
- A running instance of the [Alesqui Intelligence backend](https://github.com/alesquiintelligence/alesqui-intelligence-backend) on port 8080

## Installation

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required due to React 19 peer dependency conflicts in some packages.

## Development

```bash
npm run dev
```

Starts the dev server on [http://localhost:5173](http://localhost:5173). API requests to `/api/*` are proxied to `http://localhost:8080`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend base URL. Defaults to the Vite proxy (`http://localhost:8080`) in development. Required at runtime in Docker. |

For local development, create a `.env.local` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Production Build

```bash
npm run build
```

Output is written to `dist/`.

## Docker

### Build

```bash
docker build -t alesqui-intelligence-frontend .
```

### Run

```bash
docker run -d -p 80:80 \
  -e VITE_API_BASE_URL=http://your-backend-url:8080 \
  --name alesqui-frontend \
  alesqui-intelligence-frontend
```

### Health check

```bash
curl http://localhost/health
```

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
