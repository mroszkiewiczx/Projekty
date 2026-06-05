# Export to Notion / Airtable via N8N

## Architektura

```
AI.School (React Frontend)
    ↓
Supabase (processing_jobs table)
    ↓
Worker (Node.js — listens for export_generation jobs)
    ↓
N8N Webhooks (export-notion, export-airtable)
    ↓
├─ Notion API (create database record)
└─ Airtable API (create table record)
```

## Setup

### 1. N8N Installation

```bash
npm install -g n8n
n8n start
# Otwórz http://localhost:5678
```

### 2. Notion Setup

1. Zaloguj się do Notion
2. **Settings & members** → **Integrations** → **Develop your own**
3. Utwórz nową internal integration
4. Copy **Internal Integration Token** (to `N8N_NOTION_API_KEY`)
5. Utwórz Notion database do lekcji (template: `docs/n8n-workflows/notion-template.md`)
6. Copy database ID (to `NOTION_DATABASE_ID` w N8N secrets)
7. Share database z Notion integration

### 3. Airtable Setup

1. Zaloguj się do Airtable
2. **Account** → **Tokens** → **Create token**
3. Wymagane scopes:
   - `data.records:write`
   - `data.recordComments:read`
   - `table:read`
   - `base:read`
4. Copy token (to `AIRTABLE_API_KEY`)
5. Get Base ID (widać w URL: `https://airtable.com/appXXXXXXX/...`)
6. Get Table ID (copy z widoku tabel)

### 4. N8N Workflow Import

**Dla Notion:**
1. N8N Dashboard → **Workflows** → **New**
2. **Menu** → **Import from File/URL**
3. Wczytaj `docs/n8n-workflows/export-lesson-to-notion.json`
4. Configure credentials:
   - Notion: OAuth2 (authorize)
   - Or API token: paste `NOTION_API_KEY`
5. Set secrets in N8N:
   - `NOTION_DATABASE_ID`: [paste database ID]
6. Save & activate

**Dla Airtable:**
1. Powtórz dla `export-lesson-to-airtable.json`
2. Set secrets:
   - `AIRTABLE_API_KEY`: [paste token]
   - `AIRTABLE_BASE_ID`: [paste base ID]
   - `AIRTABLE_TABLE_ID`: [paste table ID]

### 5. N8N Webhook Setup

Po imporcie workflow — N8N auto-generuje webhook URL:
- **Notion:** `https://your-n8n.com/webhook/export-notion`
- **Airtable:** `https://your-n8n.com/webhook/export-airtable`

Copy te URLs do `.env`:
```env
N8N_WEBHOOK_EXPORT_NOTION=https://your-n8n.com/webhook/export-notion
N8N_WEBHOOK_EXPORT_AIRTABLE=https://your-n8n.com/webhook/export-airtable
N8N_WEBHOOK_SECRET=your-secret-key-for-auth
```

### 6. Auth Configuration

N8N webhook wymaga `Authorization: Bearer <N8N_WEBHOOK_SECRET>`

W N8N workflow — enable webhook authentication:
1. Webhook node → **Authentication**
2. **Bearer Token**
3. Verify token from request header

### 7. Worker Configuration

```env
# .env
N8N_WEBHOOK_EXPORT_NOTION=https://your-n8n.com/webhook/export-notion
N8N_WEBHOOK_EXPORT_AIRTABLE=https://your-n8n.com/webhook/export-airtable
N8N_WEBHOOK_SECRET=super-secret-key
```

## Usage

### From Frontend

```typescript
import { createExportJob } from '@/modules/lessongen/exportService'

// Export lesson to Notion + Airtable
const result = await createExportJob(lessonId, workspaceId, 'all')
// result.job_id → track in N8N
// result.status → 'queued'
```

### Worker Flow

1. Frontend creates `processing_jobs` record with `job_type='export_generation'`
2. Worker polls for `export_generation` jobs
3. Worker calls `handleExportLesson(payload)` → triggers N8N webhook
4. N8N receives webhook payload:
   ```json
   {
     "lesson": { ... },
     "workspace_id": "xxx",
     "user_id": "xxx",
     "ai_school_source": {
       "app_url": "...",
       "lesson_link": "...",
       "exported_at": "2026-06-05T..."
     }
   }
   ```
5. N8N creates Notion page / Airtable record
6. N8N returns `{ execution_id, notion_page_id?, airtable_record_id? }`
7. Worker marks job as `done` with result

## Testing

### Local Testing (N8N Webhook)

```bash
# Terminal 1: Start N8N
n8n start

# Terminal 2: Test webhook
curl -X POST http://localhost:5678/webhook/export-notion \
  -H "Authorization: Bearer test-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "lesson": {
      "id": "test-123",
      "title": "Math Basics",
      "subject": "Mathematics"
    },
    "workspace_id": "ws-123",
    "user_id": "user-123",
    "ai_school_source": {
      "app_url": "http://localhost:3000",
      "lesson_link": "http://localhost:3000/lessongen?view=test-123",
      "exported_at": "2026-06-05T10:00:00Z"
    }
  }'
```

### Database Testing

```sql
-- Check export job
SELECT id, status, result, last_error
FROM processing_jobs
WHERE job_type = 'export_generation'
ORDER BY created_at DESC
LIMIT 1;
```

## Troubleshooting

### N8N Webhook Not Responding

1. Check webhook path (should not include `/webhook/` prefix in N8N config)
2. Verify auth token matches `N8N_WEBHOOK_SECRET`
3. Check N8N logs: `N8N_LOG_LEVEL=debug n8n start`

### Notion/Airtable Not Creating Records

1. Check N8N execution logs (Workflows → Recent executions)
2. Verify database/table access from N8N integration
3. Check field names match your database schema
4. Validate API key has write permissions

### Worker Not Picking Up Jobs

1. Check worker logs: `WORKER_LOG_LEVEL=debug npm run worker`
2. Verify `processing_jobs` table has records with `status='pending'`
3. Check webhook URL is reachable from worker environment

## Production Notes

- Use N8N Cloud or self-hosted with HTTPS
- Secure `N8N_WEBHOOK_SECRET` in vault (not git)
- Monitor N8N execution logs for failures
- Set up N8N error notifications (email/Slack)
- Rate-limit Notion/Airtable API calls if high volume
