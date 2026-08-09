import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
}

export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email || null } : null;
}

export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  return (await getAuthenticatedUser(req))?.id || null;
}
