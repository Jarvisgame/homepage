// server/api/page/[id].ts
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const NOTION_ID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const pageId = getRouterParam(event, 'id');
  if (!pageId || !NOTION_ID_RE.test(pageId)) {
    throw createError({ statusCode: 400, message: '参数错误：无效的页面 ID' });
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // 1. 手动获取当前页面的所有底层 Blocks 数据
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    // 2. 数据流拦截与篡改（Data Stream Hijacking）
    const processedBlocks = response.results.map((block: any) => {
      // 找到所有的子页面块
      if (block.type === 'child_page') {
        const childTitle = block.child_page.title;
        const childId = block.id;
        
        // 伪装成一个完整的普通段落（包含 annotations）
        return {
          ...block,
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { 
                  content: `📁 ${childTitle}.txt`, 
                  link: { url: `/p/${childId}` }
                },
                // ✨ 核心修复：补全 notion-to-md 必须读取的样式标注对象
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                plain_text: `📁 ${childTitle}.txt`,
                href: `/p/${childId}`
              }
            ],
            color: 'default'
          }
        };
      }
      // 其他块保持原样返回
      return block;
    });

    // 3. 将我们篡改后的 Blocks 列表喂给 notion-to-md 进行转换
    const mdblocks = await n2m.blocksToMarkdown(processedBlocks);
    const mdString = n2m.toMarkdownString(mdblocks);

    return {
      markdown: mdString.parent || '该目录下没有文件...'
    };
  } catch (e) {
    console.error('获取页面详情错误:', e);
    throw createError({ statusCode: 502, message: '磁盘读取错误（Read Error）' });
  }
});