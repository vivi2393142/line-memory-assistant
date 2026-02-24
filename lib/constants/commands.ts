/**
 * Command aliases and keywords
 * Centralized command configuration for flexibility and maintainability
 */

import { CommandType } from '@/lib/types'

export const COMMAND_ALIASES = {
  // Save current content as memory
  [CommandType.SAVE_NOW]: ['幫我記', '記一下', '記錄', 'save', '儲存'],
  // Save the most recent message
  [CommandType.SAVE_PREVIOUS]: ['存上一則', '存最後一則'],
  // Confirm pending memory
  [CommandType.PENDING_CONFIRM]: ['確認儲存記憶'],
  // Cancel pending memory
  [CommandType.PENDING_CANCEL]: ['取消儲存記憶'],
  // Search memories (prefix commands with content)
  [CommandType.QUERY]: ['查', '找', '搜尋', 'search'],
  // Show help
  [CommandType.HELP]: ['help', '怎麼用', '幫助'],
} as const
