-- Export history & audit logs
create table if not exists public.export_history (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  export_type text not null check (export_type in ('lesson', 'batch_results')),
  target_platform text not null check (target_platform in ('notion', 'airtable', 'csv', 'json')),
  entity_id uuid not null, -- lesson_id or batch_id
  entity_name text not null,
  created_by uuid not null references public.users(id) on delete set null,
  created_at timestamptz default now(),
  status text not null default 'queued' check (status in ('queued', 'running', 'success', 'failed')),
  n8n_execution_id text, -- webhook execution ID from N8N
  error_message text,
  records_count integer, -- ile rekordów wyeksportowano
  completed_at timestamptz,
  metadata jsonb default '{}',

  constraint export_history_check_entity_id check (entity_id is not null)
);

-- Indexes
create index idx_export_history_workspace on public.export_history(workspace_id);
create index idx_export_history_created_by on public.export_history(created_by);
create index idx_export_history_status on public.export_history(status);
create index idx_export_history_created_at on public.export_history(created_at desc);

-- RLS
alter table public.export_history enable row level security;

create policy "export_history_workspace_select"
  on public.export_history
  for select
  using (workspace_id in (
    select workspace_id from public.users where id = (SELECT auth.uid())
  ));

create policy "export_history_workspace_insert"
  on public.export_history
  for insert
  with check (
    workspace_id in (
      select workspace_id from public.users where id = (SELECT auth.uid())
    )
    and created_by = (SELECT auth.uid())
  );

create policy "export_history_workspace_update"
  on public.export_history
  for update
  using (workspace_id in (
    select workspace_id from public.users where id = (SELECT auth.uid())
  ));

GRANT SELECT, INSERT, UPDATE ON public.export_history TO authenticated;
