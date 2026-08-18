export type ShipmentChannel = 'lives' | 'tienda'
export type ShipmentStatus = 'alerta' | 'preparado' | 'en-camino' | 'entregado'

export type Shipment = {
  id: string
  channel: ShipmentChannel
  customer: string
  customerPhone: string
  product: string
  productEmoji: string
  amount: number
  orderCode: string
  status: ShipmentStatus
  confirmedDetail: string
  shippingAddress: string
  carrier: string
  hub: string
  deliveryEstimateLabel: string
}

export const SHIPMENT_STATUS_META: Record<ShipmentStatus, { label: string; pillClass: string }> = {
  alerta: { label: 'Falla Entrega', pillClass: 'danger' },
  preparado: { label: 'Preparado', pillClass: 'brand' },
  'en-camino': { label: 'En Camino', pillClass: 'scheduled' },
  entregado: { label: 'Entregado', pillClass: 'paid' },
}

export const SHIPMENTS: Shipment[] = [
  {
    id: 'sh-9922',
    channel: 'tienda',
    customer: 'Mariana Veloz',
    customerPhone: '+52 55 4471 2298',
    product: 'Reloj Cronógrafo Noir',
    productEmoji: '⌚',
    amount: 3200,
    orderCode: '#TX-9922',
    status: 'alerta',
    confirmedDetail: '10 Agosto, 09:20',
    shippingAddress: 'Av. Chapultepec 430, Roma Norte, Cuauhtémoc, 06700, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    deliveryEstimateLabel: 'Reintento pendiente',
  },
  {
    id: 'sh-7721',
    channel: 'lives',
    customer: 'Carla S.',
    customerPhone: '+52 55 1234 5678',
    product: 'Bolso de Piel',
    productEmoji: '👜',
    amount: 1200,
    orderCode: '#LX-7721',
    status: 'en-camino',
    confirmedDetail: '14 Agosto, 10:45',
    shippingAddress: 'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Norte',
    deliveryEstimateLabel: '18 de Agosto',
  },
  {
    id: 'sh-1102',
    channel: 'lives',
    customer: 'Roberto F.',
    customerPhone: '+52 55 8823 4410',
    product: 'Jersey',
    productEmoji: '👕',
    amount: 890,
    orderCode: '#LX-1102',
    status: 'preparado',
    confirmedDetail: '16 Agosto, 16:05',
    shippingAddress: 'Calle Reforma 88, Juárez, Cuauhtémoc, 06600, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    deliveryEstimateLabel: '20 de Agosto',
  },
  {
    id: 'sh-8994',
    channel: 'tienda',
    customer: 'Sofía Beltrán',
    customerPhone: '+52 55 7745 2201',
    product: 'Eau de Parfum – Nocturne',
    productEmoji: '🧴',
    amount: 1890,
    orderCode: '#TX-8994',
    status: 'en-camino',
    confirmedDetail: '16 Agosto, 18:20',
    shippingAddress: 'Calle Reforma 88, Juárez, Cuauhtémoc, 06600, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Norte',
    deliveryEstimateLabel: '18 de Agosto',
  },
  {
    id: 'sh-7730',
    channel: 'lives',
    customer: 'Lucía F.',
    customerPhone: '+52 55 6612 9087',
    product: 'Camiseta Oversize (Vibe)',
    productEmoji: '👚',
    amount: 190,
    orderCode: '#LX-7730',
    status: 'alerta',
    confirmedDetail: '11 Agosto, 11:12',
    shippingAddress: 'Calle Amsterdam 215, Condesa, Cuauhtémoc, 06140, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Guadalajara · Hub Occidente',
    deliveryEstimateLabel: 'Reintento pendiente',
  },
  {
    id: 'sh-8960',
    channel: 'tienda',
    customer: 'Renata Gómez',
    customerPhone: '+52 55 9034 6651',
    product: 'Mochila Urban Trek',
    productEmoji: '🎒',
    amount: 1540,
    orderCode: '#TX-8960',
    status: 'preparado',
    confirmedDetail: '17 Agosto, 09:40',
    shippingAddress: 'Av. Universidad 1200, Del Valle, Benito Juárez, 03100, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Guadalajara · Hub Occidente',
    deliveryEstimateLabel: '21 de Agosto',
  },
  {
    id: 'sh-7742',
    channel: 'lives',
    customer: 'Diego P.',
    customerPhone: '+52 55 2287 7743',
    product: 'Gorra Snapback Neon',
    productEmoji: '🧢',
    amount: 320,
    orderCode: '#LX-7742',
    status: 'entregado',
    confirmedDetail: '14 Agosto, 12:03',
    shippingAddress: 'Calle Horacio 340, Polanco, Miguel Hidalgo, 11560, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    deliveryEstimateLabel: 'Entregado',
  },
  {
    id: 'sh-8975',
    channel: 'tienda',
    customer: 'Carlos Ruiz',
    customerPhone: '+52 55 4471 2298',
    product: 'Headphones Ultra AN',
    productEmoji: '🎧',
    amount: 5600,
    orderCode: '#TX-8975',
    status: 'entregado',
    confirmedDetail: '25 Mayo, 11:15',
    shippingAddress: 'Av. Chapultepec 430, Roma Norte, Cuauhtémoc, 06700, Ciudad de México, CDMX',
    carrier: 'Livento Logistics',
    hub: 'Ciudad de México · Hub Centro',
    deliveryEstimateLabel: 'Entregado',
  },
]

export function formatMxn(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export type ShipmentTimelineStepState = 'done' | 'current' | 'pending' | 'error'

export type ShipmentTimelineStep = {
  label: string
  detail: string
  state: ShipmentTimelineStepState
}

const STAGE_RANK: Record<'preparado' | 'en-camino', number> = { preparado: 0, 'en-camino': 1 }

export function buildShipmentTimeline(shipment: Shipment): ShipmentTimelineStep[] {
  const isAlerta = shipment.status === 'alerta'
  const isFinal = shipment.status === 'entregado'
  const rank = isAlerta || isFinal ? 2 : STAGE_RANK[shipment.status as 'preparado' | 'en-camino']

  const stepState = (i: number): ShipmentTimelineStepState => {
    if (isFinal) return 'done'
    if (i < rank) return 'done'
    if (i === rank) return 'current'
    return 'pending'
  }

  return [
    { label: 'Pedido Confirmado', detail: shipment.confirmedDetail, state: 'done' },
    { label: 'Preparado', detail: 'Empacado y listo para envío', state: stepState(0) },
    { label: 'En Tránsito', detail: shipment.hub, state: stepState(1) },
    {
      label: 'Entregado',
      detail: isAlerta
        ? 'Falla en la entrega — reintentar envío'
        : isFinal
          ? 'Confirmado por el comprador'
          : `Fecha estimada: ${shipment.deliveryEstimateLabel}`,
      state: isAlerta ? 'error' : stepState(2),
    },
  ]
}
