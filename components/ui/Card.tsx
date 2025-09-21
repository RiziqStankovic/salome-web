import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          {
            'shadow-sm': variant === 'default',
            'shadow-lg': variant === 'elevated',
            'shadow-none border-2': variant === 'outlined',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export { Card }
