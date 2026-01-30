import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    user_id: string;
    anonymous_id: string;
    color_index: number;
    shape_index: number;
    created_at: string;
    updated_at: string;
  };
  schema: string;
  old_record: null | Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received webhook request");
    
    const payload: WebhookPayload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload));

    // Only process INSERT events on profiles table (new user signup)
    if (payload.type !== "INSERT" || payload.table !== "profiles") {
      console.log("Ignoring non-INSERT event or wrong table");
      return new Response(
        JSON.stringify({ message: "Ignored - not a new profile" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userId = payload.record.user_id;
    console.log("Processing new user:", userId);

    // Get user email from auth.users using admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      return new Response(
        JSON.stringify({ error: "Could not retrieve user email" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const userEmail = userData.user.email;
    console.log("Sending welcome email to:", userEmail);

    // Send welcome email using Resend API directly
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "IntrovertChatter <onboarding@resend.dev>",
        to: [userEmail],
        subject: "Welcome to IntrovertChatter",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi,</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Welcome to IntrovertChatter.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">You successfully signed in without making small talk. We respect that.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">This space was built for people who think a lot, say little, and avoid phone calls whenever possible.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;"><strong>You are not weird. You are just quiet — professionally.</strong></p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">We're glad you're here.</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-top: 40px; color: #666;">— Team IntrovertChatter</p>
          </div>
        `,
      }),
    });

    const emailData = await emailResponse.json();
    console.log("Welcome email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-welcome-email function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
