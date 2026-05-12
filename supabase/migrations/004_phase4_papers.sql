-- Phase 4: Past papers, vector embeddings, RAG
-- Run this in Supabase SQL Editor

-- Enable pgvector
create extension if not exists vector;

-- Past papers table
create table if not exists past_papers (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  exam_board       text not null default 'AQA',
  year             integer,
  paper_number     integer,
  pdf_url          text,
  processed        boolean default false,
  chunk_count      integer default 0,
  created_at       timestamptz default now()
);

-- Paper chunks table (for RAG)
create table if not exists paper_chunks (
  id         uuid primary key default gen_random_uuid(),
  paper_id   uuid references past_papers(id) on delete cascade,
  content    text not null,
  topic_slug text,
  page_num   integer,
  embedding  vector(1536),
  created_at timestamptz default now()
);

-- Vector similarity index
create index if not exists paper_chunks_embedding_idx
  on paper_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- RLS
alter table past_papers  enable row level security;
alter table paper_chunks enable row level security;

-- Papers readable by all authenticated users
create policy "papers_read"  on past_papers  for select using (auth.role() = 'authenticated');
create policy "chunks_read"  on paper_chunks for select using (auth.role() = 'authenticated');

-- RAG similarity search function
create or replace function match_paper_chunks(
  query_embedding vector(1536),
  match_count     int     default 5,
  min_similarity  float   default 0.5
)
returns table (
  id         uuid,
  paper_id   uuid,
  content    text,
  topic_slug text,
  similarity float
)
language sql stable
as $$
  select
    pc.id,
    pc.paper_id,
    pc.content,
    pc.topic_slug,
    1 - (pc.embedding <=> query_embedding) as similarity
  from paper_chunks pc
  where 1 - (pc.embedding <=> query_embedding) > min_similarity
  order by pc.embedding <=> query_embedding
  limit match_count;
$$;
