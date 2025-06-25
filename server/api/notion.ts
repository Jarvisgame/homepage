import { Client } from '@notionhq/client';

export default defineEventHandler(async (event): Promise<any> => {

  const pageId = process.env.NOTION_DATABASE_ID
  const apiKey = process.env.NOTION_API_KEY
  //初始化nition客户端
  const notion = new Client({ auth: apiKey })

  try {
    // const listUsersResponse = await notion.users.list({})
    const listUsersResponse = await notion.pages.retrieve({
      page_id: "1da545eac542803a9332d6f6c1032de8",
      // auth: apiKey
      // filter: {
      //   property: "Landmark",
      //   rich_text: {
      //     contains: "Bridge",
      //   },
      // },
    })

    return {
      status: 200,
      data: listUsersResponse,
    };
  } catch (error: any) {
    console.error("wtf" + error);
  }
});