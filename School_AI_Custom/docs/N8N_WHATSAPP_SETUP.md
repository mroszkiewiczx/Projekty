# WhatsApp Notifications Setup Guide (n8n + Evolution API)

## Overview

This guide shows how to set up the WhatsApp notification workflow in n8n using the Evolution API integration to send lesson alerts to students via WhatsApp.

## Prerequisites

- ✅ n8n instance running at `https://n8n.creativecompany.pl`
- ✅ n8n-nodes-evolution-api installed
- ✅ Evolution API v2.2+ with active WhatsApp session
- ✅ School_AI_Custom deployed with WhatsApp integration code

## Step 1: Create Evolution API Credentials in n8n

1. Open n8n: https://n8n.creativecompany.pl
2. Go to **Credentials** (left sidebar)
3. Click **+ New**
4. Search for "Evolution API" and select it
5. Fill in credentials:
   - **Instance URL**: `https://your-evolution-api-instance.com`
   - **API Key**: Your Evolution API key
   - Save as "Evolution API Production"

## Step 2: Create Webhook Workflow

1. Create **New Workflow** named "Lesson WhatsApp Alert"
2. Add **Webhook** node:
   - Method: `POST`
   - Path: `lesson-whatsapp-alert`
   - Click "Execute Workflow" to enable
3. Add **Object Property** node:
   - Input: Webhook body
   - Extract: `lessonTitle`, `subject`, `targetGroup`, `message`

## Step 3: Add Evolution API Sender Node

1. Add **HTTP Request** node (or Evolution API node if available):
   - Method: `POST`
   - URL: `{{ $env.EVOLUTION_API_URL }}/message/send`
   - Headers:
     ```
     {
       "apikey": "{{ $env.EVOLUTION_API_KEY }}",
       "Content-Type": "application/json"
     }
     ```
   - Body:
     ```json
     {
       "number": "{{ $json.recipientGroup }}",
       "text": "{{ $json.message }}",
       "type": "text"
     }
     ```

## Step 4: Add Response Node

1. Add **Respond to Webhook** node:
   - Status Code: 200
   - Body:
     ```json
     {
       "success": true,
       "executionId": "{{ $execution.id }}",
       "timestamp": "{{ now().toISOString() }}"
     }
     ```

## Step 5: Test Workflow

### Via cURL:
```bash
curl -X POST https://n8n.creativecompany.pl/webhook/lesson-whatsapp-alert \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "test-123",
    "lessonTitle": "Photosynthesis",
    "subject": "Biology",
    "targetGroup": "STUDENTS",
    "message": "📚 New Lesson: Photosynthesis\n\nSubject: Biology\nDuration: 45 minutes\n\nCheck the app to view the full lesson!"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "executionId": "abc123",
  "timestamp": "2026-06-05T15:30:00.000Z"
}
```

## Step 6: Configure School_AI_Custom

### In `.env.local`:
```env
VITE_N8N_URL=https://n8n.creativecompany.pl
VITE_N8N_WHATSAPP_WEBHOOK_PATH=lesson-whatsapp-alert
VITE_WHATSAPP_DEFAULT_GROUP=STUDENTS
```

### In `src/services/whatsappNotificationService.ts`:
- Verify webhook path matches n8n workflow path
- Check message template matches Evolution API expectations

## Step 7: Test End-to-End

1. Navigate to lesson detail page in School_AI_Custom
2. Click "📱 Send WhatsApp" button
3. Select recipient group (STUDENTS, PARENTS, ALL)
4. Click "Send Alert"
5. Monitor n8n workflow execution:
   - Go to workflow → Click execution log
   - Should show: Webhook received → Evolution API called → Response sent

## Troubleshooting

### Webhook not triggered
- ✓ Check webhook path matches exactly: `lesson-whatsapp-alert`
- ✓ Verify `VITE_N8N_URL` is correct in School_AI_Custom

### Evolution API fails
- ✓ Verify WhatsApp session is active in Evolution API dashboard
- ✓ Check phone numbers are in E.164 format: `+55 11 9XXXX-XXXX`
- ✓ Verify API key has correct permissions

### Message not received
- ✓ Check Evolution API rate limits (max ~80 msg/min per number)
- ✓ Verify recipient phone is saved in WhatsApp contacts
- ✓ Check Evolution API logs for error details

### Timeout errors
- ✓ Increase n8n timeout in workflow settings
- ✓ Check Evolution API server status
- ✓ Verify network connectivity to Evolution API

## Production Checklist

- [ ] Evolution API credentials secured (use n8n secret management)
- [ ] Webhook path is unique and hard to guess
- [ ] Rate limiting configured on n8n workflow
- [ ] Error handling in place (retry logic, dead-letter queue)
- [ ] Phone number validation before sending
- [ ] Message templates stored in database (not hardcoded)
- [ ] Audit logging enabled for all WhatsApp sends
- [ ] Tested with both test and production Evolution API instances

## Advanced: Message Template Database

For production, store message templates in Supabase:

```sql
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO whatsapp_templates (name, category, template) VALUES
('lesson_created', 'education', '📚 New Lesson: {title}\n\nSubject: {subject}\nDuration: {duration} minutes\n\nCheck the app to view the full lesson!');
```

Then in n8n, fetch the template by name before sending.

## Integration Flow Diagram

```
School_AI_Custom
    │
    └─→ User clicks "Send WhatsApp"
        │
        └─→ LessonDetailPage → useWhatsappNotification()
            │
            └─→ whatsappNotificationService.sendLessonNotification()
                │
                └─→ n8nIntegrationService.triggerWorkflow()
                    │
                    └─→ POST /webhook/lesson-whatsapp-alert
                        │
                        └─→ n8n Workflow
                            │
                            ├─→ Webhook Node (receive)
                            ├─→ Parse Message
                            ├─→ Evolution API Call
                            │
                            └─→ Respond to Webhook (200 OK)
                                │
                                └─→ whatsappNotificationService receives response
                                    │
                                    └─→ UI shows toast: "✓ Notification sent!"
                                        │
                                        └─→ Evolution API sends WhatsApp
                                            │
                                            └─→ Student receives message
```

## Related Files

- Backend service: `src/services/whatsappNotificationService.ts`
- React hook: `src/hooks/useWhatsappNotification.ts`
- UI component: `src/pages/teacher/LessonDetailPage.tsx` (Send WhatsApp button)
- Types: `src/types/notification.ts`
- n8n integration: `src/services/n8nIntegrationService.ts`
