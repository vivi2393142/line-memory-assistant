import { ServiceResponse, CommandType } from '@/lib/types'
import { COMMAND_ALIASES } from '@/lib/constants/commands'

export class HelpService {
  /**
   * Generate help message with all command aliases
   */
  static getHelpMessage(): ServiceResponse {
    const helpText = `
🤖 LINE 記憶助手 - 指令說明

📝 保存記憶：
• ${COMMAND_ALIASES[CommandType.SAVE_NOW].join(' / ')} <內容>  - 立即保存
• ${COMMAND_ALIASES[CommandType.SAVE_PREVIOUS].join(' / ')}  - 保存最近的訊息
• <回覆特定訊息> + 幫我記  - 保存被引用的訊息

✅ 確認或取消：
• ${COMMAND_ALIASES[CommandType.PENDING_CONFIRM].join(' / ')}  - 確認保存待審核的記憶
• ${COMMAND_ALIASES[CommandType.PENDING_CANCEL].join(' / ')}  - 取消保存待審核的記憶

🔍 查詢記憶：
• ${COMMAND_ALIASES[CommandType.QUERY].join(' / ')} <問題>  - 搜尋已保存的記憶

ℹ️ 其他：
• ${COMMAND_ALIASES[CommandType.HELP].join(' / ')}  - 顯示此說明
    `.trim()

    return {
      success: true,
      message: helpText,
    }
  }
}
