export type ProductStockInfo = {
  totalQuantity: number
  availableQuantity: number
  reservedQuantity: number
}

export type ProductImageInfo = {
  id: string
  url: string
  position: number
  primary: boolean
}

export type OptionType = 'SIZE' | 'COLOR' | 'OTHER'

export type ProductOptionValue = {
  value: string
  swatchHex: string | null
}

export type ProductOptionInfo = {
  id: string
  name: string
  type: OptionType
  values: ProductOptionValue[]
}

export type VariantOptionValue = {
  optionName: string
  value: string
}

export type VariantView = {
  id: string
  productId: string
  sku: string | null
  priceOverride: number | null
  effectivePrice: number
  isDefault: boolean
  position: number
  options: VariantOptionValue[]
  stock: ProductStockInfo
}

export type ProductView = {
  id: string
  storeId: string
  name: string
  description: string | null
  basePrice: number
  compareAtPrice: number | null
  discountLabel: string | null
  currency: string
  sku: string | null
  active: boolean
  paused: boolean
  categoryId: string | null
  categoryName: string | null
  stock: ProductStockInfo
  stockLabel: string | null
  soldCount: number
  images: ProductImageInfo[]
  options: ProductOptionInfo[]
  variants: VariantView[]
  averageRating: number
  reviewCount: number
  pinnedNow: boolean
  exclusiveToActiveLive: boolean
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: string
  name: string
  slug: string
}

export type AddressType = 'RESIDENTIAL_BUILDING' | 'STORE' | 'APARTMENT' | 'HOTEL' | 'OFFICE' | 'OTHER'

export const ADDRESS_TYPE_META: Record<AddressType, { variant: string; emoji: string; label: string }> = {
  RESIDENTIAL_BUILDING: { variant: 'home', emoji: '🏠', label: 'Edificio residencial' },
  OFFICE: { variant: 'office', emoji: '💼', label: 'Oficinas' },
  STORE: { variant: 'store', emoji: '🏬', label: 'Tienda' },
  APARTMENT: { variant: 'apartment', emoji: '🏢', label: 'Apartamento' },
  HOTEL: { variant: 'hotel', emoji: '🏨', label: 'Hotel' },
  OTHER: { variant: 'other', emoji: '📍', label: 'Otro' },
}

export type BuyerStoreView = {
  id: string
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  rating: number
  reviewCount: number
  rankingPosition: number | null
  followerCount: number
  liveNow: boolean
}

export type BuyerProductCardView = {
  id: string
  storeId: string
  storeName: string
  category: string | null
  name: string
  price: number
  compareAtPrice: number | null
  currency: string
  rating: number
  isLive: boolean
  exclusiveToActiveLive: boolean
  stockLabel: string | null
  imageUrl: string | null
}

export type BuyerProductColorOption = {
  id: string
  label: string
  swatch: string | null
}

export type BuyerProductSizeOption = {
  id: string
  label: string
  available: boolean
}

export type BuyerProductDetailView = BuyerProductCardView & {
  sku: string | null
  reviewCount: number
  soldCount: number
  discountLabel: string | null
  isLiveNow: boolean
  colors: BuyerProductColorOption[]
  defaultColorId: string | null
  sizes: BuyerProductSizeOption[]
  defaultSizeId: string | null
  images: string[]
  variants: VariantView[]
  colorOptionName: string | null
  sizeOptionName: string | null
  basePrice: number
  baseAvailableQuantity: number
}

export type CartLineView = {
  productId: string
  variantId: string | null
  name: string
  imageUrl: string | null
  unitPrice: number
  currency: string
  quantity: number
  availableStock: number
  blockedReason: 'LIVE_EXCLUSIVE' | null
}

export type CartStoreGroupView = {
  storeId: string
  storeName: string
  storeLogoUrl: string | null
  lines: CartLineView[]
}

export type SellerAddressView = {
  id: string
  street: string
  extNumber: string | null
  intNumber: string | null
  neighborhood: string | null
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  latitude: number | null
  longitude: number | null
  addressType: AddressType
}
