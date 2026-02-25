import React, { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Use a ref for circumference calculation or just static values.
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  useEffect(() => {
    const updateScroll = () => {
      // Current scroll position
      const scrollTop = window.scrollY
      // Total scrollable height
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      // Calculate percentage
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      setProgress(scrollPercent)

      // Show button after scrolling down 100px
      setIsVisible(scrollTop > 100)
    }

    window.addEventListener('scroll', updateScroll)
    window.addEventListener('resize', updateScroll)
    // Initial check
    updateScroll()

    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* SVG Circle Progress */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          width="48"
          height="48"
          viewBox="0 0 48 48"
        >
          {/* Track Circle */}
          <circle
            className="text-gray-200 dark:text-gray-700 transition-colors"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
          />
          {/* Progress Circle */}
          <circle
            className="text-brand-primary transition-all duration-100 ease-linear"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Arrow Icon */}
        <ArrowUp
          className="w-5 h-5 text-brand-primary"
          strokeWidth={2.5}
        />
      </div>
    </button>
  )
}
