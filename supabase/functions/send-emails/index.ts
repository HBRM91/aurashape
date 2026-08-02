// Supabase Edge Function: send-emails
// Deploy to: supabase functions deploy send-emails
// This handles welcome emails and newsletters server-side (API key never exposed to client)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, email, name, subject, html } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let from: string;
    let emailSubject: string;
    let body: string;

    if (type === "welcome") {
      from = "Aurashape <welcome@aurashape.app>";
      emailSubject = "Welcome to Aurashape! 🚀";
      body = `<h1>Welcome, ${name || "there"}!</h1>
        <p>Your free health companion is ready. Start tracking your meals, fasting, and workouts today.</p>
        <p>Here are 3 things you can do right now:</p>
        <ol>
          <li><strong>Log your first meal</strong> — scan a barcode or search our database</li>
          <li><strong>Start a fast</strong> — try 16:8, the science-backed sweet spot</li>
          <li><strong>Read today's science tip</strong> — every tip cites a real study</li>
        </ol>
        <p>100% free. No ads. Privacy-first.</p>
        <p><a href="https://aurashape.app">aurashape.app</a></p>`;
    } else if (type === "newsletter") {
      from = "Aurashape <newsletter@aurashape.app>";
      emailSubject = subject || "This Week in Science — Aurashape";
      body = html || "<p>No content provided.</p>";
    } else if (type === "unsubscribe") {
      from = "Aurashape <newsletter@aurashape.app>";
      emailSubject = "Unsubscribed from Aurashape Newsletter";
      body = `<p>You have been unsubscribed from the Aurashape newsletter.</p>
        <p>You will no longer receive weekly science tips from us.</p>
        <p>If this was a mistake, you can resubscribe in the app settings.</p>
        <p>— The Aurashape Team</p>`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [email], subject: emailSubject, html: body }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
