# Graph Report - .  (2026-06-12)

## Corpus Check
- 98 files · ~86,477 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 340 nodes · 628 edges · 27 communities (17 shown, 10 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.84)
- Token cost: 66,496 input · 68,424 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth Flow & Components|Auth Flow & Components]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Project Standards (AGENTS.md)|Project Standards (AGENTS.md)]]
- [[_COMMUNITY_Onboarding Screens|Onboarding Screens]]
- [[_COMMUNITY_Add Product Flow|Add Product Flow]]
- [[_COMMUNITY_Product Edit & Delete Flow|Product Edit & Delete Flow]]
- [[_COMMUNITY_Edit Store Form|Edit Store Form]]
- [[_COMMUNITY_Buyer Home Screen|Buyer Home Screen]]
- [[_COMMUNITY_Layout & Fonts|Layout & Fonts]]
- [[_COMMUNITY_OTP Verification|OTP Verification]]
- [[_COMMUNITY_Architecture Patterns|Architecture Patterns]]
- [[_COMMUNITY_Live Commerce Concepts|Live Commerce Concepts]]
- [[_COMMUNITY_Middleware & Route Guards|Middleware & Route Guards]]
- [[_COMMUNITY_Public Assets & README|Public Assets & README]]
- [[_COMMUNITY_Claude Config|Claude Config]]
- [[_COMMUNITY_Next Env|Next Env]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next Config Alt|Next Config Alt]]
- [[_COMMUNITY_Splash Metadata|Splash Metadata]]
- [[_COMMUNITY_Next.js 16 Patterns|Next.js 16 Patterns]]
- [[_COMMUNITY_Lib Utils|Lib Utils]]
- [[_COMMUNITY_Lib Types Docs|Lib Types Docs]]
- [[_COMMUNITY_Shared Types|Shared Types]]
- [[_COMMUNITY_Seller Tab Type|Seller Tab Type]]

## God Nodes (most connected - your core abstractions)
1. `schemas` - 27 edges
2. `OnboardingSlides()` - 25 edges
3. `SellerBottomNav` - 22 edges
4. `productActions` - 21 edges
5. `parseProblemDetail()` - 18 edges
6. `EditStoreForm` - 18 edges
7. `LoginForm` - 17 edges
8. `storeActions` - 17 edges
9. `Props` - 16 edges
10. `SellerHomeScreen` - 16 edges

## Surprising Connections (you probably didn't know these)
- `livecomerce-web — Next.js Project` --includes_asset--> `public/file.svg — Generic file icon (document shape)`  [INFERRED]
  README.md → public/file.svg
- `RegisterForm` --implements--> `Push use client as deep as possible`  [INFERRED]
  app/(auth)/register/_components/RegisterForm.tsx → AGENTS.md
- `PasswordField` --implements--> `Push use client as deep as possible`  [INFERRED]
  app/(auth)/_components/PasswordField.tsx → AGENTS.md
- `PasswordField` --implements--> `Component Colocation Rule`  [INFERRED]
  app/(auth)/_components/PasswordField.tsx → AGENTS.md
- `BrandSidePanel` --implements--> `Component Colocation Rule`  [INFERRED]
  app/(auth)/_components/BrandSidePanel.tsx → AGENTS.md

## Communities (27 total, 10 thin omitted)

### Community 0 - "Auth Flow & Components"
Cohesion: 0.07
Nodes (42): AppleIcon (auth-icons), GoogleIcon, AppleIcon(), OAUTH_ERRORS, Tab, PasswordFieldProps, UserType, ROLE_DESCRIPTIONS (+34 more)

### Community 1 - "App Shell & Navigation"
Cohesion: 0.08
Nodes (28): metadata, RootPage(), BrandSidePanel, ValueRow, Category, GoogleAccountPicker(), MOCK_ACCOUNTS, DeleteProductPage (+20 more)

### Community 2 - "Project Standards (AGENTS.md)"
Cohesion: 0.07
Nodes (38): App Router, App Router File Conventions, Client Component, components/ui/, Context Provider Pattern, fetch not cached by default (Next.js 16 breaking change), Frontend Agent — Next.js 16 + React 19 + Tailwind v4, app/globals.css (+30 more)

