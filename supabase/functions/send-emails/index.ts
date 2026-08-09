// Supabase Edge Function: send-emails
// Deploy to: supabase functions deploy send-emails
// This handles welcome emails and newsletters server-side (API key never exposed to client)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const sentByUser = new Map<string, { day: string; count: number }>();

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin");
  const allowedOrigin = origin === "https://aurashape.app" || origin?.endsWith(".aurashape.pages.dev")
    ? origin
    : "https://aurashape.app";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;",
  }[character] || character));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { type, name } = await req.json();
    if (type !== "welcome") {
      return new Response(JSON.stringify({ error: "This endpoint only accepts authenticated welcome emails" }), {
        status: 403, headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const day = new Date().toISOString().slice(0, 10);
    const sent = sentByUser.get(user.id);
    if (sent && sent.day === day && sent.count >= 2) {
      return new Response(JSON.stringify({ error: "Email limit reached" }), {
        status: 429, headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }
    sentByUser.set(user.id, { day, count: sent?.day === day ? (sent.count + 1) : 1 });

    if (!user.email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400, headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    let from: string;
    let emailSubject: string;
    let body: string;

    if (type === "welcome") {
      from = "Aurashape <welcome@aurashape.app>";
      emailSubject = "Welcome to Aurashape! 🚀";
      body = `<h1>Welcome, ${escapeHtml(typeof name === "string" ? name.trim().slice(0, 80) : "there")}!</h1>
        <p>Your free health companion is ready. Start tracking your meals, fasting, and workouts today.</p>
        <p>Here are 3 things you can do right now:</p>
        <ol>
          <li><strong>Log your first meal</strong> — scan a barcode or search our database</li>
          <li><strong>Start a fast</strong> — try 16:8, the science-backed sweet spot</li>
          <li><strong>Read today's science tip</strong> — every tip cites a real study</li>
        </ol>
        <p>100% free. No ads. Privacy-first.</p>
        <p><a href="https://aurashape.app">aurashape.app</a></p>`;
    } else {
      throw new Error("Invalid type");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [user.email], subject: emailSubject, html: body }),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
