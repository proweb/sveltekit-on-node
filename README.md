# Project Description

SvelteKit application — a Gist Manager plus a few example pages (forms, typer, about), published to
[Spacefast](https://spacefast.com) as a prerendered static site.

## How it is hosted

Spacefast cannot run `@sveltejs/adapter-node`: its only server runtime is a Workers-style isolate.
So the app is built with `@sveltejs/adapter-static` and every route is prerendered
(`src/routes/+layout.ts`). There is no server code — the build output in `build/` is plain HTML and
hashed assets that any static host can serve.

The Gist Manager therefore runs entirely in the browser:

- The GitHub token lives in `localStorage` (`src/lib/session.ts`) and is sent to `api.github.com` in
  an `Authorization` header on each request (`src/lib/github.ts`).
- No proxy is involved. The GitHub REST API answers with `Access-Control-Allow-Origin: *` and its
  preflight allows the `Authorization` header, so a static page may call it directly.

Trade-off: any script running on this origin can read the token. That is accepted for a personal
tool; do not put a token with broad scopes on a shared or untrusted deployment. The token needs the
`gist` scope only.

## Running in Production

```bash
npm run build     # prerenders every route into build/
npm start         # vite preview --port 9000 (local preview of build/)
```

## Deploying to Spacefast

```bash
sf login
npm run build
sf publish ./build
```

`sf publish ./build` uploads the prerendered directory through the static path. Running `sf publish`
with no argument also works — Spacefast then builds the project itself.

## Development

```bash
npm run dev     # dev server
npm run check   # svelte-check
npm run lint    # prettier --check + eslint
npm run format  # prettier --write
npm test        # vitest
```

### Tailwind

Tailwind v4 is wired through the `@tailwindcss/vite` plugin. There is no `postcss.config.js`; using
the PostCSS plugin instead (`@tailwindcss/postcss`) makes `adapter-static` builds fail on
`@import 'tailwindcss'`, because Vite's own `postcss-import` resolves the import before Tailwind
runs. Keep the Vite plugin.
