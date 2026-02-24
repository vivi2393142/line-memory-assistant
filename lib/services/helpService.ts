import { ServiceResponse } from '@/lib/types';

export class HelpService {
  /**
   * 處理 help 指令
   */
  static getHelpMessage(): ServiceResponse {
    const helpText = `
🤖 LINE Memory Assistant 使用說明

📝 儲存記憶：
• 幫我記 <內容> - 儲存當下內容
• 存上一則 - 儲存最近一則訊息
• 回覆訊息 + 幫我記 - 儲存被回覆的訊息

✅ 確認操作：
• 確認 - 確認儲存待確認的記憶
• 取消 - 取消待確認的記憶

🔍 查詢記憶：
• 查 <問題> - 搜尋相關記憶

ℹ️ 其他：
• help / 怎麼用 - 顯示此說明

💡 提示：
所有訊息都會自動儲存為原始記錄，隨時可以升級為長期記憶！
    `.trim();

    return {
      success: true,
      message: helpText,
    };
  }
}
