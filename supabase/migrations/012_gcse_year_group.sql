-- Allow GCSE year groups in topics table
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_year_group_check;
ALTER TABLE topics ADD CONSTRAINT topics_year_group_check
  CHECK (year_group IN ('AS', 'A2', 'Y10', 'Y11'));
