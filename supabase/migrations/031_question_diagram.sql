-- Optional SVG diagram for a generated/stored question, so practice questions
-- can carry a visual (triangles, circles, vectors, graphs) like papers do.
alter table questions add column if not exists diagram text;
