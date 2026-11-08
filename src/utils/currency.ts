export type CurrencyCode = 'INR' | 'USD';

// Standard exchange rate for US stocks conversion to INR
export const USD_TO_INR_RATE = 86.50;

/**
 * Format a numeric value in Indian Rupees (₹) using the Indian numbering system (Lakhs & Crores)
 * or USD ($) based on the active currency.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: {
    compact?: boolean;
    decimals?: number;
    showSymbol?: boolean;
  }
): string {
  const { compact = false, decimals = 2, showSymbol = true } = options || {};
  const symbol = showSymbol ? (currency === 'INR' ? '₹' : '$') : '';

  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }

  if (currency === 'INR') {
    if (compact) {
      // Indian compact format: Crores (Cr) and Lakhs (L)
      const absVal = Math.abs(amount);
      if (absVal >= 10000000) {
        return `${symbol}${(amount / 10000000).toFixed(decimals)} Cr`;
      }
      if (absVal >= 100000) {
        return `${symbol}${(amount / 100000).toFixed(decimals)} L`;
      }
      if (absVal >= 1000) {
        return `${symbol}${(amount / 1000).toFixed(decimals)} K`;
      }
    }

    return `${symbol}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  // USD
  if (compact) {
    const absVal = Math.abs(amount);
    if (absVal >= 1000000000) {
      return `${symbol}${(amount / 1000000000).toFixed(decimals)}B`;
    }
    if (absVal >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(decimals)}M`;
    }
    if (absVal >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(decimals)}K`;
    }
  }

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
