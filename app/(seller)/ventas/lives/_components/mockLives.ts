export type LiveOrderStatus = 'entregado' | 'en-camino' | 'pendiente'

export type LiveOrder = {
  id: string
  customer: string
  avatarInitial: string
  orderCode: string
  time: string
  product: string
  amount: number
  status: LiveOrderStatus
}

export type LiveShippingStatus = 'sent' | 'transit' | 'error'

export type TopProduct = {
  rank: number
  name: string
  unitsSold: number
  amount: number
}

export type LiveReport = {
  statusLabel: string
  trendPercent: number
  timeRangeLabel: string
  uniqueViewers: number
  productsViewed: number
  checkoutInit: number
  peakViewers: number
  viewerGrowthLabel: string
  viewerTimeline: number[]
  topProducts: TopProduct[]
}

export type LiveSummary = {
  id: string
  title: string
  dateLabel: string
  duration: string
  durationMinutes: number
  viewers: number
  orders: number
  ticket: number
  conversion: number
  amount: number
  shippingStatus: LiveShippingStatus
  shippingLabel: string
  deliveryEstimateLabel: string
  allOrders: LiveOrder[]
  report: LiveReport
}

export const SHIPPING_STATUS_META: Record<LiveShippingStatus, { label: string; icon: string; pillClass: string }> = {
  sent: { label: 'Todo Enviado', icon: '✓', pillClass: 'paid' },
  transit: { label: 'En Tránsito', icon: '🚚', pillClass: 'scheduled' },
  error: { label: 'Error de Envío', icon: '⚠', pillClass: 'danger' },
}

export const ORDER_STATUS_META: Record<LiveOrderStatus, { label: string; pillClass: string }> = {
  entregado: { label: 'Entregado', pillClass: 'paid' },
  'en-camino': { label: 'En Camino', pillClass: 'scheduled' },
  pendiente: { label: 'Pendiente', pillClass: 'waiting' },
}

export const MONTH_STATS = {
  porLives: 13100,
  porLivesPercent: 71,
  pedidosTotales: 94,
  pedidosVsMesAnterior: '+8 vs mayo',
}

