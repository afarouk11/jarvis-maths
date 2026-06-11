-- Covering indexes for every foreign key flagged by the Supabase performance
-- advisor (applied to production via MCP on 2026-06-11).
create index if not exists idx_analytics_events_user_id        on public.analytics_events (user_id);
create index if not exists idx_assignments_teacher_id          on public.assignments (teacher_id);
create index if not exists idx_chat_sessions_student_id        on public.chat_sessions (student_id);
create index if not exists idx_chat_sessions_topic_id          on public.chat_sessions (topic_id);
create index if not exists idx_journey_steps_topic_id          on public.journey_steps (topic_id);
create index if not exists idx_learning_journeys_focus_topic   on public.learning_journeys (focus_topic_id);
create index if not exists idx_lessons_topic_id                on public.lessons (topic_id);
create index if not exists idx_marking_reports_student_id      on public.marking_reports (student_id);
create index if not exists idx_paper_chunks_paper_id           on public.paper_chunks (paper_id);
create index if not exists idx_question_attempts_question_id   on public.question_attempts (question_id);
create index if not exists idx_question_attempts_student_id    on public.question_attempts (student_id);
create index if not exists idx_questions_topic_id              on public.questions (topic_id);
create index if not exists idx_student_progress_topic_id       on public.student_progress (topic_id);
create index if not exists idx_teacher_student_links_student   on public.teacher_student_links (student_id);
create index if not exists idx_topics_parent_id                on public.topics (parent_id);
