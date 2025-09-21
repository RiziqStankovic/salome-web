'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Input } from './Input'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  onChange?: (otp: string) => void
  onError?: () => void
  disabled?: boolean
  className?: string
  clearOnError?: boolean
}

export interface OTPInputRef {
  clearOTP: () => void
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({ 
  length = 6, 
  onComplete, 
  onChange, 
  onError,
  disabled = false,
  className = '',
  clearOnError = true
}, ref) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const [activeOTPIndex, setActiveOTPIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Function to clear OTP
  const clearOTP = () => {
    setOtp(new Array(length).fill(''))
    setActiveOTPIndex(0)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Expose clearOTP function to parent via ref
  useImperativeHandle(ref, () => ({
    clearOTP
  }), [])

  const handleOnChange = (value: string, index: number) => {
    const newOTP = [...otp]
    newOTP[index] = value

    setOtp(newOTP)
    onChange?.(newOTP.join(''))

    // Move to next input if current input has value
    if (value && index < length - 1) {
      setActiveOTPIndex(index + 1)
    }
  }

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        setActiveOTPIndex(index - 1)
      }
    }
  }

  const handleOnPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '')
    const pastedOTP = pastedData.slice(0, length).split('')
    
    if (pastedOTP.length === length) {
      setOtp(pastedOTP)
      setActiveOTPIndex(length - 1)
      onComplete(pastedOTP.join(''))
    }
  }

  useEffect(() => {
    const otpString = otp.join('')
    if (otpString.length === length) {
      onComplete(otpString)
    }
  }, [otp, length, onComplete])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeOTPIndex])

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {otp.map((_, index) => (
        <Input
          key={index}
          ref={index === activeOTPIndex ? inputRef : null}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleOnChange(e.target.value, index)}
          onKeyDown={(e) => handleOnKeyDown(e, index)}
          onPaste={handleOnPaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
        />
      ))}
    </div>
  )
})

OTPInput.displayName = 'OTPInput'

export default OTPInput