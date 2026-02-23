/**
 * Format a number as currency with commas and 2 decimal places
 * @param amount - The amount to format
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted currency string (e.g., "$1,089.90")
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
    return `${currency}${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
  }