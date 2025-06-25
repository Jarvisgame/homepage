import { defineEventHandler, readBody } from "h3";
import { GoogleGenAI } from "@google/genai";

const config = useRuntimeConfig()

const ai = new GoogleGenAI({
  apiKey: config.googleApiKey
})


export default defineEventHandler(async (event) => {
  try {
    // 读取请求体中的消息
    const { messages } = await readBody(event)

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid or missing messages in request body!')
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: messages,
    })

    const candidate = response.candidates![0]
    const generatedText = candidate.content!.parts![0].text;

    return {
      id: response.responseId || `id-${Date.now()}`, // 确保有默认值
      createdAt: response.createTime || new Date().toISOString(),
      content: generatedText,
      role: 'assistant',
      parts: [{ type: 'text', text: generatedText }]
    }
  }  catch (error) {
    // 错误处理
    console.error('Error in API handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
})