-- Fix matching_queue RLS: Users should only see their own queue entries
DROP POLICY IF EXISTS "Authenticated users can view queue" ON public.matching_queue;

CREATE POLICY "Users can view own queue entries" 
ON public.matching_queue 
FOR SELECT 
USING (auth.uid() = user_id);