<div align="center">
  <img src="./logo.png" alt="LINE Memory Assistant" width="200" />
  <h1>LINE Memory Assistant</h1>
  <p>A personal memory assistant bot for LINE groups with automatic storage, semantic search, and long-term memory management.</p>
</div>

## Features

- **Auto-save**: All messages automatically stored as raw records
- **Structured Memory Search**: Upgrade to searchable, organized memories using semantic search
- **Low-interference**: No auto-reply, only responds to specific keywords

## Commands

| Feature          | Syntax / Condition                  | Keyword                                    |
| ---------------- | ----------------------------------- | ------------------------------------------ |
| 記錄現在這句話   | [keyword] + 內容                    | `幫我記`, `記一下`, `記錄`, `save`, `儲存` |
| 記錄上一則訊息   | [keyword]                           | `存上一則`, `存最後一則`                   |
| 記錄某個說過的話 | 回覆某則訊息 + [keyword]            | `幫我記`, `記一下`, `記錄`, `save`, `儲存` |
| 確認寫入記憶     | [keyword] (或點彈出的 quick button) | `確認儲存記憶`                             |
| 取消寫入記憶     | [keyword] (或點彈出的 quick button) | `取消儲存記憶`                             |
| 查詢記憶         | [keyword] + 問題                    | `查`, `找`, `搜尋`, `search`               |
| 取得使用說明     | [keyword]                           | `help`, `怎麼用`, `幫助`                   |

## System Architecture

### Layered Design

```
LINE Webhook
     ↓
Command Parser (rule-based only)
     ↓
Service Layer
  ├─ CaptureService (memory capture)
  ├─ QueryService (search)
  └─ HelpService (help)
     ↓
Provider Layer (swappable)
  ├─ LINEProvider
  ├─ LLMProvider (Gemini)
  ├─ MemoryProvider (mem0)
  └─ StorageProvider (Supabase)
```

### Memory Upgrade Flow

```
User Message → Save to Raw DB → Parse Command
                                      ↓
              Keyword Triggered → LLM Cleans Content → Create Pending
                                                          ↓
              User Confirms → Write to mem0 → Complete
```

### Query Flow

```
Query Command → mem0 Semantic Search → LLM Composes Answer → Attach Sources → Reply
```

## Tech Stack

| Layer            | Technology        | Description                    |
| ---------------- | ----------------- | ------------------------------ |
| Language         | TypeScript        | Type-safe                      |
| Framework        | Next.js 14        | Serverless API Routes          |
| Hosting          | Vercel Hobby      | Free deployment (100 GB/month) |
| Database         | Supabase Postgres | Free tier (500 MB)             |
| Long-term Memory | mem0              | Hosted memory service          |
| LLM              | Google Gemini     | Free API quota (60 req/min)    |
| LINE             | @line/bot-sdk     | Official SDK                   |

**Cost: Completely Free**

## Service Limits & Error Handling

### Free Tier Quotas

| Service      | Free Tier Limits                            | How to Check Usage                                                              |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------------------- |
| **Gemini**   | 15 RPM, 1M TPM, 1500 RPD                    | [Google AI Studio - Rate Limits](https://aistudio.google.com/app/plan)          |
| **Supabase** | 500 MB storage, 5 GB bandwidth/month        | [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/billing) |
| **mem0**     | Hobby Plan (check official docs for limits) | [mem0 Dashboard](https://app.mem0.ai/dashboard)                                 |
| **Vercel**   | 100 GB bandwidth/month (Hobby)              | [Vercel Usage](https://vercel.com/dashboard/usage)                              |
| **LINE**     | No quota limits when using `replyToken`     | -                                                                               |

> **RPM**: Requests per minute  
> **TPM**: Tokens per minute  
> **RPD**: Requests per day

## Quick Start

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for complete setup instructions.

### Quick Steps

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run SQL schema in Supabase
# Execute supabase/schema.sql in Supabase SQL Editor

# 4. Deploy to Vercel
vercel --prod

# 5. Configure LINE Webhook URL
# https://your-project.vercel.app/api/webhook
```

## Project Structure

<!-- TODO: need to be updated -->

```
line-memory-assistant/
├── app/
│   └── api/webhook/route.ts      # LINE webhook endpoint
├── lib/
│   ├── types/index.ts             # TypeScript type definitions
│   ├── parsers/
│   │   └── commandParser.ts       # Command parser
│   ├── providers/                 # Swappable third-party wrappers
│   │   ├── lineProvider.ts
│   │   ├── llmProvider.ts
│   │   ├── memoryProvider.ts
│   │   └── storageProvider.ts
│   └── services/                  # Business logic
│       ├── captureService.ts
│       ├── queryService.ts
│       └── helpService.ts
└── supabase/schema.sql            # Database schema
```

## Design Philosophy

### Default No-Reply

Unlike typical chatbots, this bot is designed for "low interference":

- All messages auto-saved as raw records
- Only specific keywords trigger replies
- Perfect for personal note-taking without interrupting conversations

### Two-Stage Memory

**Raw Records** (automatic) → **Long-term Memory** (manual confirmation)

This design allows you to:

- Record everything without worry
- Only upgrade important content to searchable memory
- Preview and edit before upgrading

### Traceability

Every memory retains a reference to the original message:

- Query results include sources
- Can trace back to the complete original message
- Prevents information loss from AI summarization

## Database Design

### messages (raw messages)

```sql
- id: UUID
- user_id: VARCHAR
- group_id: VARCHAR (nullable)
- line_message_id: VARCHAR (unique)
- quoted_message_id: VARCHAR (nullable)
- content: TEXT
- created_at: TIMESTAMP
```

### pending_actions (pending memories)

```sql
- id: UUID
- user_id: VARCHAR
- group_id: VARCHAR (nullable)
- action_type: VARCHAR (fixed as 'add_memory')
- draft_content: TEXT (LLM-cleaned content)
- raw_id: UUID (FK to messages)
- expires_at: TIMESTAMP (expires after 30 minutes)
- created_at: TIMESTAMP

UNIQUE(user_id, group_id)  -- Each user can only have one pending
```

### mem0 (long-term memory)

Using mem0 hosted service, metadata includes:

- `raw_id`: Original message ID
- `user_id`: User ID
- `group_id`: Group ID
- `created_at`: Creation timestamp

## Future Features (Phase 2+)

- [ ] List all memories (Flex Message UI)
- [ ] Delete memories
- [ ] Tag system
- [ ] Batch upgrade Raw → Memory
- [ ] Web Dashboard for querying
- [ ] Memory conflict detection
- [ ] Search result reranking

## Debugging Tips

### Check Webhook Status

```bash
curl https://your-project.vercel.app/api/webhook
# Should return: {"status":"ok","service":"LINE Memory Assistant","version":"1.0.0"}
```

### View Vercel Logs

```bash
vercel logs
```

### Test Database Connection

In Supabase Dashboard > SQL Editor:

```sql
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

## References

- [LINE Messaging API Documentation](https://developers.line.biz/en/docs/messaging-api/)
- [mem0 Documentation](https://docs.mem0.ai/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI (Gemini) Documentation](https://ai.google.dev/docs)

## License

MIT
