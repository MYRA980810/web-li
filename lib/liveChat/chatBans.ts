/** A user banned from the seller's chat (bans are per seller, not per live). */
export type ChatBan = {
  userId: string
  displayName: string
  /** ISO-8601; empty when the backend did not send it. */
  bannedAt: string
}

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const FALLBACK_NAME = 'Usuario'

/** "hace un momento" / "hace 15 min" / "hace 2 h" / "hace 3 d"; null if unparseable. */
export function formatBannedAgo(bannedAt: string, now: number): string | null {
  const time = Date.parse(bannedAt)
  if (Number.isNaN(time)) return null
  const elapsed = now - time
  if (elapsed < MINUTE_MS) return 'hace un momento'
  if (elapsed < HOUR_MS) return `hace ${Math.floor(elapsed / MINUTE_MS)} min`
  if (elapsed < DAY_MS) return `hace ${Math.floor(elapsed / HOUR_MS)} h`
  return `hace ${Math.floor(elapsed / DAY_MS)} d`
}

/** Newest first; a re-ban of the same user replaces the previous entry. */
export function addChatBan(list: ChatBan[], ban: ChatBan): ChatBan[] {
  return [ban, ...list.filter((item) => item.userId !== ban.userId)]
}

export function removeChatBan(list: ChatBan[], userId: string): ChatBan[] {
  return list.some((item) => item.userId === userId)
    ? list.filter((item) => item.userId !== userId)
    : list
}

/** Defensive parse of GET /api/lives/{liveId}/chat/bans. */
export function parseChatBans(raw: unknown): ChatBan[] {
  if (!Array.isArray(raw)) return []
  const bans: ChatBan[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { userId, displayName, bannedAt } = item as Record<string, unknown>
    if (typeof userId !== 'string' || !userId) continue
    bans.push({
      userId,
      displayName: typeof displayName === 'string' && displayName.trim() ? displayName.trim() : FALLBACK_NAME,
      bannedAt: typeof bannedAt === 'string' ? bannedAt : '',
    })
  }
  return bans
}

/** First visible character (code point aware), uppercased, for avatars. */
export function userInitial(name: string): string {
  const first = Array.from(name.trim())[0]
  return first ? first.toUpperCase() : '?'
}
