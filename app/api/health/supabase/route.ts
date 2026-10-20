import { createClient } from "@/lib/supabase/server";
import type { SupabaseHealthResult } from "./types";

const respond = (result: SupabaseHealthResult, status: number): Response =>
  Response.json(result, { status });

export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase health check: getSession failed", error);
      return respond({ status: "error" }, 500);
    }
    return respond({ status: "ok" }, 200);
  } catch (cause) {
    console.error("Supabase health check: unexpected failure", cause);
    return respond({ status: "error" }, 500);
  }
}
