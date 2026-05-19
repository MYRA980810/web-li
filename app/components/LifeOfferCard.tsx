'use client'

import { useState, useEffect, useRef } from 'react'

interface Product {
  id: string
  name: string
  price: number
  currency: 'MXN' | 'USD'
  imageUrl: string
  stock: number
  offerDurationSeconds: number
}

interface LiveOfferCardProps {
  product: Product
}

export default function LiveOfferCard({ product }: LiveOfferCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(product.offerDurationSeconds)
  const [expired, setExpired]         = useState(false)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef   = useRef(product.offerDurationSeconds)  // ← ref del contador real
  const hasStarted   = useRef(false)                         // ← evita doble arranque

  useEffect(() => {
    // Si ya arrancó o ya expiró, no hacer nada
    if (hasStarted.current || expired) return
    hasStarted.current = true

    intervalRef.current = setInterval(() => {
      secondsRef.current -= 1  // ← decrementa el ref, no el estado

      if (secondsRef.current <= 0) {
        setExpired(true)
        setSecondsLeft(0)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }

      setSecondsLeft(secondsRef.current)  // ← actualiza el estado para re-render
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, []) // ← array vacío — corre una sola vez al montar

  const minutes    = Math.floor(secondsLeft / 60)
  const seconds    = secondsLeft % 60
  const timerColor = secondsLeft <= 10 ? 'text-red-500' : 'text-green-500'
  const urgency    = secondsLeft <= 10 && !expired

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden w-72
      ${urgency ? 'ring-2 ring-red-500' : ''}`}>

      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs
          font-bold px-2 py-1 rounded-full animate-pulse">
          EN VIVO
        </span>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
        <p className="text-purple-600 font-semibold mt-1">
          ${product.price.toFixed(2)} {product.currency}
        </p>

        {!expired ? (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Oferta termina en</p>
            <p className={`text-2xl font-mono font-bold ${timerColor}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            {urgency && (
              <p className="text-xs text-red-500 font-semibold mt-1 animate-pulse">
                ¡Últimos segundos!
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3 bg-gray-100 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-400 font-semibold">Oferta expirada</p>
          </div>
        )}

        <button
          disabled={expired}
          className={`mt-3 w-full py-2 rounded-lg transition-colors text-white font-semibold
            ${expired
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
            }`}
        >
          {expired ? 'Oferta terminada' : 'Comprar ahora'}
        </button>
      </div>
    </div>
  )
}