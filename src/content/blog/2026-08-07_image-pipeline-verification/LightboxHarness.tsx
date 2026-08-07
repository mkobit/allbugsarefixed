import React, { useState } from 'react'
import { Lightbox, type LightboxImage } from '../../../components/Lightbox'
import gradient from './gradient.png'
import solidRed from './solid-red.png'
import solidBlue from './solid-blue.png'

const testImages: readonly LightboxImage[] = [
  { alt: 'Gradient test image', src: gradient.src },
  { alt: 'Red test image', src: solidRed.src },
  { alt: 'Blue test image', src: solidBlue.src },
]

export function LightboxHarness() {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [activeImages, setActiveImages] = useState<readonly LightboxImage[]>(testImages)

  function openGallery(i: number) {
    setActiveImages(testImages)
    setIndex(i)
    setOpen(true)
  }

  function openSingle() {
    setActiveImages([testImages[0]])
    setIndex(0)
    setOpen(true)
  }

  return (
    <div className="my-6 flex flex-wrap gap-2" data-testid="lightbox-harness">
      <button type="button" onClick={() => openGallery(0)} className="cursor-pointer rounded border px-3 py-2 text-sm" data-testid="open-gallery-0">
        Open gallery at image 1
      </button>
      <button type="button" onClick={() => openGallery(2)} className="cursor-pointer rounded border px-3 py-2 text-sm" data-testid="open-gallery-2">
        Open gallery at image 3
      </button>
      <button type="button" onClick={openSingle} className="cursor-pointer rounded border px-3 py-2 text-sm" data-testid="open-single">
        Open single-image set
      </button>
      <Lightbox images={activeImages} initialIndex={index} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
