# WhatsApp Chat Viewer

[Português](README.pt-BR.md) · English

View, search and export your WhatsApp conversations in the browser. Everything runs **locally** — no file is ever uploaded to a server.

## Features

- Load `.txt` exports or `.zip` exports (with media); several files of the same chat are merged without duplicates
- Android and iOS exports, `DD/MM` and `MM/DD` dates, 24h and AM/PM clocks
- Phone-style chat view that stays fast with tens of thousands of messages (virtualized list, parsing in a Web Worker)
- WhatsApp formatting (`*bold*`, `_italic_`, `~strike~`, `` `code` ``), links, images, videos, audio and files
- Search with highlight, filters by sender, period and content type, and chat statistics
- Export to PDF and Markdown (respects the active filters)
- Dark and light themes

## How to export a chat from WhatsApp

Open the chat → ⋮ / contact name → **Export chat** → choose *Without media* (`.txt`) or *Include media* (`.zip`).

## Development

Requires Node.js 20+.

```bash
npm install
npm run dev      # development server
npm run lint     # ESLint
npm test         # unit tests (Vitest)
npm run build    # type check + production build
npm run preview  # serve the production build
```

The app is deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`, after lint and tests pass. Pull requests run lint, tests and build via `.github/workflows/ci.yml`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · react-window · JSZip · jsPDF + html2canvas · Vitest
