-- Create tsvector columns with generated indexes for full text search
ALTER TABLE "PackMedia" ADD COLUMN IF NOT EXISTS "textsearchable_index_col" tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, ''))) STORED;

ALTER TABLE "PackCharacter" ADD COLUMN IF NOT EXISTS "textsearchable_index_col" tsvector 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(name, ''))) STORED;

-- Create GIN indexes on the tsvector columns for efficient full text search
CREATE INDEX IF NOT EXISTS "PackMedia_textsearchable_index_col_idx" 
  ON "PackMedia" USING GIN ("textsearchable_index_col");

CREATE INDEX IF NOT EXISTS "PackCharacter_textsearchable_index_col_idx" 
  ON "PackCharacter" USING GIN ("textsearchable_index_col");