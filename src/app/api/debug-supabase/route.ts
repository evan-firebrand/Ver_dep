import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let queryResult: unknown = null;
  let queryError: unknown = null;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select('id, name')
      .limit(3);
    queryResult = data;
    queryError = error;
  } catch (err) {
    queryError = String(err);
  }

  return Response.json({
    envVarsPresent: { url: !!url, key: !!key },
    urlPrefix: url?.slice(0, 30),
    keyPrefix: key?.slice(0, 20),
    queryResult,
    queryError,
  });
}
