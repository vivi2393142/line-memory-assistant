import { GoogleGenerativeAI } from '@google/generative-ai';
import { Memory } from '@/lib/types';

export class LLMProvider {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY!;
    
    if (!apiKey) {
      throw new Error('Missing Gemini API key');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * 生成乾淨的記憶內容
   * 移除無關字詞、整理格式，保留核心資訊
   */
  async generateCleanContent(rawText: string): Promise<string> {
    const prompt = `
你是一個記憶整理助手。請將以下文字整理成簡潔、清晰的記憶內容。

規則：
1. 移除無關的口語詞彙（例如：嗯、啊、那個）
2. 保留核心資訊和關鍵字
3. 如果是網址，保持原樣
4. 如果是待辦事項，保持清單格式
5. 不要添加不存在的資訊
6. 保持原文的語意和意圖
7. 輸出繁體中文（如果原文是中文）

原文：
${rawText}

整理後的內容：
`.trim();

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  }

  /**
   * 根據查詢和記憶生成回答
   */
  async generateAnswer(query: string, memories: Memory[]): Promise<string> {
    if (memories.length === 0) {
      return '找不到相關的記憶 🤔';
    }

    const memoryContext = memories
      .map((m, i) => `[${i + 1}] ${m.content}`)
      .join('\n\n');

    const prompt = `
你是一個記憶查詢助手。根據使用者的問題和相關記憶，提供簡潔的回答。

規則：
1. 根據記憶內容回答問題
2. 保持簡潔但完整
3. 如果記憶中有多個相關項目，列出來
4. 使用繁體中文回答
5. 不要編造記憶中沒有的內容
6. 可以在回答中註明來源編號 [1], [2] 等

問題：
${query}

相關記憶：
${memoryContext}

回答：
`.trim();

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  }
}
