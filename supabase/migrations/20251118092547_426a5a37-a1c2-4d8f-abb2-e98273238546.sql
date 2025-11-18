-- Add tree_count column to trees table
ALTER TABLE public.trees 
ADD COLUMN tree_count integer NOT NULL DEFAULT 1;

-- Add check constraint to ensure tree_count is positive
ALTER TABLE public.trees 
ADD CONSTRAINT tree_count_positive CHECK (tree_count > 0);