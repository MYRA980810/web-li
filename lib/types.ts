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
