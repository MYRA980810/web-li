import Image from 'next/image'
import type { CSSProperties } from 'react'
import { getLiveCategory } from '@/lib/liveCategoryMock'

export type LiveCoverProps = {
  liveId: string
  thumbnailUrl: string | null
  title: string
  sizes: string
}

/** Fills its (relative) parent with the live thumbnail, or a category-tinted
 * gradient when the live has no thumbnail. */
export function LiveCover({ liveId, thumbnailUrl, title, sizes }: LiveCoverProps) {
  if (thumbnailUrl) {
    return <Image src={thumbnailUrl} alt={title} fill sizes={sizes} className="object-cover" />
  }
  const tintStyle = { '--lives-tint': getLiveCategory(liveId).tint } as CSSProperties
  return <div className="absolute inset-0 buyer-lives-cover-fallback" style={tintStyle} aria-hidden="true" />
}
