# WhatsApp Chat Viewer

[Português](README.pt-BR.md) · English

View, search and export your WhatsApp conversations in the browser. Everything runs **locally** — no file is ever uploaded to a server.

## Features

- Load `.txt` exports or `.zip` exports (with media); several files of the same chat are merged without duplicates
- Android and iOS exports, `DD/MM` and `MM/DD` dates, 24h and AM/PM clocks
- Phone-style chat view that stays fast with tens of thousands of messages (virtualized list, parsing in a Web Worker)
- WhatsApp formatting (`*bold*`, `_italic_`, `~strike~`, `` `code` ``), links, images, videos, audio and files
- Search that ignores accents and case, with highlight; filters by sender, period, weekday, hour and content type
- Statistics with charts (by hour, weekday and month) and most used words — every bar, participant, month and word is a clickable filter
- Export to PDF (selectable text via print, or image), Markdown, HTML, JSON and CSV (respects the active filters)
- Optionally remember chats in this browser (IndexedDB) and reopen them later
- Installable PWA that works offline after the first visit
- Dark and light themes

## How to export a chat from WhatsApp

Open the chat → ⋮ / contact name → **Export chat** → choose *Without media* (`.txt`) or *Include media* (`.zip`).

## Privacy

Files never leave your browser. "Remember this chat" is off by default; when enabled, the original files are stored in your browser's IndexedDB and can be deleted at any time from the start screen. CSV cells starting with `=`, `+`, `-` or `@` get a leading apostrophe so spreadsheets don't run them as formulas (the JSON export keeps the original text).

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

React 19 · TypeScript · Vite · Tailwind CSS 4 · react-window · JSZip · jsPDF + html2canvas · vite-plugin-pwa · Vitest

## Contributing and support

Personal project, provided as is. **No issues, pull requests, questions or suggestions are accepted** — see [CONTRIBUTING.md](CONTRIBUTING.md). Forking and cloning are welcome, under the license below.

## License

Licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE): free for personal, educational and other noncommercial use. Commercial use requires written permission from the author.

Required Notice: Copyright (c) 2026 Gustavo Santos
