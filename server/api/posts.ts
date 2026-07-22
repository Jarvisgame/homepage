import { Client } from '@notionhq/client';

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (i === retries) throw e;
      // 仅对网络类错误（ECONNRESET、fetch failed 等）进行重试
      if (
        e.cause?.code === 'ECONNRESET' ||
        e.code === 'ECONNRESET' ||
        e.message?.includes('fetch failed')
      ) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error('unreachable');
}

export default defineEventHandler(async () => {
  const pageId = process.env.NOTION_PAGE_ID;

  if (!pageId) {
    throw createError({ statusCode: 500, message: '服务器配置错误：缺少 NOTION_PAGE_ID' });
  }

  const notion = new Client({ auth: process.env.NOTION_API_KEY });

  try {
    const response = await withRetry(() =>
      notion.blocks.children.list({ block_id: pageId })
    );
    return response.results;
  } catch (e) {
    console.error('获取文章列表错误:', e);
    throw createError({ statusCode: 502, message: '没有获取到对应的内容' });
  }
});