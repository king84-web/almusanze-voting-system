-- Add new columns to candidate_applications for party, leadership, and intent details
ALTER TABLE candidate_applications
  ADD COLUMN party text NOT NULL DEFAULT '';

ALTER TABLE candidate_applications
  ADD COLUMN previous_leadership_positions text NOT NULL DEFAULT '';

ALTER TABLE candidate_applications
  ADD COLUMN letter_of_intent text NOT NULL DEFAULT '';
