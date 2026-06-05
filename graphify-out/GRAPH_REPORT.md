# Graph Report - .  (2026-05-29)

## Corpus Check
- 20 files · ~0 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 175 nodes · 273 edges · 22 communities (15 shown, 7 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Shell & Auth Routes|App Shell & Auth Routes]]
- [[_COMMUNITY_Onboarding Slides|Onboarding Slides]]
- [[_COMMUNITY_Auth Form Components|Auth Form Components]]
- [[_COMMUNITY_Server Actions & API|Server Actions & API]]
- [[_COMMUNITY_OTP  Login Forms|OTP / Login Forms]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Home Screen|Home Screen]]
- [[_COMMUNITY_Brand Concepts & Personas|Brand Concepts & Personas]]
- [[_COMMUNITY_Brand Identity & Logo|Brand Identity & Logo]]
- [[_COMMUNITY_Public Assets & README|Public Assets & README]]
- [[_COMMUNITY_Middleware & Config|Middleware & Config]]
- [[_COMMUNITY_Styling Guidelines|Styling Guidelines]]
- [[_COMMUNITY_CLAUDE.md Ref|CLAUDE.md Ref]]
- [[_COMMUNITY_Next Env|Next Env]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next Config Alt|Next Config Alt]]
- [[_COMMUNITY_Splash Metadata|Splash Metadata]]
- [[_COMMUNITY_Next.js 16 Params|Next.js 16 Params]]

## God Nodes (most connected - your core abstractions)
1. `OnboardingSlides()` - 25 edges
2. `LoginForm` - 17 edges
3. `RegisterForm` - 15 edges
4. `parseProblemDetail()` - 9 edges
5. `PasswordField` - 8 edges
6. `OtpFormBase()` - 8 edges
7. `SplashPage` - 7 edges
8. `BrandSidePanel` - 7 edges
9. `resetPassword()` - 7 edges
10. `BrandMark()` - 6 edges

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

## Communities (22 total, 7 thin omitted)

### Community 0 - "App Shell & Auth Routes"
Cohesion: 0.09
Nodes (15): Ambient Component (referenced), metadata, GoogleAccountPicker(), MOCK_ACCOUNTS, ROLE_DESCRIPTIONS, RoleSelector(), UserRole, LiveStreamMock Component (referenced) (+7 more)

### Community 1 - "Onboarding Slides"
Cohesion: 0.13
Nodes (20): ChatBubble, ChatVisual, BrandMark(), CHIP_COLORS, CHIP_ICONS, ChipKind, DESKTOP_CHIPS, OnboardingSlides() (+12 more)

### Community 2 - "Auth Form Components"
Cohesion: 0.13
Nodes (20): Component Colocation Rule, Server Component First Pattern, Push use client as Deep as Possible, AppleIcon (auth-icons), GoogleIcon, BrandSidePanel, ValueRow, AppleIcon() (+12 more)

### Community 3 - "Server Actions & API"
Cohesion: 0.16
Nodes (21): ActionResult, completeGoogleAuth(), forgotPassword(), ForgotPasswordResult, loginUser(), parseProblemDetail(), RegisterResult, registerUser() (+13 more)

### Community 4 - "OTP / Login Forms"
Cohesion: 0.21
Nodes (10): Props, CHANNEL_LABEL, OtpForm(), OtpFormProps, Status, OtpFormBase(), OtpFormBaseProps, resendOtp() (+2 more)

### Community 5 - "Root Layout & Fonts"
Cohesion: 0.24
Nodes (9): Ambient, bricolage, jakarta, AuthLayout, Bricolage Grotesque Font, Plus Jakarta Sans Font, Root Metadata, RootLayout (+1 more)

### Community 6 - "Home Screen"
Cohesion: 0.2
Nodes (4): CATEGORIES, HomeScreen(), NAV_ITEMS, PRODUCTS

### Community 7 - "Brand Concepts & Personas"
Cohesion: 0.36
Nodes (9): Buyer Persona — Mobile Shopping User, Globe SVG Icon, Live Commerce Concept — Streaming + Shopping, Onboarding Flow (3-slide sequence), Onboarding Slide 01 Hero — Live Commerce Platform on Laptop, Onboarding Slide 02 — Professional Male Streamer/Host, Onboarding Slide 03 Background — Woman with Shopping Bags, Streamer/Host Persona — Professional Presenter (+1 more)

### Community 8 - "Brand Identity & Logo"
Cohesion: 0.39
Nodes (8): Brand Identity Pattern (BrandMark / BrandWordmark / LiventoLogo duplication), ChatVisual (referenced), BrandMark Component, LiventoLogo Component, ShopVisual (referenced), PhoneChat, PhoneShop, BrandWordmark (local splash)

### Community 9 - "Public Assets & README"
Cohesion: 0.33
Nodes (7): public/file.svg — Generic file icon (document shape), public/next.svg — Next.js wordmark logo, public/vercel.svg — Vercel logo (triangle mark), Development Server (npm/yarn/pnpm/bun run dev), Geist Font (next/font), livecomerce-web — Next.js Project, Vercel Deployment Platform

### Community 10 - "Middleware & Config"
Cohesion: 0.4
Nodes (4): AUTH_ROUTES, config, PostCSS Config, @tailwindcss/postcss Plugin

## Knowledge Gaps
- **57 isolated node(s):** `bricolage`, `jakarta`, `TICKER_ITEMS`, `ChipKind`, `Step` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OnboardingSlides()` connect `Onboarding Slides` to `App Shell & Auth Routes`, `Brand Identity & Logo`, `Root Layout & Fonts`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `LoginForm` connect `Auth Form Components` to `App Shell & Auth Routes`, `Server Actions & API`, `OTP / Login Forms`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `RegisterForm` connect `Auth Form Components` to `App Shell & Auth Routes`, `Server Actions & API`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `LoginForm` (e.g. with `RegisterForm` and `Push use client as Deep as Possible`) actually correct?**
  _`LoginForm` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `RegisterForm` (e.g. with `Push use client as Deep as Possible` and `LoginForm`) actually correct?**
  _`RegisterForm` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `PasswordField` (e.g. with `Push use client as Deep as Possible` and `Component Colocation Rule`) actually correct?**
  _`PasswordField` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `bricolage`, `jakarta`, `TICKER_ITEMS` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._