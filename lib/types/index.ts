// ============ Database Types ============

export interface RawMessage {
  id: string;
  user_id: string;
  group_id: string | null;
  line_message_id: string;
  quoted_message_id: string | null;
  content: string;
  created_at: string;
}

export interface PendingAction {
  id: string;
  user_id: string;
  group_id: string | null;
  action_type: 'add_memory';
  draft_content: string;
  raw_id: string;
  expires_at: string;
  created_at: string;
}

// ============ Command Types ============

export enum CommandType {
  SAVE_NOW = 'SAVE_NOW',           // 幫我記 <內容>
  SAVE_PREVIOUS = 'SAVE_PREVIOUS', // 存上一則
  SAVE_QUOTED = 'SAVE_QUOTED',     // 回覆訊息 + 幫我記
  PENDING_CONFIRM = 'PENDING_CONFIRM', // 確認
  PENDING_CANCEL = 'PENDING_CANCEL',   // 取消
  QUERY = 'QUERY',                     // 查 <問題>
  HELP = 'HELP',                       // help
  NONE = 'NONE',                       // 其他（僅存 Raw）
}

export interface ParsedCommand {
  type: CommandType;
  content?: string; // For SAVE_NOW and QUERY
}

// ============ Memory Types ============

export interface MemoryMetadata {
  raw_id: string;
  user_id: string;
  group_id: string | null;
  created_at: string;
}

export interface Memory {
  id: string;
  content: string;
  metadata: MemoryMetadata;
}

export interface SearchResult {
  memory: Memory;
  score: number;
}

// ============ LINE Types ============

export interface LINEMessageEvent {
  type: 'message';
  replyToken: string;
  source: {
    userId: string;
    groupId?: string;
    type: 'user' | 'group' | 'room';
  };
  timestamp: number;
  message: {
    id: string;
    type: 'text';
    text: string;
    quoteToken?: string;
  };
}

// ============ Service Response Types ============

export interface ServiceResponse {
  success: boolean;
  message?: string;
  data?: any;
}
