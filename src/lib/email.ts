const FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-emails`;

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'welcome', email, name }),
    });
  } catch {}
}

export async function sendNewsletter(email: string, subject: string, html: string) {
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
