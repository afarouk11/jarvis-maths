create table if not exists public.knowledge_base (
  id          uuid    primary key default gen_random_uuid(),
  topic_slug  text,
  type        text    not null
    check (type in ('worked_example', 'concept', 'formula', 'tip')),
  title       text    not null,
  content     text    not null,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);

create index if not exists knowledge_base_embedding_idx
  on public.knowledge_base using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.knowledge_base enable row level security;

do $$ begin
  create policy "Authenticated users can read knowledge" on public.knowledge_base for select using (auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

drop function if exists match_knowledge(vector, integer, double precision);

create or replace function match_knowledge(
  query_embedding vector(1536),
  match_count     int   default 5,
  min_similarity  float default 0.5
)
returns table (
  id         uuid,
  type       text,
  title      text,
  content    text,
  topic_slug text,
  similarity float
)
language sql stable
as $$
  select
    kb.id,
    kb.type,
    kb.title,
    kb.content,
    kb.topic_slug,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where 1 - (kb.embedding <=> query_embedding) > min_similarity
  order by kb.embedding <=> query_embedding
  limit match_count;
$$;
