-- Fix security issues: Require authentication for viewing sensitive data

-- 1. Fix profiles table: Require auth for viewing profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Fix matching_queue table: Require auth for viewing queue
DROP POLICY IF EXISTS "Users can view queue" ON public.matching_queue;
CREATE POLICY "Authenticated users can view queue" 
ON public.matching_queue 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Fix posts table: Require auth for viewing posts
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Authenticated users can view posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Fix reactions table: Require auth for viewing reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;
CREATE POLICY "Authenticated users can view reactions" 
ON public.reactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);