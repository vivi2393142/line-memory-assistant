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
    // 1. Verify signature
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    console.log('[Webhook] Incoming request', {
      hasSignature: !!signature,
    });

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const lineProvider = new LINEProvider();
    const isValid = lineProvider.verifySignature(body, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // 2. Parse events
    const data = JSON.parse(body);
    const events: WebhookEvent[] = data.events || [];

    console.log('[Webhook] Parsed events', {
      eventCount: events.length,
      eventTypes: events.map((e) => e.type),
      eventSummaries: events
        .filter((e): e is MessageEvent => e.type === 'message')
        .map((e) => ({
          type: e.type,
          sourceUserId: e.source?.userId,
          sourceType: e.source?.type,
          timestamp: e.timestamp,
          messageId: (e.message as TextEventMessage)?.id,
          messageType: (e.message as TextEventMessage)?.type,
          messageText: (e.message as TextEventMessage)?.text,
        })),
    });

    // 3. Initialize providers and services
    const storage = new StorageProvider();
    const llm = new LLMProvider();
    const memory = new MemoryProvider();
    const captureService = new CaptureService(storage, llm, memory);
    const queryService = new QueryService(storage, llm, memory);

    // 4. Process each event
    for (const event of events) {
      // Only handle text messages
      if (event.type !== 'message' || event.message.type !== 'text') {
        continue;
      }

      const messageEvent = event as MessageEvent;
      const message = messageEvent.message as TextEventMessage;

      // Only handle message in group chats
      if (messageEvent.source.type !== 'group') continue;

      // Only handle message with valid userId
      const userId = messageEvent.source.userId;
      if (!userId) continue;

      const groupId = messageEvent.source.groupId;
      const text = message.text;
      const replyToken = messageEvent.replyToken;

      // 5. Save Raw Message
      const rawMessage = await storage.saveRawMessage({
        user_id: userId,
        group_id: groupId,
        line_message_id: message.id,
        quoted_message_id: message.quoteToken || null,
        content: text,
      });

      // 6. Parse command
      // Use quotedMessageId (not quoteToken) to detect actual quoted messages
      const hasQuotedMessage = !!message.quotedMessageId;
      const command = CommandParser.parse(text, hasQuotedMessage);

      // 7. Execute corresponding service
      let response;

      switch (command.type) {
        case CommandType.SAVE_NOW:
          if (!command.content) {
            response = {
              success: false,
              message: '請提供需要記憶的內容～', // TODO: wording should be saved to constants
            };
          } else {
            response = await captureService.saveNow(
              userId,
              groupId,
              command.content,
              rawMessage.id,
            );
          }
          break;

        case CommandType.SAVE_PREVIOUS:
          response = await captureService.savePrevious(
            userId,
            groupId,
            rawMessage.id,
          );
          break;

        case CommandType.SAVE_QUOTED:
          if (message.quotedMessageId) {
            response = await captureService.saveQuoted(
              userId,
              groupId,
              message.quotedMessageId,
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
          // No reply, only save to Raw
          continue;
      }

      // 8. Reply message
      if (response && response.message) {
        await lineProvider.reply(replyToken, response.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// GET method for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'LINE Memory Assistant',
    version: '1.0.0',
  });
}
