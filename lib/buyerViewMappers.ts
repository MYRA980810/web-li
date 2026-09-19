import type {
  ProductView,
  VariantView,
  BuyerStoreView,
  BuyerProductCardView,
  BuyerProductDetailView,
  BuyerProductColorOption,
  BuyerProductSizeOption,
} from './types'
import type { StoreCardResponse } from './buyerStoreActions'
import { getPrimaryImageUrl } from './visualFallbacks'

export function toBuyerStoreView(store: StoreCardResponse): BuyerStoreView {
  return {
    id: store.id,
    slug: store.slug,
    name: store.name,
    description: store.description,
    logoUrl: store.logoUrl,
    rating: store.averageRating,
    reviewCount: store.reviewCount,
    rankingPosition: store.rankingPosition,
    followerCount: store.followerCount,
    liveNow: store.liveNow,
  }
}

export function toBuyerProductCardView(product: ProductView, storeName: string): BuyerProductCardView {
  return {
    id: product.id,
    storeId: product.storeId,
    storeName,
    category: product.categoryName,
    name: product.name,
    price: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    currency: product.currency,
    rating: product.averageRating,
    isLive: product.pinnedNow,
    exclusiveToActiveLive: product.exclusiveToActiveLive,
    stockLabel: product.stockLabel,
    imageUrl: getPrimaryImageUrl(product.images),
  }
}

function findOption(product: ProductView, type: 'COLOR' | 'SIZE') {
  return product.options.find((o) => o.type === type) ?? null
}

function isValueAvailable(product: ProductView, optionName: string, value: string): boolean {
  return product.variants.some(
    (v) => v.stock.availableQuantity > 0 && v.options.some((o) => o.optionName === optionName && o.value === value),
  )
}

export function toBuyerProductDetailView(product: ProductView, storeName: string): BuyerProductDetailView {
  const card = toBuyerProductCardView(product, storeName)
  const colorOption = findOption(product, 'COLOR')
  const sizeOption = findOption(product, 'SIZE')

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? null
  const defaultColorValue = colorOption
    ? defaultVariant?.options.find((o) => o.optionName === colorOption.name)?.value ?? null
    : null
  const defaultSizeValue = sizeOption
    ? defaultVariant?.options.find((o) => o.optionName === sizeOption.name)?.value ?? null
    : null

  const colors: BuyerProductColorOption[] = colorOption
    ? colorOption.values.map((v) => ({ id: v.value, label: v.value, swatch: v.swatchHex }))
    : []
  const sizes: BuyerProductSizeOption[] = sizeOption
    ? sizeOption.values.map((v) => ({
        id: v.value,
        label: v.value,
        available: isValueAvailable(product, sizeOption.name, v.value),
      }))
    : []

  const defaultColorId =
    defaultColorValue ??
    (colorOption ? colors.find((c) => isValueAvailable(product, colorOption.name, c.id))?.id : undefined) ??
    colors[0]?.id ??
    null
  const defaultSizeId = defaultSizeValue ?? sizes.find((s) => s.available)?.id ?? sizes[0]?.id ?? null

  return {
    ...card,
    sku: product.sku,
    reviewCount: product.reviewCount,
    soldCount: product.soldCount,
    discountLabel: product.discountLabel,
    isLiveNow: product.pinnedNow,
    colors,
    defaultColorId,
    sizes,
    defaultSizeId,
    images:
      product.images.length > 0
        ? [...product.images].sort((a, b) => a.position - b.position).map((img) => img.url)
        : [],
    variants: product.variants,
    colorOptionName: colorOption?.name ?? null,
    sizeOptionName: sizeOption?.name ?? null,
    basePrice: product.basePrice,
    baseAvailableQuantity: product.stock.availableQuantity,
  }
}

/** Resolves the variant matching the selected color/size values. Returns null
 * for a simple product with no variants — callers should fall back to
 * basePrice/baseAvailableQuantity and pass variantId: null to cart actions. */
export function resolveVariant(
  product: { colorOptionName: string | null; sizeOptionName: string | null; variants: VariantView[] },
  colorId: string | null,
  sizeId: string | null,
): VariantView | null {
  if (product.variants.length === 0) return null

  return (
    product.variants.find((v) => {
      const colorMatches =
        !product.colorOptionName || !colorId
          ? true
          : v.options.some((o) => o.optionName === product.colorOptionName && o.value === colorId)
      const sizeMatches =
        !product.sizeOptionName || !sizeId
          ? true
          : v.options.some((o) => o.optionName === product.sizeOptionName && o.value === sizeId)
      return colorMatches && sizeMatches
    }) ?? null
  )
}
