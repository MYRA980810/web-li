# Graph Report - .  (2026-05-25)

## Corpus Check
- 145 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 145 nodes · 205 edges · 19 communities (12 shown, 7 thin omitted)
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Onboarding Slides|Onboarding Slides]]
- [[_COMMUNITY_Auth Flow & OAuth|Auth Flow & OAuth]]
- [[_COMMUNITY_Project Conventions|Project Conventions]]
- [[_COMMUNITY_OTP Verification|OTP Verification]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Live Commerce Concepts|Live Commerce Concepts]]
- [[_COMMUNITY_Brand Identity|Brand Identity]]
- [[_COMMUNITY_Public Assets & README|Public Assets & README]]
- [[_COMMUNITY_Middleware & Config|Middleware & Config]]
- [[_COMMUNITY_Tailwind v4 Styling|Tailwind v4 Styling]]
- [[_COMMUNITY_Claude Instructions|Claude Instructions]]
- [[_COMMUNITY_Next Env Types|Next Env Types]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Vercel Config|Vercel Config]]
- [[_COMMUNITY_Splash Metadata|Splash Metadata]]
- [[_COMMUNITY_Next.js 16 Params|Next.js 16 Params]]

## God Nodes (most connected - your core abstractions)
1. `OnboardingSlides()` - 25 edges
2. `RegisterForm` - 15 edges
3. `LoginForm` - 11 edges
4. `SplashPage` - 7 edges
5. `PasswordField` - 7 edges
6. `BrandSidePanel` - 7 edges
7. `livecomerce-web — Next.js Project` - 6 edges
8. `BrandMark()` - 5 edges
9. `Live Commerce Concept — Streaming + Shopping` - 5 edges
10. `RootLayout` - 5 edges

## Surprising Connections (you probably didn't know these)
- `livecomerce-web — Next.js Project` --includes_asset--> `public/file.svg — Generic file icon (document shape)`  [INFERRED]
  README.md → public/file.svg
- `PasswordField` --implements--> `Component Colocation Rule`  [INFERRED]
  app/(auth)/_components/PasswordField.tsx → AGENTS.md
- `BrandSidePanel` --implements--> `Component Colocation Rule`  [INFERRED]
  app/(auth)/_components/BrandSidePanel.tsx → AGENTS.md
- `Onboarding Slide 03 Background — Woman with Shopping Bags` --represents_slide--> `Onboarding Flow (3-slide sequence)`  [INFERRED]
  public/onboarding/slide-03-bg.png → app/(onboarding)/onboarding/_components/OnboardingSlides.tsx
- `Onboarding Slide 01 Hero — Live Commerce Platform on Laptop` --represents_slide--> `Onboarding Flow (3-slide sequence)`  [INFERRED]
  public/onboarding/slide-01-hero.png → app/(onboarding)/onboarding/_components/OnboardingSlides.tsx

## Communities (19 total, 7 thin omitted)

### Community 0 - "Onboarding Slides"
Cohesion: 0.13
Nodes (20): ChatBubble, ChatVisual, BrandMark(), CHIP_COLORS, CHIP_ICONS, ChipKind, DESKTOP_CHIPS, OnboardingSlides() (+12 more)

### Community 1 - "Auth Flow & OAuth"
Cohesion: 0.1
Nodes (15): Ambient Component (referenced), metadata, GoogleAccountPicker(), MOCK_ACCOUNTS, ROLE_DESCRIPTIONS, RoleSelector(), UserRole, LiveStreamMock Component (referenced) (+7 more)

### Community 2 - "Project Conventions"
Cohesion: 0.13
Nodes (20): Component Colocation Rule, Server Component First Pattern, Push use client as Deep as Possible, AppleIcon (auth-icons), GoogleIcon, BrandSidePanel, ValueRow, AppleIcon() (+12 more)

### Community 3 - "OTP Verification"
Cohesion: 0.14
Nodes (15): CHANNEL_LABEL, OtpForm(), OtpFormProps, Status, ActionResult, parseProblemDetail(), RegisterResult, registerUser() (+7 more)

### Community 4 - "Root Layout & Fonts"
Cohesion: 0.24
Nodes (9): Ambient, bricolage, jakarta, AuthLayout, Bricolage Grotesque Font, Plus Jakarta Sans Font, Root Metadata, RootLayout (+1 more)

### Community 5 - "Live Commerce Concepts"
Cohesion: 0.36
Nodes (9): Buyer Persona — Mobile Shopping User, Globe SVG Icon, Live Commerce Concept — Streaming + Shopping, Onboarding Flow (3-slide sequence), Onboarding Slide 01 Hero — Live Commerce Platform on Laptop, Onboarding Slide 02 — Professional Male Streamer/Host, Onboarding Slide 03 Background — Woman with Shopping Bags, Streamer/Host Persona — Professional Presenter (+1 more)

### Community 6 - "Brand Identity"
Cohesion: 0.39
Nodes (8): Brand Identity Pattern (BrandMark / BrandWordmark / LiventoLogo duplication), ChatVisual (referenced), BrandMark Component, LiventoLogo Component, ShopVisual (referenced), PhoneChat, PhoneShop, BrandWordmark (local splash)

### Community 7 - "Public Assets & README"
Cohesion: 0.33
Nodes (7): public/file.svg — Generic file icon (document shape), public/next.svg — Next.js wordmark logo, public/vercel.svg — Vercel logo (triangle mark), Development Server (npm/yarn/pnpm/bun run dev), Geist Font (next/font), livecomerce-web — Next.js Project, Vercel Deployment Platform

### Community 8 - "Middleware & Config"
Cohesion: 0.4
Nodes (4): AUTH_ROUTES, config, PostCSS Config, @tailwindcss/postcss Plugin

## Knowledge Gaps
- **53 isolated node(s):** `bricolage`, `jakarta`, `TICKER_ITEMS`, `ChipKind`, `Step` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OnboardingSlides()` connect `Onboarding Slides` to `Auth Flow & OAuth`, `Root Layout & Fonts`, `Brand Identity`?**
  _High betweenness centrality (0.249) - this node is a cross-community bridge._
- **Why does `RegisterForm` connect `Project Conventions` to `Auth Flow & OAuth`, `OTP Verification`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `LoginForm` connect `Project Conventions` to `Auth Flow & OAuth`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `RegisterForm` (e.g. with `Push use client as Deep as Possible` and `LoginForm`) actually correct?**
  _`RegisterForm` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `LoginForm` (e.g. with `RegisterForm` and `Push use client as Deep as Possible`) actually correct?**
  _`LoginForm` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `PasswordField` (e.g. with `Push use client as Deep as Possible` and `Component Colocation Rule`) actually correct?**
  _`PasswordField` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `bricolage`, `jakarta`, `TICKER_ITEMS` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._