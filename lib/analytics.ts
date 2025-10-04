// Analytics and tracking utilities

// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Google Analytics script
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (GA_TRACKING_ID) {
    gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (GA_TRACKING_ID) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track user engagement
export const trackUserEngagement = (event: string, data?: any) => {
  if (GA_TRACKING_ID) {
    gtag('event', event, {
      event_category: 'User Engagement',
      ...data,
    })
  }
}

// Track conversion events
export const trackConversion = (conversionType: string, value?: number, currency: string = 'IDR') => {
  if (GA_TRACKING_ID) {
    gtag('event', 'conversion', {
      send_to: GA_TRACKING_ID,
      event_category: 'Conversion',
      event_label: conversionType,
      value: value,
      currency: currency,
    })
  }
}

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'Form',
    formName
  )
}

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', 'UI Interaction', `${buttonName} - ${location}`)
}

// Track search queries
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', 'Search', query, resultsCount)
}

// Track user registration
export const trackRegistration = (method: string) => {
  trackEvent('sign_up', 'User', method)
}

// Track user login
export const trackLogin = (method: string) => {
  trackEvent('login', 'User', method)
}

// Track user logout
export const trackLogout = () => {
  trackEvent('logout', 'User')
}

// Track app interactions
export const trackAppInteraction = (appName: string, action: string) => {
  trackEvent(action, 'App Interaction', appName)
}

// Track group interactions
export const trackGroupInteraction = (groupId: string, action: string) => {
  trackEvent(action, 'Group Interaction', groupId)
}

// Track payment events
export const trackPayment = (amount: number, currency: string = 'IDR', method: string) => {
  trackEvent('purchase', 'Ecommerce', method, amount)
  trackConversion('payment', amount, currency)
}

// Track error events
export const trackError = (error: string, location: string) => {
  trackEvent('error', 'Error', `${error} - ${location}`)
}

// Initialize analytics
export const initializeAnalytics = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script)

  // Initialize gtag
  ;(window as any).dataLayer = (window as any).dataLayer || []
  function gtag(...args: any[]) {
    ;(window as any).dataLayer.push(arguments)
  }
  ;(window as any).gtag = gtag

  gtag('js', new Date())
  gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
  })
}

// Track performance metrics
export const trackPerformance = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    // Track Core Web Vitals
    const metrics = {
      dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      load_complete: perfData.loadEventEnd - perfData.loadEventStart,
      first_paint: performance.getEntriesByName('first-paint')[0]?.startTime,
      first_contentful_paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    }

    // Track each metric
    Object.entries(metrics).forEach(([key, value]) => {
      if (value) {
        trackEvent('performance_metric', 'Performance', key, Math.round(value))
      }
    })
  })
}

// Track user session duration
export const trackSessionDuration = () => {
  if (typeof window === 'undefined' || !GA_TRACKING_ID) return

  const startTime = Date.now()
  
  window.addEventListener('beforeunload', () => {
    const duration = Date.now() - startTime
    trackEvent('session_duration', 'User', 'session', Math.round(duration / 1000))
  })
}
