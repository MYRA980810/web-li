"use client"

import { useState } from 'react'

interface Product {
  id: string
  name: string
  price: number
  currency: 'MXN' | 'USD'
  imageUrl: string
  stock: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {

  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(0)

  function handleAddToCart() {
    setAdded(true)
    setQuantity(q => q + 1)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-72">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
        <p className="text-purple-600 font-semibold mt-1">
          ${product.price.toFixed(2)} {product.currency}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Stock: {product.stock} unidades
        </p>
         <button
          onClick={handleAddToCart}
          className={`mt-3 w-full py-2 rounded-lg transition-colors text-white
            ${added
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-purple-600 hover:bg-purple-700'
            }`}
        >
          {added ? `✓ Agregado (${quantity})` : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}