'use client'

import { useRouter } from 'next/navigation'
import { BagIcon, SearchIcon } from '@/components/icons/BuyerNavIcons'
import { useCart } from '@/app/buyer/_providers/CartProvider'
import { CloseIcon } from './LivesIcons'

export type LivesHeaderProps = {
  searchOpen: boolean
  query: string
  onQueryChange: (query: string) => void
  onToggleSearch: () => void
}

export function LivesHeader({ searchOpen, query, onQueryChange, onToggleSearch }: LivesHeaderProps) {
  const router = useRouter()
  const { count: cartCount } = useCart()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display font-extrabold text-[32px] leading-none text-(--ink-0)">Lives</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSearch}
            className="buyer-lives-header-btn"
            aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar lives'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <CloseIcon size={20} /> : <SearchIcon />}
          </button>
          <button
            type="button"
            onClick={() => router.push('/buyer/cart')}
            className="buyer-lives-header-btn cart"
            aria-label="Carrito"
          >
            <BagIcon />
            {cartCount > 0 && <span className="buyer-icon-btn-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="buyer-search-bar active cursor-text">
          <SearchIcon />
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar lives o tiendas"
            className="flex-1 bg-transparent outline-none text-[14px] text-(--ink-0) placeholder:text-(--ink-3) min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Limpiar búsqueda"
              className="text-(--ink-3) hover:text-(--ink-1) shrink-0"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
