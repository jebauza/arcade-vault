export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

// Literal process.env.NEXT_PUBLIC_* access is required so Next.js inlines the values in the browser bundle.
export const getSupabaseEnv = (): SupabaseEnv => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!publishableKey) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return { url, publishableKey };
};
