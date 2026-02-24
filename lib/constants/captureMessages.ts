/**
 * User-facing messages for CaptureService
 */

export const CAPTURE_MESSAGES = {
  // Save now (saveNow method)
  SAVE_NOW_CONFIRM_TEXT: '確定要儲存到記憶嗎？',
  SAVE_NOW_ERROR: '儲存失敗，請重試 😢',

  // Save previous (savePrevious method)
  SAVE_PREVIOUS_NOT_FOUND: '找不到上一則訊息 🤔',
  SAVE_PREVIOUS_ERROR: '儲存失敗，請重試 😢',

  // Save quoted (saveQuoted method)
  SAVE_QUOTED_NOT_FOUND: '找不到被引用的訊息 🤔',
  SAVE_QUOTED_ERROR: '儲存失敗，請重試 😢',

  // Confirm pending (confirmPending method)
  CONFIRM_PENDING_NOT_FOUND: '沒有待處理的記憶 🤔',
  CONFIRM_PENDING_RAW_NOT_FOUND: '原始訊息遺失 😢',
  CONFIRM_PENDING_SUCCESS: '✅ 已儲存記憶!',
  CONFIRM_PENDING_ERROR: '處理失敗，請重試 😢',

  // Cancel pending (cancelPending method)
  CANCEL_PENDING_NOT_FOUND: '沒有待處理的記憶 🤔',
  CANCEL_PENDING_SUCCESS: '❌ 已取消',
  CANCEL_PENDING_ERROR: '取消失敗，請重試 😢',
} as const
