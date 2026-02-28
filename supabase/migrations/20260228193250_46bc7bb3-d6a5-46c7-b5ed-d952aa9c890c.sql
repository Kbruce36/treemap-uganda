
CREATE TABLE public.tree_care_advice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  advice JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tree_care_advice ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tree care advice"
  ON public.tree_care_advice FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tree care advice"
  ON public.tree_care_advice FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tree care advice"
  ON public.tree_care_advice FOR DELETE
  USING (auth.uid() = user_id);
