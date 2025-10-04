import { Card } from '@/components/ui/Card'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showCard?: boolean
}

export default function Loading({ 
  message = "Memuat...", 
  size = 'md',
  className = "",
  showCard = false
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 rounded-full`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}></div>
      </div>

      {/* Message */}
      <p className={`text-gray-600 dark:text-gray-300 font-medium ${textSizeClasses[size]}`}>
        {message}
      </p>
    </div>
  )

  if (showCard) {
    return (
      <Card className="p-8 text-center">
        {content}
      </Card>
    )
  }

  return content
}

// Skeleton loading components
export function SkeletonCard() {
  return (
    <Card className="p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </Card>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
