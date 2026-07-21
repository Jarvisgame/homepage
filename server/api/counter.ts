import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
// Notion 数据库 ID（从数据库页面 URL 中获取，格式为带连字符的 UUID）
// 在 v5.x SDK 中，数据库查询使用 dataSources.query() 而非 databases.query()
const DATABASE_ID = '32e545ea-c542-80dc-897b-f9da70625372';

export default defineEventHandler(async () => {
  try {
    // v5.x SDK 正确 API: notion.dataSources.query({ data_source_id })
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      page_size: 1,
    });

    if (!response.results.length) {
      throw createError({ statusCode: 500, message: '未找到访问次数记录' });
    }

    const page = response.results[0] as any;
    const pageId = page.id;

    // 从数据库属性中读取当前计数（自动识别 number 类型的属性名）
    const properties = page.properties;
    let countPropName = '';
    let currentCount = 0;

    for (const [name, prop] of Object.entries(properties) as [string, any][]) {
      if (prop.type === 'number') {
        countPropName = name;
        currentCount = prop.number || 0;
        break;
      }
    }

    if (!countPropName) {
      throw createError({ statusCode: 500, message: '未找到数字类型的计数属性' });
    }

    // 计数 +1 并写回 Notion
    const newCount = currentCount + 1;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        [countPropName]: { number: newCount },
      },
    });

    return { count: newCount };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('访客计数错误:', e);
    throw createError({ statusCode: 502, message: '访客计数服务异常' });
  }
});
