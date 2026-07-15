import { useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/currency';

export function useCurrency() {
  const { website } = useStore();
  const currencyCode = website?.settings?.currency || 'USD';
  return useCallback((amount: number) => formatCurrency(amount, currencyCode), [currencyCode]);
}
