export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="font-display font-extrabold italic tracking-[-0.02em] text-brand-500 [text-shadow:0_0_24px_rgba(255,31,135,0.55)]"
      style={{ fontSize: size }}
    >
      ⚡ Livento
    </span>
  )
}
