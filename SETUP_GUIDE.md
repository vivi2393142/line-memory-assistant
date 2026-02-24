# 外部服務設定指南

本文件詳細說明如何設定所有需要的外部服務。

## 📋 設定檢查清單

- [ ] LINE Messaging API
- [ ] Supabase Database
- [ ] mem0 Account
- [ ] Google Gemini API
- [ ] 本地環境變數設定

---

## 1. LINE Messaging API 設定

### 步驟 1：創建 Provider

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入你的 LINE 帳號
3. 點擊 "Create a new provider"
4. 輸入 Provider name（例如：`My Personal Projects`）

### 步驟 2：創建 Channel

1. 在 Provider 頁面，點擊 "Create a Messaging API channel"
2. 填寫以下資訊：
   - **Channel name**: `Memory Assistant`（或任何你喜歡的名稱）
   - **Channel description**: `Personal memory management bot`
   - **Category**: `Utilities` 或適合的分類
   - **Subcategory**: 選擇適合的子分類
3. 同意條款並創建

### 步驟 3：取得 Credentials

1. 進入你剛創建的 Channel
2. 前往 **Messaging API** 標籤
3. 找到並記下：
   - **Channel access token** (長期):
     - 點擊 "Issue" 按鈕
     - 複製產生的 token（例如：`abc123xyz...`）
   - **Channel secret**:
     - 在 **Basic settings** 標籤中
     - 複製 Channel secret

### 步驟 4：基本設定

在 **Messaging API** 標籤中：

1. **Webhook settings**:
   - 暫時先不設定（部署後再設定）
   - 確保 "Use webhook" 是關閉的

2. **Auto-reply messages**:
   - 停用自動回覆訊息（避免干擾）

3. **Greeting messages**:
   - 可以自訂或停用

4. **Allow bot to join group chats**:
   - 啟用（重要！）

---

## 2. Supabase Database 設定

### 步驟 1：創建專案

1. 前往 [Supabase](https://supabase.com/)
2. 點擊 "Start your project"
3. 登入（可使用 GitHub 帳號）
4. 點擊 "New project"
5. 填寫資訊：
   - **Name**: `line-memory-assistant`
   - **Database Password**: 設定一個強密碼（記下來）
   - **Region**: 選擇離你最近的（例如：Northeast Asia (Tokyo)）
   - **Pricing Plan**: Free

### 步驟 2：建立資料表

1. 等待專案初始化完成（約 1-2 分鐘）
2. 進入專案後，點擊左側 **SQL Editor**
3. 點擊 "New query"
4. 複製 `supabase/schema.sql` 的內容
5. 貼上並點擊 "Run"
6. 確認資料表建立成功

### 步驟 3：取得 Credentials

1. 點擊左側 **Settings** (齒輪圖示)
2. 選擇 **API**
3. 記下：
   - **Project URL**（例如：`https://xyz.supabase.co`）
   - **anon/public key**（在 Project API keys 區塊）

---

## 3. mem0 設定

### 步驟 1：註冊帳號

1. 前往 [mem0.ai](https://app.mem0.ai/)
2. 點擊 "Sign Up"
3. 使用 Email 或 Google 帳號註冊

### 步驟 2：選擇方案

1. 登入後，選擇 **Hobby Plan**（免費）
2. 完成設定

### 步驟 3：取得 API Key

1. 前往 Dashboard
2. 點擊 **Settings** 或 **API Keys**
3. 點擊 "Create new API key"
4. 複製並安全保存 API Key

---

## 4. Google Gemini API 設定

### 步驟 1：前往 Google AI Studio

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用你的 Google 帳號登入

### 步驟 2：創建 API Key

1. 點擊 "Create API Key"
2. 選擇或創建一個 Google Cloud Project
   - 如果沒有專案，點擊 "Create API key in new project"
3. 複製產生的 API Key

### 步驟 3：確認免費額度

- Gemini API 提供免費額度：
  - 每分鐘 60 requests
  - 每天 1,500 requests
- 對於個人使用完全足夠

---

## 5. 環境變數設定

### 本地開發

1. 在專案根目錄創建 `.env.local` 檔案：

```bash
cp .env.example .env.local
```

2. 編輯 `.env.local`，填入所有 credentials：

```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# mem0
MEM0_API_KEY=your_mem0_api_key_here

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
PENDING_EXPIRY_MINUTES=30
```

3. 確認 `.env.local` 在 `.gitignore` 中（已預設包含）

### Vercel 部署

部署到 Vercel 時，需要在 Vercel Dashboard 設定環境變數：

1. 前往 Vercel Dashboard
2. 選擇你的專案
3. 進入 **Settings** > **Environment Variables**
4. 逐一添加上述所有變數
5. Environment: 選擇 **Production, Preview, Development** (全選)

---

## 6. 測試連線

### 測試 Supabase

在 Supabase Dashboard > SQL Editor 執行：

```sql
SELECT * FROM messages LIMIT 1;
SELECT * FROM pending_actions LIMIT 1;
```

應該返回空結果（因為還沒資料），但不應該有錯誤。

### 測試 Next.js

```bash
npm run dev
```

訪問 `http://localhost:3000/api/webhook`

應該看到：
```json
{
  "status": "ok",
  "service": "LINE Memory Assistant",
  "version": "1.0.0"
}
```

---

## ⚠️ 常見問題

### LINE Bot 無法加入群組

- 確認在 LINE Developers Console 中啟用了 "Allow bot to join group chats"

### Supabase 連線失敗

- 檢查 URL 格式是否正確（包含 `https://`）
- 確認使用的是 **anon/public key**，不是 service_role key

### mem0 API 錯誤

- 確認 API Key 沒有多餘的空格
- 檢查是否超過免費額度限制

### Gemini API 錯誤

- 確認 API Key 是否有效
- 檢查是否啟用了 Gemini API
- 確認沒有超過免費額度

---

## 🎉 完成！

所有服務設定完成後，你就可以：

1. 啟動本地開發：`npm run dev`
2. 使用 ngrok 測試 webhook
3. 部署到 Vercel
4. 將 Bot 加入你的 LINE 群組
5. 開始使用！

下一步：參考 [README.md](./README.md) 的「部署指南」章節。
