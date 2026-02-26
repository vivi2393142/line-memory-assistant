import { ServiceResponse, CommandType } from '@/lib/types';
import { COMMAND_ALIASES } from '@/lib/constants/commands';

export class HelpService {
  /**
   * Generate help message with all command aliases
   */
  static getHelpMessage(): ServiceResponse {
    const helpText = `
🤖 LINE 記憶助手 - 指令說明

📝 保存記憶：
• 馬上存：[${COMMAND_ALIASES[CommandType.SAVE_NOW].join(' / ')}] <內容>
• 存上一則：[${COMMAND_ALIASES[CommandType.SAVE_PREVIOUS].join(' / ')}]
• 保存之前的：<回覆特定訊息> + [任一儲存關鍵字]

🔍 查詢記憶：
• 查詢：[${COMMAND_ALIASES[CommandType.QUERY].join(' / ')}] <問題>

ℹ️ 其他：
• 顯示此說明：[${COMMAND_ALIASES[CommandType.HELP].join(' / ')}]
    `.trim();

    return {
      success: true,
      message: helpText,
    };
  }
}
