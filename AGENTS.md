<!-- BEGIN:nextjs-agent-rules -->
# Frontend Agent — Next.js 16 + React 19 + Tailwind v4

> **This is NOT the Next.js/Tailwind/React you know from training data.**
> These versions have breaking changes. Read `node_modules/next/dist/docs/` before writing any code.
> When in doubt, verify against local docs — not your training data.

---

## Stack

| Package | Version | Notes |
|---|---|---|
| `next` | 16.2.4 | App Router only. Pages Router is legacy. |
| `react` | 19.2.4 | Server Functions, `use()`, form actions |
| `tailwindcss` | 4.x | CSS-first config. No `tailwind.config.js`. |
| `typescript` | 5.x | Strict mode. No `any`. |

---

## Critical Breaking Changes

### Next.js 16 — `params` and `searchParams` are Promises

**WRONG (old pattern — will throw in Next.js 16):**
```tsx
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params // ❌ params is not an object anymore
}
```

**CORRECT:**
```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params // ✅
}
```

### Next.js 16 — `fetch` is NOT cached by default

```tsx
// Fresh on every request (Next.js 16 default — changed from v13/14)
const data = await fetch('/api/products')

// Opt into caching explicitly
const data = await fetch('/api/products', { cache: 'force-cache' })

// Or use the `use cache` directive on a function
'use cache'
export async function getCachedProducts() {
  return fetch('/api/products').then(r => r.json())
}
```

### Tailwind v4 — CSS-first configuration, no config file

**WRONG (v3 — will NOT work):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**CORRECT (v4):**
```css
@import 'tailwindcss';
```

**WRONG:** Creating `tailwind.config.js` or `tailwind.config.ts`.

**CORRECT:** All configuration goes in CSS via `@theme`.

---

## Tailwind v4 Configuration

Design tokens and customization live in `app/globals.css` via the `@theme` directive:

```css
@import 'tailwindcss';

@theme {
  --color-brand: #ff6b35;
  --color-brand-dark: #cc5520;
  --font-sans: 'Inter', sans-serif;
  --radius-card: 0.75rem;
}

@layer utilities {
  .live-pulse {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
}
```

CSS variables defined in `@theme` become Tailwind utilities automatically:
- `--color-brand` → `bg-brand`, `text-brand`, `border-brand`
- `--radius-card` → `rounded-card`

PostCSS plugin is `@tailwindcss/postcss` (not `tailwindcss`). Check `postcss.config.mjs`.

---

## Server vs Client Components

### Decision Rule

**Default: Server Component.** Add `'use client'` ONLY when you need:

| Need | Use |
|---|---|
| `useState`, `useReducer` | `'use client'` |
| `useEffect`, `useLayoutEffect` | `'use client'` |
| `onClick`, `onChange`, any event handler | `'use client'` |
| `localStorage`, `window`, `navigator` | `'use client'` |
| Third-party library with React hooks | `'use client'` |
| Data fetching from DB/API | Server Component |
| Access to secrets / env vars | Server Component |
| Reduce client JS bundle | Server Component |

### Push `'use client'` as deep as possible

**Bad — entire page becomes client bundle:**
```tsx
'use client'
export default function ProductPage() {
  const [qty, setQty] = useState(1)
  // Product details, images, description — all sent as JS ❌
}
```

**Good — isolate the interactive part:**
```tsx
// page.tsx — Server Component
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  return (
    <div>
      <ProductImage src={product.image} />   {/* Server */}
      <ProductInfo product={product} />       {/* Server */}
      <QuantitySelector productId={product.id} /> {/* Client — minimal */}
    </div>
  )
}
```

### Composing Server inside Client

Pass Server Components as `children` to Client Components:

```tsx
// modal.tsx — Client Component
'use client'
export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return open ? <div>{children}</div> : null
}

// page.tsx — Server Component
import { Modal } from './modal'
import { CartSummary } from './cart-summary' // Server Component
export default function Page() {
  return (
    <Modal>
      <CartSummary /> {/* ✅ Server Component inside Client */}
    </Modal>
  )
}
```

### Context Providers must be Client Components

