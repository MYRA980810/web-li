export function ChatBubble({ user, color, text }: { user: string; color: string; text: string }) {
  return (
    <div className="flex items-start gap-1.5 mb-1.5">
      <div className="size-5 rounded-full shrink-0 mt-0.5" style={{ background: color }} />
      <div className="chat-bubble">
        <div className="text-[9px] font-bold mb-0.5" style={{ color }}>@{user}</div>
        <div className="text-[11px] text-[var(--ink-1)]">{text}</div>
      </div>
    </div>
  )
}

export function ChatVisual() {
  return (
    <div className="absolute inset-0 chat-bg">
      <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-[55%] aspect-[1/1.3] chat-figure" />
      <div className="absolute left-3.5 bottom-20">
        <ChatBubble user="alex_m" color="var(--cyan-400)" text="¿Tienen talla M? 😍" />
      </div>
      <div className="absolute left-3.5 bottom-6">
        <ChatBubble user="lucia_trend" color="var(--brand-400)" text="¡Me encanta el color!" />
      </div>
      <div className="absolute right-[18px] bottom-[50px] flex flex-col gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="text-xl text-brand-400 [filter:drop-shadow(0_0_6px_rgba(255,31,135,0.7))]"
            style={{ animation: `pulse-dot 1.6s ease-in-out ${i * 0.5}s infinite` }}
          >♥</div>
        ))}
      </div>
    </div>
  )
}
