-- Create the tree_care_advice table to store AI-generated survival advice
CREATE TABLE public.tree_care_advice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id UUID NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    advice JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply RLS
ALTER TABLE public.tree_care_advice ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own tree advice
CREATE POLICY "Users can view own tree advice"
    ON public.tree_care_advice FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own tree advice
CREATE POLICY "Users can insert own tree advice"
    ON public.tree_care_advice FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_tree_care_advice_updated_at
    BEFORE UPDATE ON public.tree_care_advice
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add index on tree_id for faster lookup
CREATE INDEX idx_tree_care_advice_tree_id ON public.tree_care_advice(tree_id);
-- Add index on user_id for faster lookup for user dashboard
CREATE INDEX idx_tree_care_advice_user_id ON public.tree_care_advice(user_id);