export const LIVES: LiveSummary[] = [
  {
    id: 'live-14jun',
    title: 'Live del 14 jun',
    dateLabel: '14 JUN 2026',
    duration: '1h 22min',
    durationMinutes: 82,
    viewers: 96,
    orders: 18,
    ticket: 213,
    conversion: 18,
    amount: 3840,
    shippingStatus: 'sent',
    shippingLabel: SHIPPING_STATUS_META.sent.label,
    deliveryEstimateLabel: '16 de Junio',
    allOrders: [
      { id: 'lv-7721', customer: 'Marta S.', avatarInitial: 'M', orderCode: '#LV-7721', time: '10:45 AM', product: 'Bolso Minimalista (Gris Espacial)', amount: 1200, status: 'entregado' },
      { id: 'lv-7725', customer: 'Jorge G.', avatarInitial: 'J', orderCode: '#LV-7725', time: '10:58 AM', product: 'Reloj Crono Neon (Edición Limitada)', amount: 2450, status: 'en-camino' },
      { id: 'lv-7730', customer: 'Lucía F.', avatarInitial: 'L', orderCode: '#LV-7730', time: '11:12 AM', product: 'Camiseta Oversize (Vibe)', amount: 190, status: 'pendiente' },
      { id: 'lv-7734', customer: 'Ricardo H.', avatarInitial: 'R', orderCode: '#LV-7734', time: '11:35 AM', product: 'Auriculares Bass Pro', amount: 890, status: 'entregado' },
      { id: 'lv-7739', customer: 'Sofía M.', avatarInitial: 'S', orderCode: '#LV-7739', time: '11:52 AM', product: 'Mochila Urban Trek', amount: 1540, status: 'entregado' },
      { id: 'lv-7742', customer: 'Diego P.', avatarInitial: 'D', orderCode: '#LV-7742', time: '12:03 PM', product: 'Gorra Snapback Neon', amount: 320, status: 'en-camino' },
    ],
    report: {
      statusLabel: 'Live Finalizado',
      trendPercent: 18,
      timeRangeLabel: '20:00 - 21:22',
      uniqueViewers: 96,
      productsViewed: 70,
      checkoutInit: 24,
      peakViewers: 62,
      viewerGrowthLabel: '+21 viewers en 5 min',
      viewerTimeline: [8, 14, 22, 31, 40, 52, 58, 62, 55, 47, 36, 24, 15],
      topProducts: [
        { rank: 1, name: 'Reloj Crono Neon (Edición Limitada)', unitsSold: 6, amount: 4200 },
        { rank: 2, name: 'Mochila Urban Trek', unitsSold: 4, amount: 3080 },
        { rank: 3, name: 'Bolso Minimalista (Gris Espacial)', unitsSold: 3, amount: 1900 },
        { rank: 4, name: 'Auriculares Bass Pro', unitsSold: 3, amount: 1780 },
        { rank: 5, name: 'Gorra Snapback Neon', unitsSold: 5, amount: 1600 },
      ],
    },
  },
  {
    id: 'live-10jun',
    title: 'Live del 10 jun',
    dateLabel: '10 JUN 2026',
    duration: '45min',
    durationMinutes: 45,
    viewers: 42,
    orders: 6,
    ticket: 187,
    conversion: 14,
    amount: 1120,
    shippingStatus: 'transit',
    shippingLabel: SHIPPING_STATUS_META.transit.label,
    deliveryEstimateLabel: '12 de Junio',
    allOrders: [
      { id: 'lv-7610', customer: 'Valentina R.', avatarInitial: 'V', orderCode: '#LV-7610', time: '09:15 AM', product: 'Set de Brochas Pro', amount: 420, status: 'en-camino' },
      { id: 'lv-7614', customer: 'Andrés T.', avatarInitial: 'A', orderCode: '#LV-7614', time: '09:28 AM', product: 'Termo Acero Inox', amount: 310, status: 'en-camino' },
      { id: 'lv-7619', customer: 'Camila O.', avatarInitial: 'C', orderCode: '#LV-7619', time: '09:40 AM', product: 'Funda Celular Neón', amount: 390, status: 'pendiente' },
    ],
    report: {
      statusLabel: 'Live Finalizado',
      trendPercent: -12,
      timeRangeLabel: '18:00 - 18:45',
      uniqueViewers: 42,
      productsViewed: 27,
      checkoutInit: 10,
      peakViewers: 29,
      viewerGrowthLabel: '+9 viewers en 5 min',
      viewerTimeline: [5, 9, 14, 19, 24, 29, 26, 20, 14, 8],
      topProducts: [
        { rank: 1, name: 'Set de Brochas Pro', unitsSold: 2, amount: 640 },
        { rank: 2, name: 'Funda Celular Neón', unitsSold: 2, amount: 520 },
        { rank: 3, name: 'Termo Acero Inox', unitsSold: 1, amount: 310 },
        { rank: 4, name: 'Labial Mate Duo', unitsSold: 2, amount: 380 },
        { rank: 5, name: 'Espejo Compacto LED', unitsSold: 1, amount: 210 },
      ],
    },
  },
  {
    id: 'live-05jun',
    title: 'Live del 05 jun',
    dateLabel: '05 JUN 2026',
    duration: '2h 05m',
    durationMinutes: 125,
    viewers: 114,
    orders: 9,
    ticket: 588,
    conversion: 11,
    amount: 5290,
    shippingStatus: 'error',
    shippingLabel: SHIPPING_STATUS_META.error.label,
    deliveryEstimateLabel: '07 de Junio',
    allOrders: [
      { id: 'lv-7501', customer: 'Fernanda L.', avatarInitial: 'F', orderCode: '#LV-7501', time: '08:10 PM', product: 'Zapatillas Urban Flow', amount: 1890, status: 'pendiente' },
      { id: 'lv-7505', customer: 'Iván S.', avatarInitial: 'I', orderCode: '#LV-7505', time: '08:25 PM', product: 'Chaqueta Windbreaker', amount: 2100, status: 'pendiente' },
      { id: 'lv-7511', customer: 'Renata G.', avatarInitial: 'R', orderCode: '#LV-7511', time: '08:41 PM', product: 'Lentes Sol Retro', amount: 1300, status: 'entregado' },
    ],
    report: {
      statusLabel: 'Live Finalizado',
      trendPercent: 34,
      timeRangeLabel: '20:00 - 22:05',
      uniqueViewers: 114,
      productsViewed: 82,
      checkoutInit: 16,
      peakViewers: 91,
      viewerGrowthLabel: '+30 viewers en 5 min',
      viewerTimeline: [10, 18, 27, 38, 50, 63, 74, 84, 91, 80, 68, 54, 38, 22],
      topProducts: [
        { rank: 1, name: 'Chaqueta Windbreaker', unitsSold: 4, amount: 3400 },
        { rank: 2, name: 'Zapatillas Urban Flow', unitsSold: 3, amount: 2600 },
        { rank: 3, name: 'Lentes Sol Retro', unitsSold: 2, amount: 1500 },
        { rank: 4, name: 'Bufanda Tejida Premium', unitsSold: 3, amount: 1200 },
        { rank: 5, name: 'Guantes Térmicos Pro', unitsSold: 2, amount: 780 },
      ],
    },
  },
]

