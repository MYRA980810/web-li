'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { LiveCategory } from '@/lib/liveCategories'

const LiveCategoryContext = createContext<ReadonlyMap<string, LiveCategory>>(new Map())

export type LiveCategoryProviderProps = {
  /** Every backend category (featured or not), already resolved for presentation. */
  categories: readonly LiveCategory[]
  children: ReactNode
}

export function LiveCategoryProvider({ categories, children }: LiveCategoryProviderProps) {
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  return <LiveCategoryContext.Provider value={byId}>{children}</LiveCategoryContext.Provider>
}

/** Resolves a live's category UUID; null when the live has none or it is unknown. */
export function useLiveCategory(categoryId: string | null): LiveCategory | null {
  const byId = useContext(LiveCategoryContext)
  if (!categoryId) return null
  return byId.get(categoryId) ?? null
}
