import React, { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { tv } from 'tailwind-variants'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface LightboxImage {
  readonly src: string
  readonly alt: string
}

// eslint-disable-next-line functional/no-mixed-types
export interface LightboxProps {
  readonly images: readonly LightboxImage[]
  readonly initialIndex: number
  readonly open: boolean
  readonly onClose: () => void
}

const backdropStyles = tv({
  base: 'fixed inset-0 bg-black/80 transition-opacity data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150',
})

const panelStyles = tv({
  base: 'relative flex max-h-[90vh] max-w-[90vw] items-center justify-center transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150',
})

const imageStyles = tv({
  base: 'max-h-[90vh] max-w-[90vw] rounded object-contain',
})

const iconButtonStyles = tv({
  base: 'cursor-pointer rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white',
  variants: {
    position: {
      close: 'absolute top-2 right-2 sm:top-4 sm:right-4',
      next: 'absolute top-1/2 right-2 -translate-y-1/2 sm:right-4',
      previous: 'absolute top-1/2 left-2 -translate-y-1/2 sm:left-4',
    },
  },
})

export function Lightbox({ images, initialIndex, open, onClose }: Readonly<LightboxProps>) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex)
  }, [open, initialIndex])

  const hasMultiple = images.length > 1

  const goToPrevious = useCallback(() => {
    setCurrentIndex(index => (index - 1 + images.length) % images.length)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(index => (index + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (!open || !hasMultiple) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') goToPrevious()
      else if (event.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, hasMultiple, goToPrevious, goToNext])

  const currentImage = images[currentIndex]
  if (!currentImage) return null

  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <DialogBackdrop transition className={backdropStyles()} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel transition className={panelStyles()}>
          <img src={currentImage.src} alt={currentImage.alt} className={imageStyles()} />
          <button type="button" onClick={onClose} className={iconButtonStyles({ position: 'close' })} aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className={iconButtonStyles({ position: 'previous' })}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className={iconButtonStyles({ position: 'next' })}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
