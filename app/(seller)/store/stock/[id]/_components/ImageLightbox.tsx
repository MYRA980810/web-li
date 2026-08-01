'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

type LightboxImage = { id: string; url: string }

type Props = {
  images: LightboxImage[]
  index: number
  title: string
  eyebrow?: string | null
  onClose: () => void
  onIndexChange: (index: number) => void
}

const SWIPE_MIN_PX = 50

export function ImageLightbox({ images, index, title, eyebrow, onClose, onIndexChange }: Props) {
  const [mounted, setMounted] = useState(false)
  const [shared, setShared] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % images.length)
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [index, images.length, onClose, onIndexChange])

  if (!mounted) return null

  const image = images[index]
  if (!image) return null

  function goPrev() {
    onIndexChange((index - 1 + images.length) % images.length)
  }
  function goNext() {
    onIndexChange((index + 1) % images.length)
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]!.clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0]!.clientX - touchStartX.current
    if (Math.abs(dx) < SWIPE_MIN_PX) return
    if (dx > 0) goPrev()
    else goNext()
  }

  async function handleShare() {
    const shareUrl = image!.url
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
        return
      } catch {
        return
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShared(true)
      setTimeout(() => setShared(false), 1800)
    } catch {
      // clipboard unavailable — nothing else to fall back to
    }
  }

  return createPortal(
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1 min-w-0">
          {eyebrow && <span className="lightbox-eyebrow">{eyebrow}</span>}
          <span className="lightbox-title">{title}</span>
        </div>
        <button className="lightbox-close" onClick={onClose} aria-label="Cerrar visualizador">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="lightbox-body" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-image-card" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <Image src={image.url} alt={title} fill sizes="100vw" className="object-contain" />
        </div>

        {images.length > 1 && (
          <div className="lightbox-strip">
            <div className="lightbox-strip-head">
              <span className="lightbox-counter-pill">
                <span className="lightbox-counter-dot" />
                {index + 1} / {images.length} vistas
              </span>
              <div className="lightbox-progress-track">
                <div
                  className="lightbox-progress-fill"
                  style={{ width: `${((index + 1) / images.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="lightbox-thumbs">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  className={`lightbox-thumb${i === index ? ' active' : ''}`}
                  onClick={() => onIndexChange(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {shared && <span className="lightbox-share-toast">Enlace copiado</span>}
      <button className="lightbox-share" onClick={(e) => { e.stopPropagation(); handleShare() }} aria-label="Compartir imagen">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="14" cy="3.5" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="4" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="14" cy="14.5" r="2.2" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5.9 7.8L12.1 4.7M5.9 10.2l6.2 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>,
    document.body
  )
}
