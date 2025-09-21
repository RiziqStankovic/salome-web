/**
 * Currency utility functions for Indonesian Rupiah (IDR)
 */

export const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rp'
export const CURRENCY_CODE = process.env.NEXT_PUBLIC_CURRENCY || 'IDR'

/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: {
    showSymbol?: boolean
    showDecimals?: boolean
    compact?: boolean
  } = {}
): string {
  const {
    showSymbol = true,
    showDecimals = false,
    compact = false
  } = options

  let formattedAmount: string

  if (compact && amount >= 1000000) {
    // Format millions
    const millions = amount / 1000000
    formattedAmount = millions.toFixed(1).replace(/\.0$/, '') + 'M'
  } else if (compact && amount >= 1000) {
    // Format thousands
    const thousands = amount / 1000
    formattedAmount = thousands.toFixed(1).replace(/\.0$/, '') + 'K'
  } else {
    // Regular formatting
    formattedAmount = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount)
  }

  return showSymbol ? `${CURRENCY_SYMBOL} ${formattedAmount}` : formattedAmount
}

/**
 * Parse currency string to number
 * @param currencyString - The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbol and spaces
  const cleanString = currencyString
    .replace(/[Rp\s]/g, '')
    .replace(/\./g, '') // Remove thousand separators
    .replace(/,/g, '.') // Replace decimal comma with dot

  return parseFloat(cleanString) || 0
}

/**
 * Calculate split amount for group payments
 * @param totalAmount - Total amount to split
 * @param memberCount - Number of members
 * @returns Split amount per member
 */
export function calculateSplitAmount(totalAmount: number, memberCount: number): number {
  return Math.ceil(totalAmount / memberCount)
}

/**
 * Calculate savings percentage
 * @param originalPrice - Original individual price
 * @param splitPrice - Price after splitting
 * @returns Savings percentage
 */
export function calculateSavings(originalPrice: number, splitPrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - splitPrice) / originalPrice) * 100)
}

/**
 * Format currency with savings information
 * @param originalPrice - Original individual price
 * @param splitPrice - Price after splitting
 * @param memberCount - Number of members
 * @returns Formatted string with savings info
 */
export function formatWithSavings(
  originalPrice: number,
  splitPrice: number,
  memberCount: number
): string {
  const savings = calculateSavings(originalPrice, splitPrice)
  const totalSavings = originalPrice - splitPrice

  return `${formatCurrency(splitPrice)}/bulan (hemat ${formatCurrency(totalSavings)} atau ${savings}%)`
}

/**
 * Currency input formatter
 * @param value - Input value
 * @returns Formatted input value
 */
export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, '')
  
  // Split by decimal point
  const parts = numericValue.split('.')
  
  // Format integer part with thousand separators
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  
  // Limit decimal places to 2
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }
  
  return parts.join(',')
}

/**
 * Validate currency input
 * @param value - Input value to validate
 * @returns Validation result
 */
export function validateCurrencyInput(value: string): {
  isValid: boolean
  error?: string
} {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Amount is required' }
  }

  const numericValue = parseCurrency(value)
  
  if (isNaN(numericValue) || numericValue < 0) {
    return { isValid: false, error: 'Invalid amount' }
  }

  if (numericValue < 1000) {
    return { isValid: false, error: 'Minimum amount is Rp 1.000' }
  }

  if (numericValue > 100000000) {
    return { isValid: false, error: 'Maximum amount is Rp 100.000.000' }
  }

  return { isValid: true }
}
