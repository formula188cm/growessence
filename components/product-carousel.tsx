"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface CarouselSlide {
  id: number
  title: string
  description: string
  image: string
  badge?: string
}

const defaultSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "Grow Essence Serum",
    description: "Cold-pressed botanical blend for stronger, thicker hair",
    image: "/1.jpeg",
    badge: "Customer Favorite",
  },
  {
    id: 2,
    title: "Daily Ritual",
    description: "Non-greasy everyday application for all hair types",
    image: "/4.jpeg",
    badge: "Everyday Essential",
  },
  
  {
    id: 3,
    title: "Advanced Repair",
    description: "Lightweight finish with deep nourishment",
    image: "/3.jpeg",
    badge: "Dermatologist Tested",
  },
  {
    id: 4,
    title: "Follicle Revival",
    description: "Targets thinning spots with potent ayurvedic actives",
    image: "/2.jpeg",
    badge: "Top Rated",
  },
  {
    id: 5,
    title: "Radiant Finish",
    description: "Leaves every strand glossier without weighing it down",
    image: "/5.jpeg",
    badge: "Best Seller",
  },
]

export function ProductCarousel({ slides = defaultSlides }: { slides?: CarouselSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const autoPlayInterval = 2500

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, slides.length, autoPlayInterval])

  const nextSlide = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 5000)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 5000)
  }

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setCurrentSlide(index)
    setAutoPlay(false)
    setTimeout(() => setAutoPlay(true), 5000)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX)
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return
    const deltaX = event.changedTouches[0].clientX - touchStartX
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
    }
    setTouchStartX(null)
  }

  return (
    <div
      className="relative w-full h-full group bg-black overflow-hidden rounded-3xl shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-98"
            }`}
          >
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 sm:p-6 lg:p-12 overflow-hidden">
              <img
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                className="max-h-[88%] max-w-[88%] sm:max-h-[90%] sm:max-w-[90%] lg:max-h-[82%] lg:max-w-[82%] object-contain drop-shadow-2xl transition-transform duration-[1500ms] ease-out group-hover:scale-[1.01]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-36 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/25 hover:bg-white/40 backdrop-blur-lg text-white p-2.5 sm:p-3 md:p-4 rounded-full transition-all duration-300 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 text-base sm:text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl border border-white/30"
        aria-label="Previous slide"
      >
        ❮
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/25 hover:bg-white/40 backdrop-blur-lg text-white p-2.5 sm:p-3 md:p-4 rounded-full transition-all duration-300 opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 text-base sm:text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl border border-white/30"
        aria-label="Next slide"
      >
        ❯
      </button>

      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-500 backdrop-blur-md border border-white/40 ${
              index === currentSlide
                ? "w-8 sm:w-9 md:w-10 h-3 sm:h-3.5 md:h-4 bg-white shadow-xl scale-110"
                : "w-2.5 sm:w-3 md:w-3.5 h-2.5 sm:h-3 md:h-3.5 bg-white/40 hover:bg-white/70 hover:scale-110"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute top-4 sm:top-5 md:top-6 left-4 sm:left-5 md:left-6 z-20 text-white text-xs sm:text-sm font-bold tracking-wide">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  )
}
