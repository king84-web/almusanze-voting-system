-- Add new position values to the position_title enum
ALTER TYPE "public"."position_title" ADD VALUE 'president';
ALTER TYPE "public"."position_title" ADD VALUE 'vice_president';

-- Note: After migration, you'll need to:
-- 1. Update existing data from 'president_vp' to either 'president' or 'vice_president'
-- 2. Remove the old 'president_vp' value (this requires creating a new type and casting)
