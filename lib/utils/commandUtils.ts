import { COMMAND_ALIASES } from '@/lib/constants/commands'
import { CommandType } from '@/lib/types'

/**
 * Get command type from text (case-insensitive)
 * For exact match commands only
 */
export function getExactMatchCommand(
  text: string,
): keyof typeof COMMAND_ALIASES | null {
  const trimmed = text.trim()

  for (const [command, aliases] of Object.entries(COMMAND_ALIASES)) {
    // For exact match commands (CONFIRM, CANCEL, HELP), check both exact and lowercase
    if (command === CommandType.QUERY || command === CommandType.SAVE_NOW) {
      continue // Skip prefix commands
    }

    for (const alias of aliases) {
      if (trimmed === alias || trimmed === alias.toLowerCase()) {
        return command as keyof typeof COMMAND_ALIASES
      }
    }
  }

  return null
}

/**
 * Check if text starts with any of the command aliases (case-insensitive)
 */
export function startsWithCommand(
  text: string,
  command: keyof typeof COMMAND_ALIASES,
): boolean {
  const trimmed = text.trim().toLowerCase()

  for (const alias of COMMAND_ALIASES[command]) {
    if (trimmed.startsWith(alias.toLowerCase())) {
      return true
    }
  }

  return false
}

/**
 * Extract content after the command
 */
export function extractCommandContent(
  text: string,
  command: keyof typeof COMMAND_ALIASES,
): string {
  const trimmed = text.trim()

  for (const alias of COMMAND_ALIASES[command]) {
    if (trimmed.toLowerCase().startsWith(alias.toLowerCase())) {
      return trimmed.substring(alias.length).trim()
    }
  }

  return ''
}
