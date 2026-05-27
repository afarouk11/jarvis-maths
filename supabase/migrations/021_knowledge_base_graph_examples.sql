-- Add image_url for graph reference images
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS image_url text;

-- Allow graph_example type
ALTER TABLE public.knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_type_check;
ALTER TABLE public.knowledge_base ADD CONSTRAINT knowledge_base_type_check
  CHECK (type IN ('worked_example', 'concept', 'formula', 'tip', 'graph_example'));

-- Update match_knowledge to return image_url
DROP FUNCTION IF EXISTS match_knowledge(vector, integer, double precision);

CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_count     int   DEFAULT 5,
  min_similarity  float DEFAULT 0.4
)
RETURNS TABLE (
  id         uuid,
  type       text,
  title      text,
  content    text,
  topic_slug text,
  image_url  text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.type,
    kb.title,
    kb.content,
    kb.topic_slug,
    kb.image_url,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > min_similarity
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
$$;
