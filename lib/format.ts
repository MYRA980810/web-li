export function formatMxn(amount: number): string {
  return `$${amount.toLocaleString('es-MX')}`
}