export function formatMxn(amount: number): string {
  return `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
}

export type OrderTimelineStepState = 'done' | 'current' | 'pending'

export type OrderTimelineStep = {
  label: string
  detail: string
  state: OrderTimelineStepState
}

export type OrderDetail = {
  sku: string
  buyerPhone: string
  shippingAddress: string
  carrier: string
  timeline: OrderTimelineStep[]
}

const PHONE_POOL = [
  '+52 55 1234 5678',
  '+52 55 8823 4410',
  '+52 55 6612 9087',
  '+52 55 4471 2298',
  '+52 55 9034 6651',
  '+52 55 2287 7743',
]

const ADDRESS_POOL = [
  'Av. Insurgentes Sur 1602, Crédito Constructor, Benito Juárez, 03940, Ciudad de México, CDMX',
  'Calle Reforma 88, Juárez, Cuauhtémoc, 06600, Ciudad de México, CDMX',
  'Av. Chapultepec 430, Roma Norte, Cuauhtémoc, 06700, Ciudad de México, CDMX',
  'Calle Amsterdam 215, Condesa, Cuauhtémoc, 06140, Ciudad de México, CDMX',
  'Av. Universidad 1200, Del Valle, Benito Juárez, 03100, Ciudad de México, CDMX',
  'Calle Horacio 340, Polanco, Miguel Hidalgo, 11560, Ciudad de México, CDMX',
]

const HUB_POOL = ['Ciudad de México · Hub Norte', 'Ciudad de México · Hub Centro', 'Guadalajara · Hub Occidente']

function hashIndex(seed: string, mod: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % mod
}

function titleCase(word: string): string {
  return word.charAt(0) + word.slice(1).toLowerCase()
}

export function buildOrderDetail(order: LiveOrder, live: LiveSummary): OrderDetail {
  const [day, month] = live.dateLabel.split(' ')
  const confirmedDetail = `${day} ${titleCase(month ?? '')}, ${order.time}`
  const hub = HUB_POOL[hashIndex(`${order.id}-hub`, HUB_POOL.length)]!

  const timeline: OrderTimelineStep[] = [
    { label: 'Pedido Confirmado', detail: confirmedDetail, state: 'done' },
    {
      label: 'Preparado',
      detail: 'Empacado y listo para envío',
      state: order.status === 'pendiente' ? 'current' : 'done',
    },
    {
      label: 'En Tránsito',
      detail: hub,
      state: order.status === 'entregado' ? 'done' : order.status === 'en-camino' ? 'current' : 'pending',
    },
    {
      label: 'Entregado',
      detail: order.status === 'entregado' ? 'Confirmado por el comprador' : `Fecha estimada: ${live.deliveryEstimateLabel}`,
      state: order.status === 'entregado' ? 'done' : 'pending',
    },
  ]

  return {
    sku: order.orderCode.replace('#LV-', '#TX-'),
    buyerPhone: PHONE_POOL[hashIndex(`${order.id}-phone`, PHONE_POOL.length)]!,
    shippingAddress: ADDRESS_POOL[hashIndex(`${order.id}-addr`, ADDRESS_POOL.length)]!,
    carrier: 'Livento Logistics',
    timeline,
  }
}

export type FunnelStep = {
  label: string
  value: number
  percent: number
  colorVar: string
}

export function buildConversionFunnel(live: LiveSummary): FunnelStep[] {
  const { report } = live
  const base = report.uniqueViewers

  return [
    { label: 'Viewers Únicos', value: base, percent: 100, colorVar: 'var(--cyan-400)' },
    { label: 'Vieron Producto', value: report.productsViewed, percent: Math.round((report.productsViewed / base) * 100), colorVar: 'var(--violet-400)' },
    { label: 'Checkout Iniciado', value: report.checkoutInit, percent: Math.round((report.checkoutInit / base) * 100), colorVar: 'var(--brand-400)' },
    { label: 'Pedidos Pagados', value: live.orders, percent: Math.round((live.orders / base) * 100), colorVar: '#4ade80' },
  ]
}
