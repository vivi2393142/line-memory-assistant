# QA Test Plan - LINE Memory Assistant

> 測試日期：\***\*\_\_\*\*** 版本/部署：\***\*\_\_\*\***

## 1. 目的

確保 LINE 群組機器人：

- 正常接收 webhook
- 正確寫入 Supabase
- 能進行記憶保存與查詢
- 僅對指定指令回應（低干擾）

## 2. 測試前置條件

- Vercel 部署成功（Status: Ready）
- Webhook URL 已設定：`https://line-memory-assistant.vercel.app/api/webhook`
- LINE Console：Webhook Enabled = ON
- LINE Console：Allow bot to join group chats = ON
- Vercel 環境變數已設定：
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_CHANNEL_SECRET`
  - `GEMINI_API_KEY`
  - `SUPABASE_ENDPOINT`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `MEM0_API_KEY`
  - `PENDING_EXPIRY_MINUTES`（可選）

## 3. 測試記錄（執行結果）

> 請在「結果」欄填寫：Pass / Fail / Blocked，並可補充說明。

| ID  | 測試項目         | 步驟                                                      | 預期結果                               | 結果 | 備註 |
| --- | ---------------- | --------------------------------------------------------- | -------------------------------------- | ---- | ---- |
| T01 | Webhook 健康檢查 | 瀏覽 https://line-memory-assistant.vercel.app/api/webhook | 回傳 JSON `status: ok`                 |      |      |
| T02 | 群組訊息觸發     | 群組內傳送任意訊息                                        | Vercel Logs 出現 POST /api/webhook 200 |      |      |
| T03 | Raw 記錄寫入     | 群組傳送一般文字                                          | Supabase `messages` 表新增紀錄         |      |      |
| T04 | SAVE_NOW 指令    | 群組輸入 `幫我記 隱形眼鏡度數 600 度`                     | Bot 回覆確認訊息 + Quick Reply         |      |      |
| T05 | CONFIRM 指令     | 點「確認」或輸入 `確認儲存記憶`                           | pending_actions 刪除，mem0 新增記憶    |      |      |
| T06 | CANCEL 指令      | `幫我記 測試取消`，再輸入 `取消儲存記憶`                  | pending_actions 刪除，mem0 無新增      |      |      |
| T07 | SAVE_PREVIOUS    | 先輸入一句 `隱形眼鏡都買酷柏雙週拋`，再輸入 `存上一則`    | 回覆確認訊息，後續可存入記憶           |      |      |
| T08 | SAVE_QUOTED      | 回覆某句訊息並輸入 `幫我記`                               | 回覆確認訊息，後續可存入記憶           |      |      |
| T09 | QUERY 指令       | 輸入 `查 隱形眼鏡度數`                                    | 回覆答案 + 來源列表                    |      |      |
| T10 | QUERY 指令       | 輸入 `找 隱形眼鏡品牌用什麼`                              | 回覆答案                               |      |      |
| T11 | QUERY 指令       | 輸入 `找 隱形眼鏡買什麼`                                  | 回覆答案且應該混合記憶 (mem0 能力)     |      |      |
| T12 | HELP 指令        | 輸入 `help`                                               | 回覆幫助訊息                           |      |      |
| T13 | 1:1 不處理       | 私聊輸入 `幫我記 私聊`                                    | 無回覆、無寫入 DB                      |      |      |
| T14 | 關鍵字非句首     | 輸入 `今天要 幫我記 買牛奶`                               | 不觸發指令、無回覆                     |      |      |

## 4. 錯誤記錄

> 若有失敗項目，請紀錄錯誤訊息、時間、Vercel Logs 連結或截圖。

- 時間：\***\*\_\_\*\***
- 測試項目：\***\*\_\_\*\***
- 錯誤訊息：\***\*\_\_\*\***
- 補充說明：\***\*\_\_\*\***

## 5. Supabase 檢查（手動）

- `messages` 最新 10 筆：
  - 是否包含本次測試訊息
  - `group_id` 是否有值
  - `content` 是否正確

SQL 參考：

```
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

## 6. Vercel Logs 檢查（手動）

- 是否有 POST /api/webhook 200
- 是否有 Missing LINE credentials 等錯誤

---

如需擴充測試項目，可在表格中新增新列。
