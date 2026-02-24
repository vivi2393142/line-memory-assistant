import { CommandType, ParsedCommand } from '@/lib/types'
import {
  getExactMatchCommand,
  startsWithCommand,
  extractCommandContent,
} from '@/lib/utils/commandUtils'

/**
 * CommandParser
 * Rule-based command parsing (no LLM)
 * Parsing priority:
 * 1. SAVE_PREVIOUS
 * 2. PENDING_CONFIRM
 * 3. PENDING_CANCEL
 * 4. SAVE_NOW
 * 5. QUERY
 * 6. HELP
 * 7. NONE (others)
 */
export class CommandParser {
  static parse(text: string, hasQuotedMessage: boolean = false): ParsedCommand {
    const trimmedText = text.trim()

    // Try exact match commands first
    const exactCommand = getExactMatchCommand(trimmedText)

    // 1. SAVE_PREVIOUS
    if (exactCommand === CommandType.SAVE_PREVIOUS) {
      return { type: CommandType.SAVE_PREVIOUS }
    }

    // 2. PENDING_CONFIRM
    if (exactCommand === CommandType.PENDING_CONFIRM) {
      return { type: CommandType.PENDING_CONFIRM }
    }

    // 3. PENDING_CANCEL
    if (exactCommand === CommandType.PENDING_CANCEL) {
      return { type: CommandType.PENDING_CANCEL }
    }

    // 4. SAVE_NOW ("幫我記 <content>")
    if (startsWithCommand(trimmedText, CommandType.SAVE_NOW)) {
      const content = extractCommandContent(trimmedText, CommandType.SAVE_NOW)

      // If there's a quoted message, treat as SAVE_QUOTED
      if (hasQuotedMessage) {
        return { type: CommandType.SAVE_QUOTED }
      }

      // If no content, treat as invalid command
      if (!content) {
        return { type: CommandType.NONE }
      }

      return { type: CommandType.SAVE_NOW, content }
    }

    // 5. QUERY ("查 <question>")
    if (startsWithCommand(trimmedText, CommandType.QUERY)) {
      const query = extractCommandContent(trimmedText, CommandType.QUERY)

      if (!query) {
        return { type: CommandType.NONE }
      }

      return { type: CommandType.QUERY, content: query }
    }

    // 6. HELP
    if (exactCommand === CommandType.HELP) {
      return { type: CommandType.HELP }
    }

    // 7. Others - save as raw, no reply
    return { type: CommandType.NONE }
  }
}
