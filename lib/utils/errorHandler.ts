/**
 * Error Handler Utility
 * Centralized error handling for consistent error messages
 */

interface ServiceError {
  success: false;
  message: string;
}

/**
 * Handle service errors with specific error type detection
 * @param error - The caught error object
 * @param context - Context for logging (e.g., 'SaveNow', 'Query')
 * @param fallbackMessage - Default error message if no specific error type is detected
 * @returns ServiceError object with success: false and appropriate error message
 */
export function handleServiceError(
  error: any,
  context: string,
  fallbackMessage: string,
): ServiceError {
  console.error(`${context} error:`, error);

  // Check for Gemini API quota errors (429)
  if (error?.status === 429 || error?.message?.includes('429')) {
    return {
      success: false,
      message: '⚠️ Gemini API 額度已用完，請稍後再試',
    };
  }

  // Check for Supabase errors
  if (
    error?.message?.includes('supabase') ||
    error?.code?.startsWith('PGRST')
  ) {
    return {
      success: false,
      message: '⚠️ supabase 服務錯誤，請稍後再試',
    };
  }

  // Check for mem0 errors
  if (error?.message?.includes('mem0')) {
    return {
      success: false,
      message: '⚠️ mem0 服務錯誤，請稍後再試',
    };
  }

  // Fallback to generic error message
  return {
    success: false,
    message: fallbackMessage,
  };
}
