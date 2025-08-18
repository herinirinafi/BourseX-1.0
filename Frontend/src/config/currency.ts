// Currency formatting for Malagasy Ariary (MGA)

const NF = (() => {
  try {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      currencyDisplay: 'symbol',
      maximumFractionDigits: 0,
    });
  } catch {
    // Fallback: basic number with thousands separator and Ar prefix
    return null as unknown as Intl.NumberFormat;
  }
})();

export function formatCurrency(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return 'Ar 0';
  if (NF && typeof NF.format === 'function') return NF.format(n);
  // Fallback formatting
  const parts = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return `Ar ${parts}`;
}

export function formatNumber(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return '0';
  try {
    return new Intl.NumberFormat('fr-MG', { maximumFractionDigits: 0 }).format(n);
  } catch {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  }
}