### Community 3 - "Onboarding Screens"
Cohesion: 0.1
Nodes (28): Brand Identity Pattern (BrandMark / BrandWordmark / LiventoLogo duplication), ChatVisual (referenced), ChatBubble, ChatVisual, BrandMark(), CHIP_COLORS, CHIP_ICONS, ChipKind (+20 more)

### Community 4 - "Add Product Flow"
Cohesion: 0.12
Nodes (27): AddProductForm, Ambient Component (referenced), CURRENCIES, Props, ROUTED_TABS, SellerTab, FEATURES, DeleteProductSuccessPage (+19 more)

### Community 5 - "Product Edit & Delete Flow"
Cohesion: 0.14
Nodes (27): NotFound(), ConfirmContent, DeleteProductConfirm, EditForm, EditProductForm, parseProblemDetail(), CreateProductResult, DeactivateProductResult (+19 more)

### Community 6 - "Edit Store Form"
Cohesion: 0.12
Nodes (19): getMyStore(), EditStoreForm, CreateStoreInput, CreateStoreResult, UploadLogoResult, createStoreSchema, updateStoreSchema, createStore (+11 more)

### Community 7 - "Buyer Home Screen"
Cohesion: 0.11
Nodes (17): ACTIVE_STREAMS, BottomNav(), CATEGORIES, HomeScreen(), NAV_ITEMS, PRODUCTS, NEWS_PROMOS, RANKING (+9 more)

### Community 8 - "Layout & Fonts"
Cohesion: 0.16
Nodes (15): Ambient, bricolage, jakarta, AuthLayout, getScrollMap(), saveScroll(), TRANSIENT, Bricolage Grotesque Font (+7 more)

### Community 9 - "OTP Verification"
Cohesion: 0.24
Nodes (9): CHANNEL_LABEL, OtpForm(), OtpFormProps, Status, OtpFormBase(), OtpFormBaseProps, resendOtp(), VerificationChannel (+1 more)

### Community 10 - "Architecture Patterns"
Cohesion: 0.2
Nodes (10): AGENTS.md — Frontend Agent Rules, Server Component First Pattern, Bottom nav must use React Portal — screen-enter creates stacking context, Colocation rule — one route: colocate; two+ routes: components/, Next.js 16 — fetch is NOT cached by default, Next.js 16 — params and searchParams are Promises (breaking change), Push use client as deep as possible, Server Component by default — add use client only when needed (+2 more)

### Community 11 - "Live Commerce Concepts"
Cohesion: 0.36
Nodes (9): Buyer Persona — Mobile Shopping User, Globe SVG Icon, Live Commerce Concept — Streaming + Shopping, Onboarding Flow (3-slide sequence), Onboarding Slide 01 Hero — Live Commerce Platform on Laptop, Onboarding Slide 02 — Professional Male Streamer/Host, Onboarding Slide 03 Background — Woman with Shopping Bags, Streamer/Host Persona — Professional Presenter (+1 more)

### Community 12 - "Middleware & Route Guards"
Cohesion: 0.25
Nodes (7): AUTH_ROUTES, config, SELLER_PREFIXES, getJwtRole, PostCSS Config, Seller Role Guard Pattern, @tailwindcss/postcss Plugin

### Community 13 - "Public Assets & README"
Cohesion: 0.33
Nodes (7): public/file.svg — Generic file icon (document shape), public/next.svg — Next.js wordmark logo, public/vercel.svg — Vercel logo (triangle mark), Development Server (npm/yarn/pnpm/bun run dev), Geist Font (next/font), livecomerce-web — Next.js Project, Vercel Deployment Platform

## Knowledge Gaps
- **113 isolated node(s):** `bricolage`, `jakarta`, `TICKER_ITEMS`, `ChipKind`, `Step` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Component Colocation Rule` connect `Project Standards (AGENTS.md)` to `Auth Flow & Components`, `App Shell & Navigation`?**
  _High betweenness centrality (0.209) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `schemas` (e.g. with `createProductSchema` and `updateProductSchema`) actually correct?**
  _`schemas` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `bricolage`, `jakarta`, `TICKER_ITEMS` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Flow & Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Project Standards (AGENTS.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Onboarding Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._