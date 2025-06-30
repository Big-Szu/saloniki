const currencySymbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  PLN: 'zł',
};

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const symbol = currencySymbols[currency] || currency;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}