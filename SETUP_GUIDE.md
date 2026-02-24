# Setup Guide

Complete guide for setting up all required external services.

## 📋 Setup Checklist

- [ ] LINE Messaging API
- [ ] Supabase Database
- [ ] mem0 Account
- [ ] Google Gemini API
- [ ] Local Environment Variables

---

## 1. LINE Messaging API Setup

### Step 1: Create Provider

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Sign in with your LINE account
3. Click "Create a new provider"
4. Enter Provider name (e.g., `My Personal Projects`)

### Step 2: Create Channel

1. On the Provider page, click "Create a Messaging API channel"
2. Fill in the following information:
   - **Channel name**: `Memory Assistant` (or any name you prefer)
   - **Channel description**: `Personal memory management bot`
   - **Category**: `Utilities` or appropriate category
   - **Subcategory**: Select appropriate subcategory
3. Agree to terms and create

### Step 3: Get Credentials

1. Enter your newly created Channel
2. Go to **Messaging API** tab in LINE Developers
3. Find and note down:
   - **Channel access token** (long-term):
     - Click "Issue" button
     - Copy the generated token (e.g., `abc123xyz...`)

### Step 4: Basic Configuration

In **Messaging API** tab:

1. **Webhook settings**:
   - Don't configure yet (set after deployment)
   - Ensure "Use webhook" is disabled

2. **Auto-reply messages**:
   - Disable auto-reply messages (to avoid interference)

3. **Greeting messages**:
   - Customize or disable as needed

4. **Allow bot to join group chats**:
   - Enable (Important!)

---

## 2. Supabase Database Setup

### Step 1: Create Project

1. Go to [Supabase](https://supabase.com/)
2. Click "Start your project"
3. Sign in (can use GitHub account)
4. Click "New project"
5. Fill in information:
   - **Name**: `line-memory-assistant`
   - **Database Password**: Set a strong password (save it)
   - **Region**: Choose closest to you (e.g., Northeast Asia (Tokyo))
   - **Pricing Plan**: Free

### Step 2: Create Tables

1. Wait for project initialization (about 1-2 minutes)
2. After entering project, click **SQL Editor** on the left
3. Click "New query"
4. Copy the contents of `supabase/schema.sql`
5. Paste and click "Run"
6. Confirm tables are created successfully
7. Change all tables to 'restricted'

### Step 3: Get Credentials

1. Click **Settings** (gear icon) on the left
2. Copy **API Keys > Secret keys > default** to your `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
3. Copy **Data API > API URL** to your `SUPABASE_ENDPOINT` in `.env.local`

---

## 3. mem0 Setup

### Step 1: Register Account

1. Go to [mem0.ai](https://app.mem0.ai/)
2. Click "Sign Up"
3. Register with Email or Google account

### Step 2: Choose Plan

1. After logging in, select **Hobby Plan** (free)
2. Complete setup

### Step 3: Get API Key

1. Go to **API Keys**
2. Copy and securely save the API Key. If not exist, create one.

---

## 4. Google Gemini API Setup

### Step 1: Go to Google AI Studio

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account

### Step 2: Create API Key

1. Click "Create API Key"
2. Select or create a Google Cloud Project
   - If no project exists, click "Create API key in new project"
3. Copy the generated API Key

### Step 3: Verify Free Quota

- Gemini API provides free quota:
  - 60 requests per minute
  - 1,500 requests per day
- Completely sufficient for personal use

---

## 5. Environment Variables Setup

### Local Development

1. Create `.env.local` file in project root:
2. Edit `.env.local`, fill in all credentials based on `.env.example`
3. Verify `.env.local` is in `.gitignore` (already included by default)

### Vercel Deployment

When deploying to Vercel, set environment variables in Vercel Dashboard:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add all variables above one by one
5. Environment: Select **Production, Preview, Development** (all)

---

## 6. Test Connections

### Test Supabase

In Supabase Dashboard > SQL Editor:

```sql
SELECT * FROM messages LIMIT 1;
SELECT * FROM pending_actions LIMIT 1;
```

Should return empty results (no data yet), but no errors.

### Test Next.js

```bash
npm run dev
```

Visit `http://localhost:3000/api/webhook`

Should see:

```json
{
  "status": "ok",
  "service": "LINE Memory Assistant",
  "version": "1.0.0"
}
```

---

## 7. Deploy to Vercel

### Install Vercel CLI

```bash
npm i -g vercel
```

### Deploy

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# After verifying everything works, deploy to production
vercel --prod
```

### Configure Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Settings > Environment Variables
4. Add all variables from `.env.local`
5. Choose environments: Production, Preview, Development

### Update LINE Webhook URL

1. Go to LINE Developers Console
2. Update Webhook URL to: `https://your-project.vercel.app/api/webhook`
3. Enable "Use webhook"
4. Verify webhook connection

---

## 8. Add Bot to LINE Group

### Step 1: Add Bot as Friend

1. In LINE Developers Console, go to your channel
2. In **Messaging API** tab, find the QR code
3. Scan with LINE app to add bot as friend

### Step 2: Create Personal Group

1. Create a new LINE group with only yourself
2. Name it something like "My Memory"

### Step 3: Invite Bot

1. In the group, tap group name → Members
2. Tap "Invite"
3. Select your Memory Assistant bot
4. Start using!

---

## 9. Test Functionality

Send these test messages in your LINE group:

1. **Send any message** → Should not reply, but saved to database
2. **Send** `help` → Should show help message
3. **Send** `幫我記 test content` → Should show preview
4. **Reply** `確認` → Should save memory
5. **Send** `查 test` → Should find and return the memory
