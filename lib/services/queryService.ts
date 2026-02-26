import { StorageProvider } from '@/lib/providers/storageProvider';
import { LLMProvider } from '@/lib/providers/llmProvider';
import { MemoryProvider } from '@/lib/providers/memoryProvider';
import { ServiceResponse } from '@/lib/types';
import { QUERY_MESSAGES } from '@/lib/constants/queryMessages';
import { handleServiceError } from '@/lib/utils/errorHandler';

export class QueryService {
  private storage: StorageProvider;
  private llm: LLMProvider;
  private memory: MemoryProvider;

  constructor(
    storage: StorageProvider,
    llm: LLMProvider,
    memory: MemoryProvider,
  ) {
    this.storage = storage;
    this.llm = llm;
    this.memory = memory;
  }

  /**
   * Handle "查 <question>"
   */
  async query(userId: string, query: string): Promise<ServiceResponse> {
    try {
      // 1. mem0 search
      const searchResults = await this.memory.searchMemory(userId, query, 5);

      if (searchResults.length === 0) {
        return {
          success: true,
          message: QUERY_MESSAGES.NO_MEMORIES_FOUND,
        };
      }

      // 2. LLM generates answer
      const memories = searchResults.map((r) => r.memory);
      const answer = await this.llm.generateAnswer(query, memories);

      // 3. Get original message sources
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
        }),
      );

      const validSources = sources.filter((s) => s !== null);

      // 4. Compose response
      let response = `${answer}\n\n`;

      if (validSources.length > 0) {
        response += `${QUERY_MESSAGES.SOURCE_LABEL}\n`;
        validSources.forEach((source) => {
          response += `[${source!.index}] ${source!.content.substring(0, 50)}${
            source!.content.length > 50 ? '...' : ''
          } (${source!.date})\n`;
        });
      }

      return {
        success: true,
        message: response.trim(),
      };
    } catch (error: any) {
      return handleServiceError(error, 'Query', QUERY_MESSAGES.QUERY_ERROR);
    }
  }
}
