# CLAUDE.md

We're building the app described in @SPEC.MD. Read that file for general architecture tasks or to double-check the
exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long
code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Whenever working with any third-party library or something similar, you MUST look at the official documentation to
ensure that you're working with up-to-date information.
Use the DocsExplorer subagent for efficient documentation lookup.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server (Turbopack, outputs to .next/dev)
npm run build      # Production build (Turbopack by default)
npm run start      # Start production server
npm run lint       # Run ESLint directly (next lint was removed in v16)
```

## Stack

- **Next.js 16.2.6** — App Router, Turbopack by default
- **React 19.2.4** — View Transitions, `useEffectEvent`, Activity
- **TypeScript 5**, **Tailwind CSS v4**, **Zod v4**, **better-auth**
- Import alias: `@/*` maps to the project root

## Next.js 16 Breaking Changes

These differ from training data — read `node_modules/next/dist/docs/` for authoritative detail.

**Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are async-only. Always `await` them:

```tsx
export default async function Page({ params }: PageProps<"/blog/[slug]">) {
    const { slug } = await params;
}
```

Run `npx next typegen` to generate `PageProps`/`LayoutProps`/`RouteContext` type helpers.

**`middleware` → `proxy`** — rename `middleware.ts` to `proxy.ts` and the named export from `middleware` to `proxy`. The edge runtime is not supported in `proxy` (Node.js only).

**Linting** — `next lint` is removed; `next build` no longer lints. Use `eslint` or `biome` directly. ESLint Flat Config (`eslint.config.mjs`) is the default.

**Caching APIs**

- `revalidateTag(tag, cacheLifeProfile)` now requires a second argument
- Use `updateTag` (Server Actions only) for read-your-writes/immediate refresh
- Use `refresh()` from `next/cache` to refresh the client router from a Server Action
- `cacheLife` / `cacheTag` are stable — drop the `unstable_` prefix

**PPR / Cache Components** — `experimental.ppr` is gone; use `cacheComponents: true` in `next.config.ts`. `experimental.turbopack` moved to top-level `turbopack`.

**Parallel routes** — every slot must have an explicit `default.js`; builds fail without one.

**Removed** — AMP support, `serverRuntimeConfig`, `publicRuntimeConfig` (`next/config`). Use `process.env` / `NEXT_PUBLIC_` env vars instead.

**`next/image`** — `images.domains` deprecated (use `remotePatterns`); local images with query strings require `images.localPatterns.search`; `next/legacy/image` deprecated.
