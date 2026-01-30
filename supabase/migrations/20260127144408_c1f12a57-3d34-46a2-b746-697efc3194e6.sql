-- Create database webhook trigger for new user signup to send welcome emails
-- This will call the send-welcome-email edge function when a new profile is created

-- First, create a function to call the edge function
CREATE OR REPLACE FUNCTION public.notify_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload json;
  request_id bigint;
BEGIN
  -- Build the payload matching the expected format
  payload := json_build_object(
    'type', 'INSERT',
    'table', 'profiles',
    'schema', 'public',
    'record', row_to_json(NEW),
    'old_record', NULL
  );
  
  -- Call the edge function via http extension
  SELECT net.http_post(
    url := 'https://lxglyrcxoxkdmbhphcui.supabase.co/functions/v1/send-welcome-email',
    body := payload,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
    )::jsonb
  ) INTO request_id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_new_user_created ON public.profiles;
CREATE TRIGGER on_new_user_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user();