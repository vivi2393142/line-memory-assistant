import { CommandType, ParsedCommand } from '@/lib/types';

/**
 * CommandParser
 * 純規則判斷，不使用 LLM
 * 判斷優先順序：
 * 1. equals("存上一則")
 * 2. equals("確認")
 * 3. equals("取消")
 * 4. startsWith("幫我記")
 * 5. startsWith("查 ")
 * 6. equals("help")
 * 7. 其他
 */
export class CommandParser {
  static parse(text: string, hasQuotedMessage: boolean = false): ParsedCommand {
    const trimmedText = text.trim();

    // 1. 存上一則
    if (trimmedText === '存上一則') {
      return { type: CommandType.SAVE_PREVIOUS };
    }

    // 2. 確認
    if (trimmedText === '確認') {
      return { type: CommandType.PENDING_CONFIRM };
    }

    // 3. 取消
    if (trimmedText === '取消') {
      return { type: CommandType.PENDING_CANCEL };
    }

    // 4. 幫我記 <內容>
    if (trimmedText.startsWith('幫我記')) {
      const content = trimmedText.substring(3).trim();
      
      // 如果有引用訊息，視為 SAVE_QUOTED
      if (hasQuotedMessage) {
        return { type: CommandType.SAVE_QUOTED };
      }
      
      // 如果沒有內容，視為無效指令
      if (!content) {
        return { type: CommandType.NONE };
      }
      
      return { type: CommandType.SAVE_NOW, content };
    }

    // 5. 查 <問題>
    if (trimmedText.startsWith('查 ')) {
      const query = trimmedText.substring(2).trim();
      
      if (!query) {
        return { type: CommandType.NONE };
      }
      
      return { type: CommandType.QUERY, content: query };
    }

    // 6. help
    if (trimmedText === 'help' || trimmedText === '怎麼用') {
      return { type: CommandType.HELP };
    }

    // 7. 其他 - 僅存 Raw
    return { type: CommandType.NONE };
  }
}
