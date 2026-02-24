import { StorageProvider } from '@/lib/providers/storageProvider';
import { LLMProvider } from '@/lib/providers/llmProvider';
import { MemoryProvider } from '@/lib/providers/memoryProvider';
import { ServiceResponse } from '@/lib/types';

export class QueryService {
  private storage: StorageProvider;
  private llm: LLMProvider;
  private memory: MemoryProvider;

  constructor(
    storage: StorageProvider,
    llm: LLMProvider,
    memory: MemoryProvider
  ) {
    this.storage = storage;
    this.llm = llm;
    this.memory = memory;
  }

  /**
   * 處理「查 <問題>」
   */
  async query(
    userId: string,
    query: string
  ): Promise<ServiceResponse> {
    try {
      // 1. mem0 search
      const searchResults = await this.memory.searchMemory(userId, query, 5);

      if (searchResults.length === 0) {
        return {
          success: true,
          message: '找不到相關記憶 🤔',
        };
      }

      // 2. LLM 組合回答
      const memories = searchResults.map(r => r.memory);
      const answer = await this.llm.generateAnswer(query, memories);

      // 3. 取得原文來源
      const sources = await Promise.all(
        memories.map(async (m, index) => {
          const rawId = m.metadata.raw_id;
          const rawMessage = await this.storage.getRawMessage(rawId);
          
          if (!rawMessage) return null;
          
          return {
            index: index + 1,
            content: rawMessage.content,
            date: new Date(rawMessage.created_at).toLocaleDateString('zh-TW'),
          };
        })
      );

      const validSources = sources.filter(s => s !== null);

      // 4. 組合回覆
      let response = `${answer}\n\n`;
      
      if (validSources.length > 0) {
        response += '📎 來源：\n';
        validSources.forEach(source => {
          response += `[${source!.index}] ${source!.content.substring(0, 50)}${
            source!.content.length > 50 ? '...' : ''
          } (${source!.date})\n`;
        });
      }

      return {
        success: true,
        message: response.trim(),
      };
    } catch (error) {
      console.error('Query error:', error);
      return {
        success: false,
        message: '查詢失敗，請稍後再試 😢',
      };
    }
  }
}
