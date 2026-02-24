import { MemoryClient, type Message } from 'mem0ai'
import { MemoryMetadata, SearchResult } from '@/lib/types'
import { validateMem0Response } from '@/lib/utils/errorValidator'

export class MemoryProvider {
  private client: MemoryClient

  constructor() {
    const apiKey = process.env.MEM0_API_KEY!
    if (!apiKey) throw new Error('Missing mem0 API key')

    this.client = new MemoryClient({ apiKey })
  }

  /**
   * Add memory
   * According to mem0 API, accepts messages array with role and content
   * Throws error if API request fails
   */
  async addMemory(
    userId: string,
    content: string,
    metadata: MemoryMetadata,
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: 'user',
        content: content,
      },
    ]

    const result = await this.client.add(messages, {
      user_id: userId,
      metadata: metadata,
      version: 'v2',
    })

    // Validate response
    const validation = validateMem0Response(result)
    if (validation.isError) {
      throw new Error(`Failed to add memory: ${validation.message}`)
    }

    // mem0 add returns array with format: [{ id: string, data: { memory: string }, event: string }]
    if (result.length > 0) return result[0].id

    throw new Error('Failed to add memory: invalid response format')
  }

  /**
   * Search memory
   * Returns array of memories matching the query
   * Throws error if API request fails
   */
  async searchMemory(
    userId: string,
    query: string,
    limit: number = 5,
  ): Promise<SearchResult[]> {
    const results = await this.client.search(query, {
      user_id: userId,
      limit: limit,
    })

    // Validate response
    const validation = validateMem0Response(results)
    if (validation.isError) {
      throw new Error(`Failed to search memory: ${validation.message}`)
    }

    // mem0 search returns array directly: [{ id, memory, metadata, score }]
    return results.map((item: any) => ({
      memory: {
        id: item.id,
        content: item.memory,
        metadata: item.metadata || {},
      },
      score: item.score || 0,
    }))
  }

  /**
   * Delete memory (future feature)
   */
  // async deleteMemory(memoryId: string): Promise<void> {
  //   await this.client.delete(memoryId)
  // }

  /**
   * Get all memories (future feature)
   * Throws error if API request fails
   */
  // async getAllMemories(userId: string): Promise<Memory[]> {
  //   const results = await this.client.getAll({ user_id: userId })

  //   // Validate response
  //   const validation = validateMem0Response(results)
  //   if (validation.isError) {
  //     throw new Error(`Failed to get memories: ${validation.message}`)
  //   }

  //   // mem0 getAll returns array directly: [{ id, memory, metadata }]
  //   return results.map((item: any) => ({
  //     id: item.id,
  //     content: item.memory,
  //     metadata: item.metadata || {},
  //   }))
  // }
}
