import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default defineEventHandler(async () => {
  const pageId = process.env.NOTION_PAGE_ID;

  if (!pageId) {
    throw createError({ statusCode: 500, message: '服务器配置错误：缺少 NOTION_PAGE_ID' });
  }

  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });
    return response.results;
  } catch (e) {
    console.error('获取文章列表错误:', e);
    throw createError({ statusCode: 502, message: '没有获取到对应的内容' });
  }
});