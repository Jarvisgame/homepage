// server/api/counter.get.ts
// 只读计数：缓存 60 秒，避免每次访问都读 D1
export default defineCachedEventHandler(
  async (event) => {
    const db = (event.context as any).cloudflare?.env?.DB
    if (!db) {
      return { count: 0 }
    }

    const row = await db
      .prepare('SELECT count FROM counter WHERE id = 1')
      .first<{ count: number }>()

    return { count: row?.count ?? 0 }
  },
  {
    maxAge: 60,
    swr: true,
    name: 'counter'
  }
)
