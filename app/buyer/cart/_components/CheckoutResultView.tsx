import { formatMxn } from '@/lib/format'
import type { StoreCheckoutResultResponse } from '@/lib/cartActions'

const SKIPPED_REASON_LABELS: Record<string, string> = {
  OUT_OF_STOCK: 'Sin stock',
  LIVE_EXCLUSIVE: 'Solo disponible en vivo',
  UNAVAILABLE: 'Ya no disponible',
}

const FAILURE_REASON_LABELS: Record<string, string> = {
  ALL_ITEMS_UNAVAILABLE: 'Ningún producto de esta tienda está disponible',
  RESERVATION_FAILED: 'No pudimos reservar el stock, intentá de nuevo',
  STORE_CHECKOUT_ERROR: 'Hubo un error al procesar esta tienda',
}

type Props = {
  results: StoreCheckoutResultResponse[]
  storeNames: Map<string, string>
  onContinue: () => void
}

export function CheckoutResultView({ results, storeNames, onContinue }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 text-center py-4">
        <span className="text-[40px]">📦</span>
        <h2 className="font-display font-bold text-[19px] text-(--ink-0)">Resultado de tu pedido</h2>
        <p className="text-[13px] text-(--ink-3)">Ningún pedido queda pagado todavía — te avisamos cuando se confirme el pago.</p>
      </div>

      <div className="flex flex-col gap-4">
        {results.map((r) => (
          <div key={r.storeId} className="buyer-checkout-result-card">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-bold text-(--ink-0)">{storeNames.get(r.storeId) ?? 'Tienda'}</span>
              {r.succeeded ? (
                <span className="buyer-checkout-status-pill success">Reservado</span>
              ) : (
                <span className="buyer-checkout-status-pill failed">No procesado</span>
              )}
            </div>

            {r.succeeded ? (
              <>
                <p className="text-[13px] text-(--ink-2)">
                  Reservado, pendiente de confirmación de pago.
                  {r.total != null && (
                    <>
                      {' '}
                      Total: <span className="font-bold text-(--ink-0)">{formatMxn(r.total)}</span>
                    </>
                  )}
                </p>
                {r.skippedLines.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-(--ink-3)">Algunos productos no se pudieron reservar:</span>
                    {r.skippedLines.map((s) => (
                      <span key={`${s.productId}:${s.variantId ?? ''}`} className="text-[12px] text-(--ink-3)">
                        • {SKIPPED_REASON_LABELS[s.reason] ?? s.reason}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[13px] text-red-400">
                {(r.failureReason && FAILURE_REASON_LABELS[r.failureReason]) ?? 'No pudimos procesar esta tienda'}
              </p>
            )}
          </div>
        ))}
      </div>

      <button className="live-launch-btn justify-center" onClick={onContinue}>Seguir comprando</button>
    </div>
  )
}
