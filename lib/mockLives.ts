export type LiveCategoryId = 'ropa' | 'calzado' | 'cosmetica' | 'hogar' | 'accesorios' | 'jugueteria'

export type LiveItem = {
  id: string
  store: string
  storeShort: string
  category: LiveCategoryId
  categoryLabel: string
  product: string
  viewers: number
  color: string
  bg: string
  location: string
  caption: string
  pinnedPrice: string
}

export type ScheduledLiveItem = {
  id: string
  store: string
  category: LiveCategoryId
  color: string
  day: string
  time: string
}

export const LIVE_CATEGORIES: { id: 'todos' | LiveCategoryId; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: '✦' },
  { id: 'ropa', label: 'Ropa', icon: '👗' },
  { id: 'calzado', label: 'Calzado', icon: '👞' },
  { id: 'cosmetica', label: 'Cosmética', icon: '💄' },
  { id: 'hogar', label: 'Hogar', icon: '🏺' },
  { id: 'accesorios', label: 'Accesorios', icon: '💍' },
  { id: 'jugueteria', label: 'Juguetería', icon: '🧸' },
]

export const LIVE_ITEMS: LiveItem[] = [
  { id: 'boutique-mar', store: 'Boutique Mar', storeShort: 'Boutique M...', category: 'ropa', categoryLabel: 'Ropa', product: 'Vestido midi lino', viewers: 214, color: 'var(--brand-400)', bg: 'radial-gradient(ellipse at 50% 30%, #6b4a2a 0%, #2a1a10 60%, #120a08 100%)', location: 'Tepic', caption: 'Nueva colección verano 🌊 vestidos de lino desde $590', pinnedPrice: '$690 MXN' },
  { id: 'calzado-nayarit', store: 'Calzado Nayarit', storeShort: 'Calzado Naya...', category: 'calzado', categoryLabel: 'Calzado', product: 'Sandalias verano', viewers: 89, color: '#f59e0b', bg: 'radial-gradient(ellipse at 50% 30%, #e8e4de 0%, #a8a29a 100%)', location: 'Tepic', caption: 'Sandalias de piel hechas a mano, envío gratis hoy', pinnedPrice: '$450 MXN' },
  { id: 'casa-bella', store: 'Casa Bella Decor', storeShort: 'Casa Bella De...', category: 'hogar', categoryLabel: 'Hogar', product: 'Velas artesanales', viewers: 47, color: 'var(--violet-400)', bg: 'radial-gradient(ellipse at 50% 30%, #3a1e2e 0%, #150a12 100%)', location: 'Xalapa', caption: 'Velas de soya con aroma natural, set de 3', pinnedPrice: '$320 MXN' },
  { id: 'glow-cosmetica', store: 'Glow Cosmética', storeShort: 'Glow Cosméti...', category: 'cosmetica', categoryLabel: 'Cosmética', product: 'Rutina facial 4 pasos', viewers: 63, color: 'var(--teal-400)', bg: 'radial-gradient(ellipse at 50% 30%, #4a3420 0%, #1a1208 100%)', location: 'Xalapa', caption: 'Kit completo de skincare, rutina para piel mixta', pinnedPrice: '$520 MXN' },
  { id: 'perlas-co', store: 'Perlas & Co', storeShort: 'Perlas & Co', category: 'accesorios', categoryLabel: 'Accesorios', product: 'Collar de perlas', viewers: 31, color: '#e5e7eb', bg: 'radial-gradient(ellipse at 50% 30%, #2a2a30 0%, #0e0e12 100%)', location: 'Nayarit', caption: 'Perlas cultivadas, edición limitada', pinnedPrice: '$980 MXN' },
  { id: 'jugueton-mx', store: 'Juguetón MX', storeShort: 'Juguetón MX', category: 'jugueteria', categoryLabel: 'Juguetería', product: 'Figuras coleccionables', viewers: 24, color: 'var(--brand-400)', bg: 'radial-gradient(ellipse at 50% 30%, #1a0e2e 0%, #0a0515 100%)', location: 'Tepic', caption: 'Nueva colección y ofertas 2x1', pinnedPrice: '$280 MXN' },
  { id: 'casa-lima', store: 'Casa Lima', storeShort: 'Casa Li...', category: 'ropa', categoryLabel: 'Ropa', product: 'Vestidos de temporada', viewers: 76, color: 'var(--violet-400)', bg: 'radial-gradient(ellipse at 50% 30%, #4a1a30 0%, #1a0a12 100%)', location: 'Xalapa', caption: 'Abrigos y vestidos otoño-invierno', pinnedPrice: '$740 MXN' },
  { id: 'tienda-alma', store: 'Tienda Alma', storeShort: 'Tienda Alma', category: 'ropa', categoryLabel: 'Ropa', product: 'Vestido cruzado floral', viewers: 52, color: '#38bdf8', bg: 'radial-gradient(ellipse at 50% 30%, #e8e4de 0%, #a8a29a 100%)', location: 'Nayarit', caption: 'Prendas artesanales, telas locales', pinnedPrice: '$610 MXN' },
  { id: 'estilo-nayarit', store: 'Estilo Nayarit', storeShort: 'Estilo Naya...', category: 'ropa', categoryLabel: 'Ropa', product: 'Vestidos de fiesta', viewers: 18, color: '#f59e0b', bg: 'radial-gradient(ellipse at 50% 30%, #4a3410 0%, #1a1005 100%)', location: 'Tepic', caption: 'Vestidos de gala, tallas 2-18', pinnedPrice: '$890 MXN' },
]

export const SCHEDULED_ITEMS: ScheduledLiveItem[] = [
  { id: 'boutique-mar-sched', store: 'Boutique Mar', category: 'ropa', color: 'var(--brand-400)', day: 'Sáb', time: '12:00 PM' },
  { id: 'mar-azul', store: 'Mar Azul Accesorios', category: 'accesorios', color: '#38bdf8', day: 'Dom', time: '5:00 PM' },
  { id: 'glow-sched', store: 'Glow Cosmética', category: 'cosmetica', color: 'var(--teal-400)', day: 'Lun', time: '7:00 PM' },
]

export function getLiveById(id: string): LiveItem {
  return LIVE_ITEMS.find((item) => item.id === id) ?? LIVE_ITEMS[0]
}
