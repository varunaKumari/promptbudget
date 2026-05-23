-- Personalization and long-term memory for PromptBudget chat.
-- Requires pgvector for semantic memory retrieval.

create extension if not exists vector;

alter table chat_conversations
  add column if not exists user_id uuid null;

create table if not exists chat_user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  anonymous_session_id text null,
  email text null,
  display_name text null,
  company_name text null,
  role text null,
  team_size integer null,
  preferences jsonb not null default '{}',
  traits jsonb not null default '{}',
  metadata jsonb not null default '{}',
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_user_profiles_owner_check check (
    user_id is not null or anonymous_session_id is not null
  )
);

create unique index if not exists chat_user_profiles_user_id_unique
  on chat_user_profiles(user_id)
  where user_id is not null;

create unique index if not exists chat_user_profiles_anonymous_session_unique
  on chat_user_profiles(anonymous_session_id)
  where anonymous_session_id is not null;

create table if not exists chat_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  anonymous_session_id text null,
  conversation_id uuid null references chat_conversations(id) on delete set null,
  audit_id uuid null references audits(id) on delete set null,
  kind text not null check (
    kind in (
      'profile',
      'preference',
      'business_context',
      'audit_insight',
      'recommendation',
      'session_summary'
    )
  ),
  content text not null,
  importance integer not null default 5 check (importance between 1 and 10),
  embedding vector(1536) null,
  embedding_model text null,
  metadata jsonb not null default '{}',
  status text not null default 'active' check (status in ('active', 'archived', 'deleted')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_memories_owner_check check (
    user_id is not null or anonymous_session_id is not null
  )
);

create index if not exists chat_memories_user_recent_idx
  on chat_memories(user_id, last_seen_at desc)
  where user_id is not null and status = 'active';

create index if not exists chat_memories_anonymous_recent_idx
  on chat_memories(anonymous_session_id, last_seen_at desc)
  where anonymous_session_id is not null and status = 'active';

create index if not exists chat_memories_audit_idx
  on chat_memories(audit_id)
  where status = 'active';

create index if not exists chat_memories_embedding_idx
  on chat_memories using ivfflat (embedding vector_cosine_ops)
  with (lists = 100)
  where embedding is not null and status = 'active';

create or replace function match_chat_memories(
  query_embedding vector(1536),
  match_count int default 8,
  min_similarity float default 0.72,
  owner_user_id uuid default null,
  owner_anonymous_session_id text default null,
  active_audit_id uuid default null
)
returns table (
  id uuid,
  kind text,
  content text,
  importance integer,
  metadata jsonb,
  created_at timestamptz,
  last_seen_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    m.id,
    m.kind,
    m.content,
    m.importance,
    m.metadata,
    m.created_at,
    m.last_seen_at,
    1 - (m.embedding <=> query_embedding) as similarity
  from chat_memories m
  where
    m.status = 'active'
    and m.embedding is not null
    and (
      (owner_user_id is not null and m.user_id = owner_user_id)
      or (
        owner_user_id is null
        and owner_anonymous_session_id is not null
        and m.anonymous_session_id = owner_anonymous_session_id
      )
    )
    and (
      active_audit_id is null
      or m.audit_id is null
      or m.audit_id = active_audit_id
    )
    and 1 - (m.embedding <=> query_embedding) >= min_similarity
  order by
    similarity desc,
    m.importance desc,
    m.last_seen_at desc
  limit match_count;
$$;
