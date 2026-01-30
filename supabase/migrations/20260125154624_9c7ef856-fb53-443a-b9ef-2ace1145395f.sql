-- IntrovertChatter Database Schema
-- Anonymous social platform for introverts

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Profiles table (anonymous identities)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  anonymous_id TEXT NOT NULL UNIQUE,
  color_index INT NOT NULL DEFAULT floor(random() * 6 + 1)::int,
  shape_index INT NOT NULL DEFAULT floor(random() * 6 + 1)::int,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MOOD ROOMS & POSTS
-- ============================================

-- Room types enum
CREATE TYPE public.mood_room AS ENUM (
  'overthinking',
  'social_anxiety',
  'work_stress',
  'lonely',
  'small_wins',
  '2am_thoughts'
);

-- Reaction types enum
CREATE TYPE public.reaction_type AS ENUM (
  'i_relate',
  'heard_you',
  'sending_strength'
);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room mood_room NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Post policies
CREATE POLICY "Anyone can view posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Reactions table
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Reaction policies
CREATE POLICY "Anyone can view reactions" ON public.reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can react" ON public.reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON public.reactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MATCHING SYSTEM
-- ============================================

-- Matching queue
CREATE TABLE public.matching_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mood TEXT NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on matching_queue
ALTER TABLE public.matching_queue ENABLE ROW LEVEL SECURITY;

-- Matching queue policies
CREATE POLICY "Users can view queue" ON public.matching_queue
  FOR SELECT USING (true);

CREATE POLICY "Users can enter queue" ON public.matching_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave queue" ON public.matching_queue
  FOR DELETE USING (auth.uid() = user_id);

-- Chat session status enum
CREATE TYPE public.chat_status AS ENUM (
  'prompting',
  'chatting',
  'ended'
);

-- Chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status chat_status NOT NULL DEFAULT 'prompting',
  prompt_index INT NOT NULL DEFAULT 0,
  reconnect_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chat_started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Chat session policies
CREATE POLICY "Users can view own sessions" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can update own sessions" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Authenticated users can create sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Prompt responses table
CREATE TABLE public.prompt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_index INT NOT NULL,
  response TEXT NOT NULL CHECK (length(response) <= 500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id, prompt_index)
);

-- Enable RLS on prompt_responses
ALTER TABLE public.prompt_responses ENABLE ROW LEVEL SECURITY;

-- Prompt response policies (users in session can see)
CREATE POLICY "Session participants can view responses" ON public.prompt_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
      AND (cs.user_a = auth.uid() OR cs.user_b = auth.uid())
    )
  );

CREATE POLICY "Users can submit responses" ON public.prompt_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Message policies
CREATE POLICY "Session participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
      AND (cs.user_a = auth.uid() OR cs.user_b = auth.uid())
    )
  );

CREATE POLICY "Session participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
      AND cs.status = 'chatting'
      AND (cs.user_a = auth.uid() OR cs.user_b = auth.uid())
    )
  );

-- ============================================
-- SANCTUARY (Private Journal)
-- ============================================

-- Sanctuary entries table
CREATE TABLE public.sanctuary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 2000),
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sanctuary_entries
ALTER TABLE public.sanctuary_entries ENABLE ROW LEVEL SECURITY;

-- Sanctuary policies (completely private)
CREATE POLICY "Users can view own entries" ON public.sanctuary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries" ON public.sanctuary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.sanctuary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.sanctuary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SAVED INSIGHTS
-- ============================================

CREATE TABLE public.saved_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'post',
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_insights
ALTER TABLE public.saved_insights ENABLE ROW LEVEL SECURITY;

-- Saved insights policies
CREATE POLICY "Users can view own insights" ON public.saved_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save insights" ON public.saved_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.saved_insights
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sanctuary_entries_updated_at
  BEFORE UPDATE ON public.sanctuary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate anonymous ID
CREATE OR REPLACE FUNCTION public.generate_anonymous_id()
RETURNS TEXT AS $$
DECLARE
  shapes TEXT[] := ARRAY['Prism', 'Sphere', 'Node', 'Cube', 'Helix', 'Wave'];
  prefixes TEXT[] := ARRAY['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta', 'Zeta'];
  random_num TEXT;
BEGIN
  random_num := lpad(floor(random() * 100)::text, 2, '0');
  RETURN shapes[floor(random() * 6 + 1)::int] || '-' || 
         prefixes[floor(random() * 6 + 1)::int] || 
         random_num;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, anonymous_id)
  VALUES (NEW.id, public.generate_anonymous_id());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_posts_room ON public.posts(room);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_sanctuary_entries_user_id ON public.sanctuary_entries(user_id);
CREATE INDEX idx_sanctuary_entries_created_at ON public.sanctuary_entries(created_at DESC);
CREATE INDEX idx_matching_queue_mood ON public.matching_queue(mood);

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matching_queue;