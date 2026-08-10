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

export type ProductOptionInfo = {
  id: string
  name: string
  values: string[]
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
  currency: string
  sku: string | null
  active: boolean
  paused: boolean
  categoryId: string | null
  categoryName: string | null
  stock: ProductStockInfo
  images: ProductImageInfo[]
  options: ProductOptionInfo[]
  variants: VariantView[]
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
