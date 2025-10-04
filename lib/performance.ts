// Performance optimization utilities

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  const fontPreloads = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ]

  fontPreloads.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = href
    link.onload = () => {
      link.rel = 'stylesheet'
    }
    document.head.appendChild(link)
  })

  // Preload critical images
  const imagePreloads = [
    '/og-image.jpg',
    '/favicon.ico',
    '/apple-touch-icon.png'
  ]

  imagePreloads.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}

// Lazy load images with intersection observer
export const lazyLoadImages = () => {
  if (typeof window === 'undefined') return

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        if (img.dataset.src) {
          img.src = img.dataset.src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      }
    })
  })

  const lazyImages = document.querySelectorAll('img[data-src]')
  lazyImages.forEach(img => imageObserver.observe(img))
}

// Optimize images for different screen sizes
export const getOptimizedImageSrc = (src: string, width?: number, quality: number = 75) => {
  if (src.startsWith('http')) {
    return src
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://salome.cloudfren.id'
  const params = new URLSearchParams()
  
  if (width) params.append('w', width.toString())
  params.append('q', quality.toString())
  params.append('f', 'webp')

  return `${baseUrl}/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
}

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Optimize scroll performance
export const optimizeScroll = (callback: () => void) => {
  if (typeof window === 'undefined') return

  let ticking = false

  const updateScroll = () => {
    callback()
    ticking = false
  }

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll)
      ticking = true
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', requestTick)
  }
}

// Prefetch critical pages
export const prefetchCriticalPages = () => {
  if (typeof window === 'undefined') return

  const criticalPages = [
    '/dashboard',
    '/browse',
    '/groups',
    '/profile'
  ]

  criticalPages.forEach(page => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = page
    document.head.appendChild(link)
  })
}

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return

  // Preload critical resources
  preloadCriticalResources()

  // Lazy load images
  lazyLoadImages()

  // Prefetch critical pages
  prefetchCriticalPages()

  // Add performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      // Log performance metrics
      console.log('Performance Metrics:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      })
    })
  }
}
