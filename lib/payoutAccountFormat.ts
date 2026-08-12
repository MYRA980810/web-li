import type { SellerPayoutAccountDetails } from './profileActions'

export function bannerStatus(details: SellerPayoutAccountDetails): 'active' | 'pending' | 'disabled' {
  if (!details.connected) return 'pending'
  if (details.disabledReason) return 'disabled'
  if (details.pastDue.length > 0 || !details.chargesEnabled || !details.payoutsEnabled || !details.detailsSubmitted) return 'pending'
  return 'active'
}

export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase() }).format(amountMinor / 100)
}
