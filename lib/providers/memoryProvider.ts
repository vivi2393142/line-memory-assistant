import { MemoryClient } from 'mem0ai';
import { Memory, MemoryMetadata, SearchResult } from '@/lib/types';

export class MemoryProvider {
  private client: MemoryClient;

  constructor() {
    const apiKey = process.env.MEM0_API_KEY!;
    
    if (!apiKey) {
      throw new Error('Missing mem0 API key');
    }

    this.client = new MemoryClient({ apiKey });
  }

  /**
   * 添加記憶
   */
  async addMemory(
    userId: string,
    content: string,
    metadata: MemoryMetadata
  ): Promise<string> {
    const result = await this.client.add(content, {
      user_id: userId,
      metadata: metadata,
    });

    // mem0 返回的結果包含記憶的 ID
    return result.id || result.results?.[0]?.id || '';
  }

  /**
   * 搜尋記憶
   */
  async searchMemory(
    userId: string,
    query: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    const results = await this.client.search(query, {
      user_id: userId,
      limit: limit,
    });

    // 將 mem0 的結果轉換為我們的格式
    return (results.results || []).map((item: any) => ({
      memory: {
        id: item.id,
        content: item.memory || item.text,
        metadata: item.metadata || {},
      },
      score: item.score || 0,
    }));
  }

  /**
   * 刪除記憶（未來功能）
   */
  async deleteMemory(memoryId: string): Promise<void> {
    await this.client.delete(memoryId);
  }

  /**
   * 取得所有記憶（未來功能）
   */
  async getAllMemories(userId: string): Promise<Memory[]> {
    const results = await this.client.getAll({ user_id: userId });
    
    return (results.results || []).map((item: any) => ({
      id: item.id,
      content: item.memory || item.text,
      metadata: item.metadata || {},
    }));
  }
}
