// SEO monitoring and analytics utilities

// Track SEO metrics
export const trackSEOMetrics = (pageType: string, data: any) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  const pageTitle = data.title || document.title
  const pageUrl = window.location.href
  const pageDepth = window.location.pathname.split('/').length - 1

  // Track page view with SEO data
  ;(window as any).gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: pageUrl,
    page_type: pageType,
    page_depth: pageDepth
  })

  // Track SEO-specific events
  ;(window as any).gtag('event', 'seo_metrics', {
    event_category: 'SEO',
    event_label: pageType,
    custom_parameter_1: pageTitle,
    custom_parameter_2: pageUrl
  })
}

// Monitor Core Web Vitals
export const monitorCoreWebVitals = () => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    const lastEntry = entries[entries.length - 1] as PerformanceEntry
    
    ;(window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: 'LCP',
      value: Math.round(lastEntry.startTime)
    })
  }).observe({ entryTypes: ['largest-contentful-paint'] })

  // Track First Input Delay (FID)
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry) => {
      const fidEntry = entry as any
      ;(window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: 'FID',
        value: Math.round(fidEntry.processingStart - fidEntry.startTime)
      })
    })
  }).observe({ entryTypes: ['first-input'] })

  // Track Cumulative Layout Shift (CLS)
  let clsValue = 0
  const clsObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries()
    entries.forEach((entry) => {
      const clsEntry = entry as any
      if (!clsEntry.hadRecentInput) {
        clsValue += clsEntry.value
      }
    })
    
    ;(window as any).gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: 'CLS',
      value: Math.round(clsValue * 1000)
    })
  })
  clsObserver.observe({ entryTypes: ['layout-shift'] })
}

// Monitor page load performance
export const monitorPageLoadPerformance = () => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    // Track various performance metrics
    const metrics: Record<string, number> = {
      dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      load_complete: perfData.loadEventEnd - perfData.loadEventStart,
      first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      time_to_interactive: perfData.domInteractive - (perfData as any).navigationStart,
      total_load_time: perfData.loadEventEnd - (perfData as any).navigationStart
    }

    // Track each metric
    Object.entries(metrics).forEach(([key, value]) => {
      if (value) {
        ;(window as any).gtag('event', 'performance_metric', {
          event_category: 'Performance',
          event_label: key,
          value: Math.round(value)
        })
      }
    })
  })
}

// Monitor user engagement
export const monitorUserEngagement = () => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  let engagementStartTime = Date.now()
  let isEngaged = false

  // Track scroll depth
  let maxScrollDepth = 0
  const trackScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollDepth = Math.round((scrollTop / scrollHeight) * 100)
    
    if (scrollDepth > maxScrollDepth) {
      maxScrollDepth = scrollDepth
      
      // Track milestone scroll depths
      if (scrollDepth >= 25 && scrollDepth < 50) {
        ;(window as any).gtag('event', 'scroll_depth', {
          event_category: 'Engagement',
          event_label: '25%',
          value: 25
        })
      } else if (scrollDepth >= 50 && scrollDepth < 75) {
        ;(window as any).gtag('event', 'scroll_depth', {
          event_category: 'Engagement',
          event_label: '50%',
          value: 50
        })
      } else if (scrollDepth >= 75 && scrollDepth < 90) {
        ;(window as any).gtag('event', 'scroll_depth', {
          event_category: 'Engagement',
          event_label: '75%',
          value: 75
        })
      } else if (scrollDepth >= 90) {
        ;(window as any).gtag('event', 'scroll_depth', {
          event_category: 'Engagement',
          event_label: '90%',
          value: 90
        })
      }
    }
  }

  // Track time on page
  const trackTimeOnPage = () => {
    const timeOnPage = Date.now() - engagementStartTime
    
    // Track milestone time intervals
    if (timeOnPage >= 30000 && timeOnPage < 60000) { // 30 seconds
      ;(window as any).gtag('event', 'time_on_page', {
        event_category: 'Engagement',
        event_label: '30s',
        value: 30
      })
    } else if (timeOnPage >= 60000 && timeOnPage < 120000) { // 1 minute
      ;(window as any).gtag('event', 'time_on_page', {
        event_category: 'Engagement',
        event_label: '1m',
        value: 60
      })
    } else if (timeOnPage >= 120000) { // 2 minutes
      ;(window as any).gtag('event', 'time_on_page', {
        event_category: 'Engagement',
        event_label: '2m+',
        value: 120
      })
    }
  }

  // Track user interactions
  const trackUserInteraction = () => {
    if (!isEngaged) {
      isEngaged = true
      ;(window as any).gtag('event', 'user_engagement', {
        event_category: 'Engagement',
        event_label: 'first_interaction'
      })
    }
  }

  // Add event listeners
  window.addEventListener('scroll', trackScrollDepth, { passive: true })
  window.addEventListener('click', trackUserInteraction, { passive: true })
  window.addEventListener('keydown', trackUserInteraction, { passive: true })
  window.addEventListener('touchstart', trackUserInteraction, { passive: true })

  // Track time on page every 30 seconds
  const timeInterval = setInterval(trackTimeOnPage, 30000)

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(timeInterval)
    
    // Track final engagement metrics
    const finalTimeOnPage = Date.now() - engagementStartTime
    const finalScrollDepth: number = maxScrollDepth
    
    ;(window as any).gtag('event', 'page_exit', {
      event_category: 'Engagement',
      event_label: 'exit',
      custom_parameter_1: finalTimeOnPage,
      custom_parameter_2: finalScrollDepth
    })
  })
}

// Monitor search queries
export const monitorSearchQueries = (query: string, resultsCount: number) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  ;(window as any).gtag('event', 'search', {
    event_category: 'Search',
    event_label: query,
    value: resultsCount
  })
}

// Monitor form submissions
export const monitorFormSubmissions = (formName: string, success: boolean) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  ;(window as any).gtag('event', 'form_submit', {
    event_category: 'Form',
    event_label: formName,
    value: success ? 1 : 0
  })
}

// Monitor error events
export const monitorErrors = (error: string, location: string) => {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  ;(window as any).gtag('event', 'error', {
    event_category: 'Error',
    event_label: error,
    custom_parameter_1: location
  })
}

// Initialize all monitoring
export const initializeSEOMonitoring = () => {
  if (typeof window === 'undefined') return

  // Monitor Core Web Vitals
  monitorCoreWebVitals()

  // Monitor page load performance
  monitorPageLoadPerformance()

  // Monitor user engagement
  monitorUserEngagement()

  // Monitor errors
  window.addEventListener('error', (event) => {
    monitorErrors(event.error?.message || 'Unknown error', event.filename || 'Unknown file')
  })

  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    monitorErrors(event.reason?.message || 'Unhandled promise rejection', 'Promise')
  })
}