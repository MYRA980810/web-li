// MOCK: the backend has no live likes at all — no like/unlike endpoint, no
// like counter on LiveResponse, and no `like` RTM system message (only
// viewer-count, product-pinned, stock-update, product-expired exist). The
// heart button keeps a local-only toggle over this seed count until the
// backend ships e.g. `POST|DELETE /api/lives/{id}/like` + a realtime counter.
export const MOCK_LIVE_LIKE_COUNT = 2313
