import { StorageProvider } from '@/lib/providers/storageProvider';
import { LLMProvider } from '@/lib/providers/llmProvider';
import { MemoryProvider } from '@/lib/providers/memoryProvider';
import { ServiceResponse } from '@/lib/types';
import { CommandType } from '@/lib/types';
import { COMMAND_ALIASES } from '@/lib/constants/commands';
import { CAPTURE_MESSAGES } from '@/lib/constants/captureMessages';
import { handleServiceError } from '@/lib/utils/errorHandler';
import type { Message } from '@line/bot-sdk';

export class CaptureService {
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
   * Handle "幫我記 <content>"
   */
  async saveNow(
    userId: string,
    groupId: string | null,
    content: string,
    rawId: string,
  ): Promise<ServiceResponse> {
    try {
      // 1. Generate content_clean
      const cleanContent = await this.llm.generateCleanContent(content);

      // 2. Create PendingAction
      const expiryMinutes = parseInt(
        process.env.PENDING_EXPIRY_MINUTES || '30',
      );
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

      await this.storage.createPendingAction({
        user_id: userId,
        group_id: groupId,
        action_type: 'add_memory',
        draft_content: cleanContent,
        raw_id: rawId,
        expires_at: expiresAt.toISOString(),
      });

      // 3. Get confirm and cancel aliases from constants
      const confirmAlias = COMMAND_ALIASES[CommandType.PENDING_CONFIRM][0];
      const cancelAlias = COMMAND_ALIASES[CommandType.PENDING_CANCEL][0];

      // 4. Build message with quick reply buttons
      const messageWithQuickReply: Message = {
        type: 'text',
        text: `${CAPTURE_MESSAGES.SAVE_NOW_CONFIRM_TEXT}\n\n${cleanContent}`,
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'message',
                label: '✅ 確認',
                text: confirmAlias,
              },
            },
            {
              type: 'action',
              action: {
                type: 'message',
                label: '❌ 取消',
                text: cancelAlias,
              },
            },
          ],
        },
      };

      return {
        success: true,
        message: messageWithQuickReply,
      };
    } catch (error: any) {
      return handleServiceError(
        error,
        'SaveNow',
        CAPTURE_MESSAGES.SAVE_NOW_ERROR,
      );
    }
  }

  /**
   * Handle "存上一則"
   */
  async savePrevious(
    userId: string,
    groupId: string | null,
    currentRawId: string,
  ): Promise<ServiceResponse> {
    try {
      // 1. Get latest Raw message (excluding current message)
      const latestMessage = await this.storage.getLatestRawMessage(
        userId,
        groupId,
      );

      if (!latestMessage || latestMessage.id === currentRawId) {
        return {
          success: false,
          message: CAPTURE_MESSAGES.SAVE_PREVIOUS_NOT_FOUND,
        };
      }

      // 2. 使用 saveNow 的流程
      return this.saveNow(
        userId,
        groupId,
        latestMessage.content,
        latestMessage.id,
      );
    } catch (error) {
      console.error('SavePrevious error:', error);
      return {
        success: false,
        message: CAPTURE_MESSAGES.SAVE_PREVIOUS_ERROR,
      };
    }
  }

  /**
   * Handle "Reply to message + 幫我記"
   */
  async saveQuoted(
    userId: string,
    groupId: string | null,
    quotedMessageId: string,
  ): Promise<ServiceResponse> {
    try {
      // 1. Get quoted message from Raw DB
      const quotedMessage =
        await this.storage.getRawMessageByLineId(quotedMessageId);

      if (!quotedMessage) {
        return {
          success: false,
          message: CAPTURE_MESSAGES.SAVE_QUOTED_NOT_FOUND,
        };
      }

      // 2. 使用 saveNow 的流程
      return this.saveNow(
        userId,
        groupId,
        quotedMessage.content,
        quotedMessage.id,
      );
    } catch (error) {
      console.error('SaveQuoted error:', error);
      return {
        success: false,
        message: CAPTURE_MESSAGES.SAVE_QUOTED_ERROR,
      };
    }
  }

  /**
   * Handle "確認"
   */
  async confirmPending(
    userId: string,
    groupId: string | null,
  ): Promise<ServiceResponse> {
    try {
      // 1. Get pending
      const pending = await this.storage.getPendingAction(userId, groupId);

      if (!pending) {
        return {
          success: false,
          message: CAPTURE_MESSAGES.CONFIRM_PENDING_NOT_FOUND,
        };
      }

      // 2. Get raw message (for metadata)
      const rawMessage = await this.storage.getRawMessage(pending.raw_id);

      if (!rawMessage) {
        return {
          success: false,
          message: CAPTURE_MESSAGES.CONFIRM_PENDING_RAW_NOT_FOUND,
        };
      }

      // 3. Write to mem0
      await this.memory.addMemory(userId, pending.draft_content, {
        raw_id: rawMessage.id,
        user_id: userId,
        group_id: groupId,
        created_at: new Date().toISOString(),
      });

      // 4. Delete pending
      await this.storage.deletePendingAction(userId, groupId);

      return {
        success: true,
        message: CAPTURE_MESSAGES.CONFIRM_PENDING_SUCCESS,
      };
    } catch (error) {
      console.error('ConfirmPending error:', error);
      return {
        success: false,
        message: CAPTURE_MESSAGES.CONFIRM_PENDING_ERROR,
      };
    }
  }

  /**
   * Handle "取消"
   */
  async cancelPending(
    userId: string,
    groupId: string | null,
  ): Promise<ServiceResponse> {
    try {
      const pending = await this.storage.getPendingAction(userId, groupId);

      if (!pending) {
        return {
          success: false,
          message: CAPTURE_MESSAGES.CANCEL_PENDING_NOT_FOUND,
        };
      }

      await this.storage.deletePendingAction(userId, groupId);

      return {
        success: true,
        message: CAPTURE_MESSAGES.CANCEL_PENDING_SUCCESS,
      };
    } catch (error) {
      console.error('CancelPending error:', error);
      return {
        success: false,
        message: CAPTURE_MESSAGES.CANCEL_PENDING_ERROR,
      };
    }
  }
}
