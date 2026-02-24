# LINE Memory Assistant

一個可加入 LINE 群組的個人記憶助手 Bot，具備自動儲存、語意搜尋和長期記憶管理功能。

## ✨ 功能特色

- 📝 **自動儲存**：所有訊息自動儲存為原始記錄
- 🧠 **長期記憶**：支援升級為可搜尋的結構化記憶
- 🔍 **語意搜尋**：使用 AI 進行智慧查詢
- ✅ **確認機制**：記憶儲存前可預覽和確認
- 🤖 **低干擾**：預設不回覆，僅固定關鍵字觸發

## 🎯 使用指令

| 指令 | 功能 |
|------|------|
| `幫我記 <內容>` | 儲存當下內容為記憶 |
| `存上一則` | 儲存最近一則訊息 |
| 回覆訊息 + `幫我記` | 儲存被回覆的訊息 |
| `確認` | 確認儲存待確認的記憶 |
| `取消` | 取消待確認的記憶 |
| `查 <問題>` | 搜尋相關記憶 |
| `help` / `怎麼用` | 顯示使用說明 |

## 🏗️ 技術架構

```
LINE Webhook
     ↓
Command Parser (純規則判斷)
     ↓
Service Layer
     ↓
Provider Layer (可抽換)
  ├─ LINEProvider
  ├─ LLMProvider (Gemini)
  ├─ MemoryProvider (mem0)
  └─ StorageProvider (Supabase)
```

## 📦 技術選型

| 層級 | 技術 | 說明 |
|------|------|------|
| 語言 | TypeScript | 型別安全 |
| 框架 | Next.js 14 | Serverless API Routes |
| Hosting | Vercel Hobby | 免費部署 |
| 資料庫 | Supabase Postgres | 免費額度 |
| 長期記憶 | mem0 | Hosted memory service |
| LLM | Google Gemini | 免費 API 額度 |
| LINE | @line/bot-sdk | 官方 SDK |

## 🚀 部署指南

### 1. 準備外部服務

#### LINE Developers
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 創建 Messaging API Channel
3. 記下：
   - Channel Access Token
   - Channel Secret

