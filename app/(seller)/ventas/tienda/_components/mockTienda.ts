export type StoreSaleStatus = 'entregado' | 'en-camino' | 'pendiente'
export type StoreSalePeriod = 'hoy' | 'semana' | 'mes'

export type StoreSale = {
  id: string
  product: string
  productEmoji: string
  amount: number
  customer: string
  customerPhone: string
  shippingAddress: string
  orderCode: string
  sku: string
  dateLabel: string
  timeLabel: string
  fullDateLabel: string
  deliveryEstimateLabel: string
  carrier: string
  hub: string
  period: StoreSalePeriod
  status: StoreSaleStatus
}

export const STORE_STATUS_META: Record<StoreSaleStatus, { label: string; pillClass: string }> = {
  entregado: { label: 'Entregado', pillClass: 'paid' },
  'en-camino': { label: 'En Camino', pillClass: 'scheduled' },
  pendiente: { label: 'Pendiente', pillClass: 'waiting' },
}

export const STORE_STATS = {
  ventasTotales: 5320,
  vendidos: 20,
  ticketProm: 268,
}

export const STORE_SALES: StoreSale[] = [
  {
    id: 'tv-9001',
    product: 'Teclado Mecánico RG',
    productEmoji: '⌨️',
    amount: 2450,
    customer: 'Mateo García',
    customerPhone: '+52 55 3312 8890',
    shippingAddress: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940, Ciudad de México, CDMX',
    orderCode: '#TV-9001',
    sku: '#TX-9001',
    dateLabel: 'HOY',
    timeLabel: '14:35',
    fullDateLabel: 'Hoy, 14:35',
    deliveryEstimateLabel: '19 de Agosto',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    period: 'hoy',
    status: 'pendiente',
  },
  {
    id: 'tv-8994',
    product: 'Eau de Parfum – Nocturne',
    productEmoji: '🧴',
    amount: 1890,
    customer: 'Sofía Beltrán',
    customerPhone: '+52 55 7745 2201',
    shippingAddress: 'Calle Reforma 88, Juárez, Cuauhtémoc, 06600, Ciudad de México, CDMX',
    orderCode: '#TV-8994',
    sku: '#TX-8994',
    dateLabel: 'AYER',
    timeLabel: '18:20',
    fullDateLabel: 'Ayer, 18:20',
    deliveryEstimateLabel: '18 de Agosto',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Norte',
    period: 'semana',
    status: 'en-camino',
  },
  {
    id: 'tv-8975',
    product: 'Headphones Ultra AN',
    productEmoji: '🎧',
    amount: 5600,
    customer: 'Carlos Ruiz',
    customerPhone: '+52 55 4471 2298',
    shippingAddress: 'Av. Chapultepec 430, Roma Norte, Cuauhtémoc, 06700, Ciudad de México, CDMX',
    orderCode: '#TV-8975',
    sku: '#TX-8975',
    dateLabel: '25 MAY',
    timeLabel: '11:15',
    fullDateLabel: '25 Mayo, 11:15',
    deliveryEstimateLabel: 'Entregado',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    period: 'mes',
    status: 'entregado',
  },
  {
    id: 'tv-8960',
    product: 'Mochila Urban Trek',
    productEmoji: '🎒',
    amount: 1540,
    customer: 'Renata Gómez',
    customerPhone: '+52 55 9034 6651',
    shippingAddress: 'Calle Amsterdam 215, Condesa, Cuauhtémoc, 06140, Ciudad de México, CDMX',
    orderCode: '#TV-8960',
    sku: '#TX-8960',
    dateLabel: '12 AGO',
    timeLabel: '09:40',
    fullDateLabel: '12 Agosto, 09:40',
    deliveryEstimateLabel: '14 de Agosto',
    carrier: 'Livento Logistics',
    hub: 'Guadalajara · Hub Occidente',
    period: 'semana',
    status: 'entregado',
  },
  {
    id: 'tv-8942',
    product: 'Lentes Sol Retro',
    productEmoji: '🕶️',
    amount: 1300,
    customer: 'Iván Sánchez',
    customerPhone: '+52 55 6612 9087',
    shippingAddress: 'Av. Universidad 1200, Del Valle, Benito Juárez, 03100, Ciudad de México, CDMX',
    orderCode: '#TV-8942',
    sku: '#TX-8942',
    dateLabel: '05 AGO',
    timeLabel: '16:02',
    fullDateLabel: '05 Agosto, 16:02',
    deliveryEstimateLabel: '07 de Agosto',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Norte',
    period: 'mes',
    status: 'pendiente',
  },
  {
    id: 'tv-8930',
    product: 'Termo Acero Inox',
    productEmoji: '🧉',
    amount: 310,
    customer: 'Valentina Ríos',
    customerPhone: '+52 55 2287 7743',
    shippingAddress: 'Calle Horacio 340, Polanco, Miguel Hidalgo, 11560, Ciudad de México, CDMX',
    orderCode: '#TV-8930',
    sku: '#TX-8930',
    dateLabel: '02 AGO',
    timeLabel: '10:18',
    fullDateLabel: '02 Agosto, 10:18',
    deliveryEstimateLabel: 'Entregado',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    period: 'mes',
    status: 'entregado',
  },
]

export function formatMxn(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export type SaleTimelineStepState = 'done' | 'current' | 'pending'

export type SaleTimelineStep = {
  label: string
  detail: string
  state: SaleTimelineStepState
}

export function buildSaleTimeline(sale: StoreSale): SaleTimelineStep[] {
  return [
    { label: 'Pedido Confirmado', detail: sale.fullDateLabel, state: 'done' },
    {
      label: 'Preparado',
      detail: 'Empacado y listo para envío',
      state: sale.status === 'pendiente' ? 'current' : 'done',
    },
    {
      label: 'En Tránsito',
      detail: sale.hub,
      state: sale.status === 'entregado' ? 'done' : sale.status === 'en-camino' ? 'current' : 'pending',
    },
    {
      label: 'Entregado',
      detail: sale.status === 'entregado' ? 'Confirmado por el comprador' : `Fecha estimada: ${sale.deliveryEstimateLabel}`,
      state: sale.status === 'entregado' ? 'done' : 'pending',
    },
  ]
}
