# Graph Report - .  (2026-05-21)

## Corpus Check
- 37 files · ~69,098 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 143 nodes · 173 edges · 18 communities (13 shown, 5 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Onboarding Slide System|Onboarding Slide System]]
- [[_COMMUNITY_Auth UI & Forms|Auth UI & Forms]]
- [[_COMMUNITY_Agent Rules & Styling|Agent Rules & Styling]]
- [[_COMMUNITY_Layout & Ambient Shell|Layout & Ambient Shell]]
- [[_COMMUNITY_Next.js 16 Breaking Changes|Next.js 16 Breaking Changes]]
- [[_COMMUNITY_Live Commerce & Visual Assets|Live Commerce & Visual Assets]]
- [[_COMMUNITY_Register Form Components|Register Form Components]]
- [[_COMMUNITY_Project Architecture Rules|Project Architecture Rules]]
- [[_COMMUNITY_Server  Client Boundaries|Server / Client Boundaries]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Onboarding Entry Point|Onboarding Entry Point]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Naming Conventions|Naming Conventions]]

## God Nodes (most connected - your core abstractions)
1. `livecomerce-web — Next.js Project` - 7 edges
2. `Next.js 16.2.4 (App Router only)` - 6 edges
3. `Project Folder Structure` - 6 edges
4. `BrandMark()` - 5 edges
5. `Frontend Tech Stack` - 5 edges
6. `Server vs Client Component Decision Rule` - 5 edges
7. `Onboarding Slide 03 Background — Woman with Shopping Bags` - 5 edges
8. `Onboarding Slide 01 Hero — Live Commerce Platform on Laptop` - 5 edges
9. `Onboarding Slide 02 — Professional Male Streamer/Host` - 5 edges
10. `Live Commerce Concept — Streaming + Shopping` - 5 edges

## Surprising Connections (you probably didn't know these)
- `livecomerce-web — Next.js Project` --includes_asset--> `public/file.svg — Generic file icon (document shape)`  [INFERRED]
  README.md → public/file.svg
- `Next.js 16.2.4 (App Router only)` --represented_by--> `public/next.svg — Next.js wordmark logo`  [INFERRED]
  AGENTS.md → public/next.svg
- `livecomerce-web — Next.js Project` --includes_asset--> `public/vercel.svg — Vercel logo (triangle mark)`  [EXTRACTED]
  README.md → public/vercel.svg
- `livecomerce-web — Next.js Project` --includes_asset--> `public/next.svg — Next.js wordmark logo`  [EXTRACTED]
  README.md → public/next.svg
- `Vercel Deployment Platform` --represented_by--> `public/vercel.svg — Vercel logo (triangle mark)`  [INFERRED]
  README.md → public/vercel.svg

## Hyperedges (group relationships)
- **Next.js 16 + Tailwind v4 Breaking Changes** — agents_params_promise, agents_fetch_no_cache, agents_tailwind_css_first [EXTRACTED 1.00]
- **Full Tech Stack with Pinned Versions** — agents_nextjs, agents_react, agents_tailwind, agents_typescript [EXTRACTED 1.00]
- **Live Session Page Component Set** — agents_live_session_structure, agents_live_commerce_patterns, agents_server_client_decision [EXTRACTED 1.00]
- **Three-Layer Styling System** — agents_styling_pattern, agents_tailwind_v4_syntax, agents_semantic_css_naming, agents_globals_css [EXTRACTED 1.00]

## Communities (18 total, 5 thin omitted)

### Community 0 - "Onboarding Slide System"
Cohesion: 0.09
Nodes (24): BrandMark(), OnboardingNavigation(), OnboardingNavigationProps, OnboardingProgress(), OnboardingProgressProps, CHIP_COLORS, CHIP_ICONS, ChipKind (+16 more)

### Community 1 - "Auth UI & Forms"
Cohesion: 0.16
Nodes (6): BrandSidePanel(), Props, LiveStreamMock(), LoginForm(), Tab, metadata

### Community 2 - "Agent Rules & Styling"
Cohesion: 0.14
Nodes (14): Data Fetching Patterns (Server Component, Suspense streaming, Server Functions), app/globals.css — Tailwind import + @theme design tokens, React 19.2.4 (Server Functions, use(), form actions), Convention: Semantic CSS class names (what it is, not what it looks like), Server Functions Pattern (use server, revalidatePath), Frontend Tech Stack, Styling Pattern: 3 Layers (Tailwind / globals.css classes / inline style), Tailwind CSS v4 (CSS-first, no tailwind.config.js) (+6 more)

### Community 3 - "Layout & Ambient Shell"
Cohesion: 0.22
Nodes (3): Ambient(), metadata, TICKER_ITEMS

### Community 4 - "Next.js 16 Breaking Changes"
Cohesion: 0.22
Nodes (11): App Router File Conventions (layout, page, loading, error, route, template), Breaking Change: fetch() not cached by default in Next.js 16, Next.js 16.2.4 (App Router only), Breaking Change: params/searchParams are Promises in Next.js 16, public/file.svg — Generic file icon (document shape), public/next.svg — Next.js wordmark logo, public/vercel.svg — Vercel logo (triangle mark), Development Server (npm/yarn/pnpm/bun run dev) (+3 more)

### Community 5 - "Live Commerce & Visual Assets"
Cohesion: 0.35
Nodes (11): Buyer Persona — Mobile Shopping User, Globe SVG Icon, Live Commerce Concept — Streaming + Shopping, Onboarding Image Assets, Onboarding Flow (3-slide sequence), Public Static Assets Directory, Onboarding Slide 01 Hero — Live Commerce Platform on Laptop, Onboarding Slide 02 — Professional Male Streamer/Host (+3 more)

### Community 6 - "Register Form Components"
Cohesion: 0.22
Nodes (3): RegisterForm(), UserType, metadata

### Community 7 - "Project Architecture Rules"
Cohesion: 0.22
Nodes (9): Colocation Rule: 1 route → _components, 2+ routes → components/, components/ — Shared UI components (Button, Card, Badge), Project Folder Structure, hooks/ — Custom React hooks (useCountdown, useCart), lib/ — actions.ts, data.ts, utils.ts, types.ts, Live Commerce UI Patterns (countdown, WebSocket, SSE, cart context, payment flows), Live Session Page Structure (LiveStream, OfferCountdown, LiveChat, ProductShowcase), Route Group: (marketing) (+1 more)

### Community 8 - "Server / Client Boundaries"
Cohesion: 0.33
Nodes (6): Convention: Context Providers must be Client Components, Performance Rules (Server Components first, next/image, next/link, next/font, Suspense, use cache), Server vs Client Component Decision Rule, Pattern: Compose Server Components inside Client via children prop, Convention: Use server-only import to prevent server code leaking to client, Convention: Push use client as deep as possible

### Community 9 - "Root Layout & Fonts"
Cohesion: 0.4
Nodes (3): bricolage, jakarta, metadata

## Knowledge Gaps
- **48 isolated node(s):** `config`, `eslintConfig`, `nextConfig`, `bricolage`, `jakarta` (+43 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LiveStreamMock()` connect `Auth UI & Forms` to `Onboarding Slide System`, `Layout & Ambient Shell`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Frontend Tech Stack` connect `Agent Rules & Styling` to `Next.js 16 Breaking Changes`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Ambient()` connect `Layout & Ambient Shell` to `Onboarding Slide System`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `config`, `eslintConfig`, `nextConfig` to the rest of the system?**
  _48 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Onboarding Slide System` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Agent Rules & Styling` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._