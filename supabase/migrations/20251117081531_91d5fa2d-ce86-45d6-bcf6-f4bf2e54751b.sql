-- Create storage bucket for tree images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tree-images', 'tree-images', true);

-- Create storage policies for tree images
CREATE POLICY "Anyone can view tree images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tree-images');

CREATE POLICY "Authenticated users can upload tree images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tree-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own tree images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tree-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own tree images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tree-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add image columns to trees table
ALTER TABLE trees
ADD COLUMN image_1 text,
ADD COLUMN image_2 text,
ADD COLUMN image_3 text;