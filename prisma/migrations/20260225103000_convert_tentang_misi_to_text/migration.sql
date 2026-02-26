-- Convert TentangVisiMisi.misi from JSONB to TEXT
-- If previous value is an array, join each item with newline.
-- If previous value is a JSON string/scalar, convert to plain text.
ALTER TABLE "TentangVisiMisi"
ALTER COLUMN "misi" TYPE TEXT
-- USING (
--   CASE
--     WHEN jsonb_typeof("misi") = 'array' THEN (
--       SELECT string_agg(value, E'\n')
--       FROM jsonb_array_elements_text("misi") AS value
--     )
--     WHEN jsonb_typeof("misi") = 'string' THEN "misi" #>> '{}'
--     ELSE "misi"::text
--   END
-- )
;
