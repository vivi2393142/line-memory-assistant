import { StorageProvider } from '@/lib/providers/storageProvider';
import { LLMProvider } from '@/lib/providers/llmProvider';
import { MemoryProvider } from '@/lib/providers/memoryProvider';
import { ServiceResponse } from '@/lib/types';

export class CaptureService {
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
   * 處理「幫我記 <內容>」
   */
  async saveNow(
    userId: string,
    groupId: string | null,
    content: string,
    rawId: string
  ): Promise<ServiceResponse> {
    try {
      // 1. 生成 content_clean
      const cleanContent = await this.llm.generateCleanContent(content);

      // 2. 建立 PendingAction
      const expiryMinutes = parseInt(process.env.PENDING_EXPIRY_MINUTES || '30');
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

      const pending = await this.storage.createPendingAction({
        user_id: userId,
        group_id: groupId,
        action_type: 'add_memory',
        draft_content: cleanContent,
        raw_id: rawId,
        expires_at: expiresAt.toISOString(),
      });

      // 3. 回覆預覽
      const previewMessage = `📝 確認要儲存這則記憶嗎？\n\n${cleanContent}\n\n回覆「確認」儲存，或「取消」放棄。`;

      return {
        success: true,
        message: previewMessage,
      };
    } catch (error) {
      console.error('SaveNow error:', error);
      return {
        success: false,
        message: '處理失敗，請稍後再試 😢',
      };
    }
  }

  /**
   * 處理「存上一則」
   */
  async savePrevious(
    userId: string,
    groupId: string | null,
    currentRawId: string
  ): Promise<ServiceResponse> {
    try {
      // 1. 取得最近一筆 Raw（排除當前訊息）
      const latestMessage = await this.storage.getLatestRawMessage(userId, groupId);

      if (!latestMessage || latestMessage.id === currentRawId) {
        return {
          success: false,
          message: '找不到上一則訊息 🤔',
        };
      }

      // 2. 使用 saveNow 的流程
      return this.saveNow(userId, groupId, latestMessage.content, latestMessage.id);
    } catch (error) {
      console.error('SavePrevious error:', error);
      return {
        success: false,
        message: '處理失敗，請稍後再試 😢',
      };
    }
  }

  /**
   * 處理「回覆訊息 + 幫我記」
   */
  async saveQuoted(
    userId: string,
    groupId: string | null,
    quotedMessageId: string
  ): Promise<ServiceResponse> {
    try {
      // 1. 從 Raw DB 取得被引用的訊息
      const quotedMessage = await this.storage.getRawMessageByLineId(quotedMessageId);

      if (!quotedMessage) {
        return {
          success: false,
          message: '找不到被引用的訊息 🤔',
        };
      }

      // 2. 使用 saveNow 的流程
      return this.saveNow(userId, groupId, quotedMessage.content, quotedMessage.id);
    } catch (error) {
      console.error('SaveQuoted error:', error);
      return {
        success: false,
        message: '處理失敗，請稍後再試 😢',
      };
    }
  }

  /**
   * 處理「確認」
   */
  async confirmPending(
    userId: string,
    groupId: string | null
  ): Promise<ServiceResponse> {
    try {
      // 1. 取得 pending
      const pending = await this.storage.getPendingAction(userId, groupId);

      if (!pending) {
        return {
          success: false,
          message: '沒有待確認的記憶 🤔',
        };
      }

      // 2. 取得原始訊息（用於 metadata）
      const rawMessage = await this.storage.getRawMessage(pending.raw_id);

      if (!rawMessage) {
        return {
          success: false,
          message: '原始訊息已遺失 😢',
        };
      }

      // 3. 寫入 mem0
      await this.memory.addMemory(userId, pending.draft_content, {
        raw_id: rawMessage.id,
        user_id: userId,
        group_id: groupId,
        created_at: new Date().toISOString(),
      });

      // 4. 刪除 pending
      await this.storage.deletePendingAction(userId, groupId);

      return {
        success: true,
        message: '✅ 記憶已儲存！',
      };
    } catch (error) {
      console.error('ConfirmPending error:', error);
      return {
        success: false,
        message: '儲存失敗，請稍後再試 😢',
      };
    }
  }

  /**
   * 處理「取消」
   */
  async cancelPending(
    userId: string,
    groupId: string | null
  ): Promise<ServiceResponse> {
    try {
      const pending = await this.storage.getPendingAction(userId, groupId);

      if (!pending) {
        return {
          success: false,
          message: '沒有待確認的記憶 🤔',
        };
      }

      await this.storage.deletePendingAction(userId, groupId);

      return {
        success: true,
        message: '❌ 已取消',
      };
    } catch (error) {
      console.error('CancelPending error:', error);
      return {
        success: false,
        message: '取消失敗 😢',
      };
    }
  }
}
