import React, { useEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'
import { Lightbox, type LightboxImage } from './Lightbox'

export interface GalleryProps {
  readonly children: React.ReactNode
}

const gridStyles = tv({
  base: 'my-6 grid grid-cols-2 gap-4 sm:grid-cols-3 [&_img]:m-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover',
})

const triggerStyles = tv({
  base: 'block h-full w-full cursor-zoom-in overflow-hidden rounded-xl border-0 bg-transparent p-0 text-left',
})

const IMAGE_SELECTOR = 'img[data-image-component="true"]'
const TRIGGER_ATTR = 'data-lightbox-trigger'

export function Gallery({ children }: Readonly<GalleryProps>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<readonly LightboxImage[]>([])
  const [initialIndex, setInitialIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const imgs = Array.from(container.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR))
    setImages(imgs.map(img => ({ alt: img.alt, src: img.src })))

    const cleanups = imgs
      .map((img, index) => ({ img, index }))
      .filter(({ img }) => !img.closest(`[${TRIGGER_ATTR}]`))
      .map(({ img, index }) => {
        const button = document.createElement('button')
        button.setAttribute('type', 'button')
        button.setAttribute(TRIGGER_ATTR, 'true')
        button.setAttribute('aria-label', img.alt ? `Open image: ${img.alt}` : 'Open image')
        button.setAttribute('class', triggerStyles())

        img.replaceWith(button)
        button.appendChild(img)

        function handleActivate() {
          setInitialIndex(index)
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
  }, [])

  return (
    <>
      <div ref={containerRef} data-gallery className={gridStyles()}>
        {children}
      </div>
      <Lightbox images={images} initialIndex={initialIndex} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
