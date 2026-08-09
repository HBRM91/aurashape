const FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-emails`;
import { isLocalOnly } from './privacyMode';

export async function sendWelcomeEmail(name: string, accessToken?: string) {
  if (isLocalOnly() || !accessToken) return;
  try {
    await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'welcome', name }),
    });
  } catch {}
}

export async function sendNewsletter(email: string, subject: string, html: string) {
  if (isLocalOnly()) return;
  try {
    await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'newsletter', email, subject, html }),
    });
  } catch {}
}

export async function sendUnsubscribeEmail(email: string) {
  if (isLocalOnly()) return;
  try {
    await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'unsubscribe', email }),
    });
  } catch {}
}
