import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  label?: string
  helperText?: string
  errorText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, label, helperText, errorText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="label">
            {label}
          </label>
        )}
        <input
          className={cn(
            'input',
            error && 'input-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && errorText && (
          <p className="text-sm text-error-600">{errorText}</p>
        )}
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
