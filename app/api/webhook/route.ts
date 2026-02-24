import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent, MessageEvent, TextEventMessage } from '@line/bot-sdk';
import { StorageProvider } from '@/lib/providers/storageProvider';
import { LLMProvider } from '@/lib/providers/llmProvider';
import { MemoryProvider } from '@/lib/providers/memoryProvider';
import { LINEProvider } from '@/lib/providers/lineProvider';
import { CaptureService } from '@/lib/services/captureService';
import { QueryService } from '@/lib/services/queryService';
import { HelpService } from '@/lib/services/helpService';
import { CommandParser } from '@/lib/parsers/commandParser';
import { CommandType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // 1. 驗證簽名
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const lineProvider = new LINEProvider();
    const isValid = lineProvider.verifySignature(body, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // 2. 解析事件
    const data = JSON.parse(body);
    const events: WebhookEvent[] = data.events || [];

    // 3. 初始化 providers 和 services
    const storage = new StorageProvider();
    const llm = new LLMProvider();
    const memory = new MemoryProvider();
    const captureService = new CaptureService(storage, llm, memory);
    const queryService = new QueryService(storage, llm, memory);

    // 4. 處理每個事件
    for (const event of events) {
      // 只處理文字訊息
      if (event.type !== 'message' || event.message.type !== 'text') {
        continue;
      }

      const messageEvent = event as MessageEvent;
      const message = messageEvent.message as TextEventMessage;
      const userId = messageEvent.source.userId!;
      const groupId = messageEvent.source.groupId || null;
      const text = message.text;
      const replyToken = messageEvent.replyToken;

      // 5. 儲存 Raw Message
      const rawMessage = await storage.saveRawMessage({
        user_id: userId,
        group_id: groupId,
        line_message_id: message.id,
        quoted_message_id: message.quoteToken || null,
        content: text,
      });

      // 6. 解析指令
      const hasQuotedMessage = !!message.quoteToken;
      const command = CommandParser.parse(text, hasQuotedMessage);

      // 7. 執行對應的 service
      let response;

      switch (command.type) {
        case CommandType.SAVE_NOW:
          response = await captureService.saveNow(
            userId,
            groupId,
            command.content!,
            rawMessage.id
          );
          break;

        case CommandType.SAVE_PREVIOUS:
          response = await captureService.savePrevious(
            userId,
            groupId,
            rawMessage.id
          );
          break;

        case CommandType.SAVE_QUOTED:
          if (message.quoteToken) {
            response = await captureService.saveQuoted(
              userId,
              groupId,
              message.quoteToken
            );
          }
          break;

        case CommandType.PENDING_CONFIRM:
          response = await captureService.confirmPending(userId, groupId);
          break;

        case CommandType.PENDING_CANCEL:
          response = await captureService.cancelPending(userId, groupId);
          break;

        case CommandType.QUERY:
          response = await queryService.query(userId, command.content!);
          break;

        case CommandType.HELP:
          response = HelpService.getHelpMessage();
          break;

        case CommandType.NONE:
        default:
          // 不回覆，僅存 Raw
          continue;
      }

      // 8. 回覆訊息
      if (response && response.message) {
        await lineProvider.reply(replyToken, response.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'LINE Memory Assistant',
    version: '1.0.0'
  });
}