```tsx
// app/providers.tsx
'use client'
import { createContext } from 'react'
export const CartContext = createContext(null)
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <CartContext.Provider value={...}>{children}</CartContext.Provider>
}

// app/layout.tsx — Server Component wrapping the provider
import { CartProvider } from './providers'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
```

### Prevent server code from leaking to client

```ts
// lib/db.ts
import 'server-only' // build error if imported in a Client Component
export async function getProducts() { ... }
```

---

## Project Architecture

### Folder structure

```
app/
  (marketing)/            # Route group — omitted from URL
    page.tsx
    layout.tsx
  (shop)/                 # Route group
    products/
      [slug]/
        page.tsx
        _components/      # Private folder — colocated, not routable
          ProductGallery.tsx
          ProductInfo.tsx
    cart/
      page.tsx
    live/
      page.tsx
      _components/
        LiveStream.tsx     # 'use client' — needs browser APIs
        OfferTimer.tsx     # 'use client' — countdown with state
  layout.tsx              # Root layout
  globals.css             # Tailwind import + @theme tokens
  not-found.tsx
  error.tsx               # Must be 'use client'

components/               # Shared across 2+ routes
  ui/
    Button.tsx
    Card.tsx
    Badge.tsx

hooks/                    # Custom hooks (always 'use client')
  useCountdown.ts
  useCart.ts

lib/
  actions.ts              # Server Functions ('use server')
  data.ts                 # Data fetching (server-only)
  utils.ts                # Pure utilities (isomorphic)
  types.ts                # Shared TypeScript types
```

### Colocation rule

- A component used by ONE route → `app/route/_components/ComponentName.tsx`
- A component used by TWO or more routes → `components/`
- Never pre-emptively move components to `components/` — wait until shared

### Route groups `(name)` and private folders `_name`

- `(shop)` — groups routes under a shared layout without affecting the URL
- `_components` — private folder, not treated as a route segment, safe to colocate non-page files

---

## App Router File Conventions

| File | Purpose |
|---|---|
| `layout.tsx` | Shared UI. Persists across navigations. Does NOT re-render. |
| `page.tsx` | Route content. Makes the route publicly accessible. |
| `loading.tsx` | Suspense skeleton shown during navigation. |
| `error.tsx` | Error boundary. **Must be `'use client'`.** |
| `not-found.tsx` | 404 handler. |
| `route.ts` | API endpoint. Exports `GET`, `POST`, etc. |
| `template.tsx` | Like layout but re-renders on every navigation. |

**Component render hierarchy inside a route:**
```
layout → template → error → loading → not-found → page
```

---

## Data Fetching

### Server Components — fetch directly in the component

```tsx
export default async function ProductsPage() {
  const products = await db.select().from(productsTable)
  return <ProductGrid products={products} />
}
```

Identical `fetch` calls in a component tree are memoized automatically. No need to prop-drill.

### Streaming with Suspense

```tsx
import { Suspense } from 'react'
import { ProductsSkeleton } from './_components/ProductsSkeleton'

export default function Page() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductList /> {/* async Server Component */}
    </Suspense>
  )
}
```

### Server Functions (mutations)

```ts
// lib/actions.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function addToCart(productId: string) {
  // Always verify auth before mutating
  await db.insert(cartItems).values({ productId })
  revalidatePath('/cart')
}
```

Call from Client Components:
```tsx
'use client'
import { addToCart } from '@/lib/actions'

export function AddToCartButton({ productId }: { productId: string }) {
  return (
    <form action={addToCart.bind(null, productId)}>
      <button type="submit">Add to Cart</button>
    </form>
  )
}
```

---

## TypeScript Rules

- `strict: true` is required — no exceptions
- Never use `any` — use `unknown` and narrow, or define the proper type
- Export props types alongside the component
- Name pattern: `ComponentNameProps`

```tsx
export type ProductCardProps = {
  product: Product
  onAddToCart?: (id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) { ... }
```

---

## Performance Rules

1. **Server Components first** — every component is Server by default until proven otherwise
2. **`next/image` for all images** — never raw `<img>` tags
3. **`next/link` for all internal navigation** — never `<a href>`
4. **`next/font` for fonts** — never CDN `<link>` in `<head>`
5. **Lazy-load heavy Client Components:**
   ```tsx
   const LiveStreamPlayer = dynamic(() => import('./LiveStreamPlayer'), { ssr: false })
   ```
