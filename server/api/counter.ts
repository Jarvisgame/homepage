import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * 从页面 properties 中提取 number 类型的属性名和值
 */
function extractNumberProp(page: any): { name: string; value: number } | null {
  const props = page.properties || {};
  for (const [name, prop] of Object.entries(props) as [string, any][]) {
    if (prop.type === 'number') {
      return { name, value: prop.number || 0 };
    }
  }
  return null;
}

export default defineEventHandler(async () => {
  const databaseId = process.env.NOTION_COUNTER_DB_ID;

  if (!databaseId) {
    throw createError({
      statusCode: 500,
      message: '服务器配置错误：缺少 NOTION_COUNTER_DB_ID 环境变量',
    });
  }

  try {
    // 先验证集成是否有权限访问该数据库
    await notion.databases.retrieve({ database_id: databaseId });

    let countPageId: string | null = null;
    let currentCount = 0;
    let countPropName = '';

    // --- 主方案：用旧版 REST API 直接查询 databases/{id}/query ---
    // v5.x SDK 的 dataSources.query 不兼容 UI 创建的数据库，旧版 /databases/query 仍然可用
    const legacyRes = await $fetch<{ results: any[] }>(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: { page_size: 1 },
      }
    );

    if (legacyRes.results?.length > 0) {
      // 数据库中有页面，读取第一个
      const page = legacyRes.results[0];
      countPageId = page.id;
      const prop = extractNumberProp(page);
      if (prop) {
        countPropName = prop.name;
        currentCount = prop.value;
      }
    } else {
      // 数据库为空，创建一个新页面
      const newPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          // 尝试用常见的中/英文列名
          ...({
            Count: { number: 0 },
          } as any),
        },
      } as any);

      countPageId = (newPage as any).id;
      currentCount = 0;
      countPropName = 'Count';
    }

    if (!countPageId) {
      throw createError({ statusCode: 500, message: '无法获取计数页面' });
    }

    // 计数 +1 并写回
    const newCount = currentCount + 1;

    if (countPropName) {
      await notion.pages.update({
        page_id: countPageId,
        properties: {
          [countPropName]: { number: newCount },
        },
      } as any);
    }

    return { count: newCount };
  } catch (e: any) {
    if (e.statusCode) throw e;
    console.error('访客计数错误:', e.message || e);
    throw createError({ statusCode: 502, message: '访客计数服务异常' });
  }
});
