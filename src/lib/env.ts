const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const serverRequired = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'KAKAO_CLIENT_ID',
  'KAKAO_CLIENT_SECRET',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (typeof window === 'undefined') {
    for (const key of serverRequired) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}\nCheck .env.local file.`
    );
  }
}
