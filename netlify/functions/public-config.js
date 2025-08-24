// Netlify Function: gibt SUPABASE_URL & SUPABASE_ANON_KEY als JSON aus
exports.handler = async () => {
  const body = {
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || null,
  };

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
};