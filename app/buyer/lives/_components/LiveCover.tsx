'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'
import { DEFAULT_LIVE_TINT } from '@/lib/liveCategories'
import { useLiveCategory } from '../_lib/LiveCategoryContext'

export type LiveCoverProps = {
  categoryId: string | null
  thumbnailUrl: string | null
  title: string
  sizes: string
}

/** Fills its (relative) parent with the live thumbnail, or a category-tinted
 * gradient when the live has no thumbnail. */
export function LiveCover({ categoryId, thumbnailUrl, title, sizes }: LiveCoverProps) {
  const category = useLiveCategory(categoryId)
  if (thumbnailUrl) {
    return <Image src={thumbnailUrl} alt={title} fill sizes={sizes} className="object-cover" />
  }
  const tintStyle = { '--lives-tint': category?.tint ?? DEFAULT_LIVE_TINT } as CSSProperties
  return <div className="absolute inset-0 buyer-lives-cover-fallback" style={tintStyle} aria-hidden="true" />
}
