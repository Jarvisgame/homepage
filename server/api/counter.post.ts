// server/api/counter.post.ts
// 写入计数：D1 原子自增，返回最新值
export default defineEventHandler(async (event) => {
  const db = (event.context as any).cloudflare?.env?.DB
  if (!db) {
    return { count: 0 }
  }

  const row = await db
    .prepare('UPDATE counter SET count = count + 1 WHERE id = 1 RETURNING count')
    .first<{ count: number }>()

  return { count: row?.count ?? 0 }
})
