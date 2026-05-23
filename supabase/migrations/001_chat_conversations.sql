-- Chatbot conversation persistence for PromptBudget.
-- Apply this in Supabase before expecting chat history to persist.

create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  anonymous_session_id text null,
  audit_id uuid null references audits(id) on delete set null,
  title text null,
  status text not null default 'active',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  metadata jsonb not null default '{}',
  token_count integer null,
  model text null,
  created_at timestamptz not null default now()
);

create index if not exists chat_conversations_user_id_idx
  on chat_conversations(user_id, updated_at desc);

create index if not exists chat_conversations_anonymous_session_idx
  on chat_conversations(anonymous_session_id, updated_at desc);

create index if not exists chat_conversations_audit_id_idx
  on chat_conversations(audit_id);

create index if not exists chat_messages_conversation_id_idx
  on chat_messages(conversation_id, created_at asc);
