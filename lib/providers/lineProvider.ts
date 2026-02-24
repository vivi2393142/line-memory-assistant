import { Client, ClientConfig } from '@line/bot-sdk';

export class LINEProvider {
  private client: Client;

  constructor() {
    const config: ClientConfig = {
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    };

    if (!config.channelAccessToken || !config.channelSecret) {
      throw new Error('Missing LINE credentials');
    }

    this.client = new Client(config);
  }

  /**
   * 回覆訊息
   */
  async reply(replyToken: string, message: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: message,
    });
  }

  /**
   * 推送訊息（未來功能）
   */
  async push(userId: string, message: string): Promise<void> {
    await this.client.pushMessage(userId, {
      type: 'text',
      text: message,
    });
  }

  /**
   * 驗證簽名
   */
  verifySignature(body: string, signature: string): boolean {
    const channelSecret = process.env.LINE_CHANNEL_SECRET!;
    const crypto = require('crypto');
    
    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(body)
      .digest('base64');

    return hash === signature;
  }
}
