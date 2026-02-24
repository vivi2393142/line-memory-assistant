/**
 * Error validator for mem0 API responses
 * Checks if response is an error and extracts error details
 */

export interface Mem0Error {
  error: string
  details?: {
    message: string
  }
}

export interface ValidationResult {
  isError: boolean
  error?: Mem0Error
  message?: string
}

/**
 * Check if response is a mem0 error
 */
export function isMem0Error(response: any): response is Mem0Error {
  return (
    response &&
    typeof response === 'object' &&
    'error' in response &&
    !Array.isArray(response)
  )
}

/**
 * Validate mem0 response and extract error if any
 */
export function validateMem0Response(response: any): ValidationResult {
  // Check for error response format
  if (isMem0Error(response)) {
    return {
      isError: true,
      error: response,
      message: response.details?.message || response.error,
    }
  }

  // Valid response (array or object without error)
  return {
    isError: false,
  }
}

/**
 * Format error message for user
 */
export function formatErrorMessage(error: Mem0Error): string {
  if (error.details?.message) {
    return error.details.message
  }
  return error.error || 'An error occurred while processing your request'
}
