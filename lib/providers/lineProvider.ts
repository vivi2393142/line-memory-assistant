import { Client, ClientConfig, type Message } from '@line/bot-sdk'

export class LINEProvider {
  private client: Client

  constructor() {
    const config: ClientConfig = {
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    }

    if (!config.channelAccessToken || !config.channelSecret) {
      throw new Error('Missing LINE credentials')
    }

    this.client = new Client(config)
  }

  /**
   * Reply message
   * Accepts text string or Message object(s)
   */
  async reply(
    replyToken: string,
    message: string | Message | Message[],
  ): Promise<void> {
    if (typeof message === 'string') {
      // Convert string to simple text message
      await this.client.replyMessage(replyToken, {
        type: 'text',
        text: message,
      })
    } else {
      // Send as-is if it's a single message or array of messages
      await this.client.replyMessage(replyToken, message)
    }
  }

  /**
   * Push message (future feature)
   */
  async push(userId: string, message: string): Promise<void> {
    await this.client.pushMessage(userId, {
      type: 'text',
      text: message,
    })
  }

  /**
   * Verify signature
   */
  verifySignature(body: string, signature: string): boolean {
    const channelSecret = process.env.LINE_CHANNEL_SECRET!
    const crypto = require('crypto')

    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(body)
      .digest('base64')

    return hash === signature
  }
}
