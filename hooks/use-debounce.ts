import { useEffect, useState } from 'react';

/**
 * Mengembalikan nilai yang di-debounce setelah `delay` ms sejak nilai terakhir berubah.
 *
 * @param value  Nilai yang ingin di-debounce (biasanya input search)
 * @param delay  Waktu tunggu dalam ms (default: 500)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
