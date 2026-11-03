// server/api/counter.get.ts
// 只读计数：不缓存，保证刷新后能看到最新值（D1 读取成本很低）
export default defineEventHandler(async (event) => {
  const db = (event.context as any).cloudflare?.env?.DB
  if (!db) {
    return { count: 0 }
  }

  const row = await db
    .prepare('SELECT count FROM counter WHERE id = 1')
    .first<{ count: number }>()

  return { count: row?.count ?? 0 }
})