6. **Wrap async data in `<Suspense>`** — never block the full page render
7. **`use cache` for stable data** — products catalog, categories, etc.

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Route files | lowercase, framework names | `page.tsx`, `layout.tsx` |
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | `use` prefix, camelCase | `useCountdown.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Server actions | camelCase | `actions.ts`, `cartActions.ts` |
| Types/interfaces | PascalCase | `Product`, `CartItem` |
| CSS variables / tokens | `--kebab-case` | `--color-brand` |

---

## Styling Pattern (mandatory)

> **This rule applies to every new UI section, component, and screen.** No exceptions.

Three layers, strictly separated:

| Layer | What goes here | Example |
|---|---|---|
| **Tailwind** | Layout, spacing, typography, flexbox, grid, system colors | `flex items-center gap-3 text-brand-400` |
| **`globals.css` classes** | Complex visual effects: multi-stop gradients, `filter`, `backdrop-filter`, `box-shadow`, animations, keyframes | `.shop-bg`, `.chat-figure`, `.reveal`, `.screen-enter` |
| **Inline `style`** | Dynamic runtime values ONLY — values that change at runtime based on props/state | `style={{ width: progress + '%' }}` |

### Rules

**Never** write inline styles for static layout — use Tailwind:
```tsx
// ✗
<div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }} />

// ✓
<div className="flex items-center mt-6" />
```

**Never** use Tailwind arbitrary values for complex gradients — define a semantic CSS class in `globals.css` instead:
```tsx
// ✗ unreadable, unmaintainable
<div className="bg-[radial-gradient(ellipse_at_60%_35%,#c47090_0%,transparent_45%)]" />

// ✓ semantic, maintainable
<div className="shop-bg" />
```

**Box shadows that are unique to one element** can use Tailwind arbitrary values — no need to create a globals.css class:
```tsx
// ✓ acceptable for one-off shadows
<div className="shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(255,31,135,0.3)]" />
```

**CSS variables from the design system** use Tailwind v4 canonical syntax — not `[var(...)]`:
```tsx
// ✗ v3 style
<p className="text-[var(--ink-2)]" />

// ✓ v4 canonical
<p className="text-(--ink-2)" />
```

**Borders and backgrounds using CSS vars not in `@theme`** are the only valid static inline styles:
```tsx
// ✓ acceptable — var(--line-strong) is not in @theme
<div style={{ border: '1px solid var(--line-strong)' }} />
```

**When adding a new CSS class to `globals.css`**, name it semantically (what it *is*, not what it looks like):
```css
/* ✗ */
.pink-radial-gradient { ... }

/* ✓ */
.slide-discover-product { ... }
```

---

## Live Commerce Specific Patterns

This is a live commerce app. Key UI patterns to anticipate:

- **Live offers** require countdown timers → `'use client'`, `useEffect` for interval
- **Real-time stock updates** → WebSocket or SSE → `'use client'`
- **Product stream feed** → Server Component with polling or streaming
- **Cart state** → Client-side context (`'use client'` provider in `app/layout.tsx`)
- **Payment flows** → Server Functions for security, never expose keys to client

For the live session page, structure it as:
```
app/(shop)/live/
  page.tsx              — Server Component, fetches current live session data
  _components/
    LiveStream.tsx       — 'use client' (video/WebRTC)
    OfferCountdown.tsx   — 'use client' (timer state)
    LiveChat.tsx         — 'use client' (real-time)
    ProductShowcase.tsx  — Server Component (product data)
```
---

## Codebase Navigation (mandatory)

The project has a graphify knowledge graph at `graphify-out/`. **Always use graphify to search or explore the codebase** instead of reading files directly.

| Task | Command |
|---|---|
| Find where something is defined or how it connects | `graphify query "question"` |
| Understand a specific component or symbol | `graphify explain "NodeName"` |
| Trace a relationship between two concepts | `graphify path "NodeA" "NodeB"` |

Only fall back to `Read` or `grep` when the file was created after the last graphify run (not yet indexed).

<!-- END:nextjs-agent-rules -->
