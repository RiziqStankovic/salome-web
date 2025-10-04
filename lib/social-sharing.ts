// Social sharing utilities

export const shareToWhatsApp = (url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
  window.open(whatsappUrl, '_blank')
}

export const shareToTelegram = (url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  window.open(telegramUrl, '_blank')
}

export const shareToFacebook = (url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
  window.open(facebookUrl, '_blank')
}

export const shareToTwitter = (url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
  window.open(twitterUrl, '_blank')
}

export const shareToLinkedIn = (url: string, text: string) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedText}`
  window.open(linkedinUrl, '_blank')
}

export const shareToEmail = (url: string, text: string, subject: string) => {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  const encodedSubject = encodeURIComponent(subject)
  const emailUrl = `mailto:?subject=${encodedSubject}&body=${encodedText}%20${encodedUrl}`
  window.open(emailUrl)
}

export const shareToCopy = async (url: string, text: string) => {
  const shareText = `${text} ${url}`
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareText)
      return { success: true, message: 'Link berhasil disalin ke clipboard' }
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return { success: true, message: 'Link berhasil disalin ke clipboard' }
      } catch (err) {
        document.body.removeChild(textArea)
        throw err
      }
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return { success: false, message: 'Gagal menyalin link ke clipboard' }
  }
}

export const shareToNative = async (url: string, text: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'SALOME - Patungan Akun SaaS Bersama',
        text: text,
        url: url,
      })
      return { success: true, message: 'Berhasil dibagikan' }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error)
        return { success: false, message: 'Gagal membagikan' }
      }
    }
  }
  
  return { success: false, message: 'Native sharing tidak didukung' }
}

// Generate share text for different platforms
export const generateShareText = (platform: string, title: string, description: string) => {
  const baseText = `${title} - ${description}`
  
  switch (platform) {
    case 'whatsapp':
      return `🔗 ${baseText}`
    case 'telegram':
      return `🔗 ${baseText}`
    case 'facebook':
      return baseText
    case 'twitter':
      return `${baseText} #SALOME #PatunganSaaS`
    case 'linkedin':
      return baseText
    case 'email':
      return `Halo! Saya ingin berbagi link ini dengan Anda:\n\n${baseText}`
    default:
      return baseText
  }
}

// Get shareable URL with UTM parameters
export const getShareableUrl = (url: string, source: string, medium: string = 'social') => {
  const baseUrl = url.startsWith('http') ? url : `https://salome.cloudfren.id${url}`
  const utmParams = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: 'social_sharing'
  })
  
  return `${baseUrl}?${utmParams.toString()}`
}

// Track sharing events
export const trackSharing = (platform: string, url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'page',
      item_id: url
    })
  }
}
