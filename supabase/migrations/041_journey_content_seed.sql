-- Sample content so the LEARN and PRACTICE phases of a journey always have real
-- material to hand the student. Idempotent: safe to re-run, inserts only what's
-- missing. Topics are matched by their canonical curriculum slug; if a topic row
-- doesn't exist yet a minimal one is created (slug is unique, so this never dupes).

-- 1. Ensure the handful of topics this seed references exist.
insert into public.topics (name, slug, order_index, icon)
values
  ('Differentiation',          'differentiation',          10, '📈'),
  ('Integration',              'integration',              11, '∫'),
  ('Algebra & Functions',      'algebra-functions',         1, '🔢'),
  ('Trigonometry',             'trigonometry',              6, '📐')
on conflict (slug) do nothing;

-- 2. Seed one lesson per topic (guarded so re-runs don't duplicate).
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('differentiation',
       'Differentiation from First Principles',
       '[{"type":"concept","label":"The big idea","content":"Differentiation finds the gradient of a curve at any point. For y = x^n the gradient is dy/dx = n x^{n-1}."},{"type":"summary","content":"Multiply by the power, then subtract one from the power."}]'::jsonb,
       2, 15),
      ('integration',
       'Integration as the Reverse of Differentiation',
       '[{"type":"concept","label":"The big idea","content":"Integration reverses differentiation and measures the area under a curve. For x^n, the integral is x^{n+1}/(n+1) + c."},{"type":"summary","content":"Add one to the power, divide by the new power, add the constant c."}]'::jsonb,
       3, 18),
      ('algebra-functions',
       'Manipulating Algebraic Functions',
       '[{"type":"concept","label":"The big idea","content":"Functions map inputs to outputs. Composing and rearranging them is the foundation for the whole A-level."},{"type":"summary","content":"Master factorising, completing the square, and function notation f(x)."}]'::jsonb,
       1, 12),
      ('trigonometry',
       'Trigonometric Identities',
       '[{"type":"concept","label":"The big idea","content":"The identity sin^2(x) + cos^2(x) = 1 underpins solving trig equations and simplifying expressions."},{"type":"summary","content":"Know the Pythagorean identity and the exact values for 0, 30, 45, 60, 90 degrees."}]'::jsonb,
       2, 15)
    ) as t(slug, title, content, difficulty, minutes)
  loop
    insert into public.lessons (topic_id, title, content, difficulty, estimated_minutes)
    select tp.id, rec.title, rec.content, rec.difficulty, rec.minutes
    from public.topics tp
    where tp.slug = rec.slug
      and not exists (
        select 1 from public.lessons l where l.topic_id = tp.id and l.title = rec.title
      );
  end loop;
end $$;

-- 3. Seed a couple of practice questions per topic (guarded by stem).
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('differentiation', 'Differentiate y = 3x^2 + 2x - 5 with respect to x.', 'dy/dx = 6x + 2', 2, 2),
      ('differentiation', 'Find the gradient of y = x^3 at the point x = 2.',     '12',            3, 3),
      ('integration',     'Find the integral of 4x + 1 with respect to x.',       '2x^2 + x + c',  2, 2),
      ('integration',     'Evaluate the integral of 6x^2 between x = 0 and x = 1.','2',            3, 4),
      ('algebra-functions','Factorise x^2 + 5x + 6.',                             '(x + 2)(x + 3)',1, 2),
      ('trigonometry',    'Solve sin(x) = 0.5 for 0 <= x < 360 degrees.',         'x = 30 or 150', 3, 3)
    ) as t(slug, stem, answer, difficulty, marks)
  loop
    insert into public.questions (topic_id, stem, answer, difficulty, marks, source)
    select tp.id, rec.stem, rec.answer, rec.difficulty, rec.marks, 'journey-seed'
    from public.topics tp
    where tp.slug = rec.slug
      and not exists (
        select 1 from public.questions q where q.topic_id = tp.id and q.stem = rec.stem
      );
  end loop;
end $$;