#### Supabase
1. 前往 [Supabase](https://supabase.com/)
2. 創建新專案（免費）
3. 執行 `supabase/schema.sql` 建立資料表
4. 記下：
   - Project URL
   - anon/public key

#### mem0
1. 前往 [mem0.ai](https://app.mem0.ai/)
2. 註冊並選擇 Hobby tier（免費）
3. 記下 API Key

#### Google Gemini
1. 前往 [Google AI Studio](https://makersuite.google.com/)
2. 創建 API Key（免費額度）
3. 記下 API Key

### 2. 本地開發

```bash
# 安裝依賴
npm install

# 複製環境變數範本
cp .env.example .env.local

# 編輯 .env.local，填入你的 API keys
# LINE_CHANNEL_ACCESS_TOKEN=...
# LINE_CHANNEL_SECRET=...
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# MEM0_API_KEY=...
# GEMINI_API_KEY=...
# PENDING_EXPIRY_MINUTES=30

# 啟動開發伺服器
npm run dev
```

### 3. 使用 ngrok 測試 Webhook

```bash
# 安裝 ngrok（如果還沒安裝）
# macOS: brew install ngrok
# 或前往 https://ngrok.com/ 下載

# 啟動 ngrok
ngrok http 3000

# 複製 ngrok 提供的 HTTPS URL（例如：https://abc123.ngrok.io）
# 前往 LINE Developers Console
# 設定 Webhook URL: https://abc123.ngrok.io/api/webhook
# 啟用 "Use webhook"
```

### 4. 部署到 Vercel

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署
vercel

# 設定環境變數
# 前往 Vercel Dashboard > Settings > Environment Variables
# 添加所有 .env.local 中的變數

# 生產環境部署
vercel --prod

# 複製 Vercel 提供的 URL
# 前往 LINE Developers Console
# 更新 Webhook URL: https://your-project.vercel.app/api/webhook
```

### 5. 將 Bot 加入群組

1. 在 LINE Developers Console 取得 QR Code
2. 掃描加入 Bot 為好友
3. 建立一個只有你自己的群組
4. 邀請 Bot 加入群組
5. 開始使用！

## 📂 專案結構

```
line-memory-assistant/
├── app/
│   └── api/
│       └── webhook/
│           └── route.ts         # LINE webhook endpoint
├── lib/
│   ├── types/
│   │   └── index.ts             # TypeScript 型別定義
│   ├── parsers/
│   │   └── commandParser.ts     # 指令解析器
│   ├── providers/
│   │   ├── lineProvider.ts      # LINE API 封裝
│   │   ├── llmProvider.ts       # Gemini AI 封裝
│   │   ├── memoryProvider.ts    # mem0 封裝
│   │   └── storageProvider.ts   # Supabase 封裝
│   └── services/
│       ├── captureService.ts    # 記憶捕捉服務
│       ├── queryService.ts      # 查詢服務
│       └── helpService.ts       # 說明服務
├── supabase/
│   └── schema.sql               # 資料庫 schema
├── .env.example                 # 環境變數範本
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🔧 開發說明

### 資料庫 Schema

**messages** - 原始訊息儲存
```sql
- id (UUID)
- user_id (VARCHAR)
- group_id (VARCHAR, nullable)
- line_message_id (VARCHAR, unique)
- quoted_message_id (VARCHAR, nullable)
- content (TEXT)
- created_at (TIMESTAMP)
```

**pending_actions** - 待確認記憶
```sql
- id (UUID)
- user_id (VARCHAR)
- group_id (VARCHAR, nullable)
- action_type (VARCHAR)
- draft_content (TEXT)
- raw_id (UUID, FK to messages)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### 指令解析順序

1. `存上一則` (exact match)
2. `確認` (exact match)
3. `取消` (exact match)
4. `幫我記` (prefix)
5. `查 ` (prefix)
6. `help` / `怎麼用` (exact match)
7. 其他 → 僅存 Raw，不回覆

## 💰 成本控制

所有服務都使用免費方案：

- **Vercel Hobby**: 免費（100 GB 流量/月）
- **Supabase Free**: 500 MB 資料庫 + 1 GB 檔案儲存
- **mem0 Hobby**: 免費（有使用量限制）
- **Gemini API**: 免費額度（60 requests/min）

預估個人使用：**完全免費** 🎉

## 🔐 安全注意事項

1. **永遠不要**將 `.env.local` 或 `.env` 提交到 Git
2. 在 Vercel 設定環境變數時，選擇適當的環境（Production/Preview/Development）
3. LINE Webhook 會驗證簽名，確保請求來自 LINE
4. Supabase 可啟用 Row Level Security (RLS) 增加安全性

## 📝 待辦功能（Phase 2+）

- [ ] 列出所有記憶（Flex Message UI）
- [ ] 刪除記憶
- [ ] Tag 系統
- [ ] 批次升級 Raw → Memory
- [ ] Web Dashboard
- [ ] 記憶衝突偵測
- [ ] 搜尋 rerank

## 🐛 除錯技巧

### 檢查 Webhook 狀態
```bash
curl https://your-project.vercel.app/api/webhook
# 應該返回: {"status":"ok","service":"LINE Memory Assistant","version":"1.0.0"}
```

### 查看 Vercel 日誌
```bash
vercel logs
```

### 測試資料庫連線
在 Supabase Dashboard > SQL Editor 執行：
```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

## 📚 參考資源

- [LINE Messaging API Documentation](https://developers.line.biz/en/docs/messaging-api/)
- [mem0 Documentation](https://docs.mem0.ai/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI (Gemini) Documentation](https://ai.google.dev/docs)

## 📄 License

MIT

## 👤 Author

Created as a personal side project for knowledge management.

---

**享受你的智慧記憶助手！** 🚀
