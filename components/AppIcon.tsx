'use client'

import { useState } from 'react'

interface AppIconProps {
  iconUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
}

const containerSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
}

export default function AppIcon({ iconUrl, name, size = 'md', className = '' }: AppIconProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const showFallback = !iconUrl || imageError
  const showImage = iconUrl && !imageError

  return (
    <div className={`${containerSizeClasses[size]} bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center ${className}`}>
      {showImage && (
        <img 
          src={iconUrl} 
          alt={name}
          className={sizeClasses[size]}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      {showFallback && (
        <span className="text-primary-600 font-bold text-xs">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}
