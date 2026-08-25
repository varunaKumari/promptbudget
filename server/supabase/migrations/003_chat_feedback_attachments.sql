-- Metadata-only support for response feedback and message attachments.
-- Attachments are kept in chat_messages.metadata unless durable file storage is added later.

create index if not exists chat_messages_feedback_idx
  on chat_messages((metadata->>'feedback'))
  where metadata ? 'feedback';
