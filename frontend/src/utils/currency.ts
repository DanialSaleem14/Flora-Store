const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  let formatter = formatterCache.get(currencyCode);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode });
    } catch {
      formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
    }
    formatterCache.set(currencyCode, formatter);
  }
  return formatter.format(amount);
}
