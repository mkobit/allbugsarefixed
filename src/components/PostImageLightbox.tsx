import React, { useEffect, useState } from 'react'
import { Lightbox, type LightboxImage } from './Lightbox'

export interface PostImageLightboxProps {
  readonly containerSelector?: string
}

const DEFAULT_CONTAINER_SELECTOR = '.prose'
const IMAGE_SELECTOR = 'img[data-image-component="true"]'
const GALLERY_SELECTOR = '[data-gallery]'
const TRIGGER_ATTR = 'data-lightbox-trigger'

export function PostImageLightbox({ containerSelector = DEFAULT_CONTAINER_SELECTOR }: Readonly<PostImageLightboxProps>) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<readonly LightboxImage[]>([])
  const [initialIndex, setInitialIndex] = useState(0)

  useEffect(() => {
    const container = document.querySelector(containerSelector)
    if (!container) return

    const candidates = Array.from(container.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR)).filter(
      img => !img.closest(GALLERY_SELECTOR) && !img.closest(`[${TRIGGER_ATTR}]`),
    )

    const cleanups = candidates.map((img) => {
      const button = document.createElement('button')
      button.setAttribute('type', 'button')
      button.setAttribute(TRIGGER_ATTR, 'true')
      button.setAttribute('aria-label', img.alt ? `Open image: ${img.alt}` : 'Open image')
      button.setAttribute('class', 'block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left')

      img.replaceWith(button)
      button.appendChild(img)

      function handleActivate() {
        setImages([{ alt: img.alt, src: img.src }])
        setInitialIndex(0)
        setOpen(true)
      }

      button.addEventListener('click', handleActivate)
      return () => {
        button.removeEventListener('click', handleActivate)
      }
    })

    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [containerSelector])

  return <Lightbox images={images} initialIndex={initialIndex} open={open} onClose={() => setOpen(false)} />
}
