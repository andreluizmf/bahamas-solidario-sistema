import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const key =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || "";
  if (key.startsWith("sb_secret_"))
    throw new Error("Uma chave secreta não pode ser exposta no frontend.");
  if (key.split(".").length === 3) {
    try {
      if (
        JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role ===
        "service_role"
      )
        throw new Error("service_role não pode ser exposta no frontend.");
    } catch (error) {
      if (error.message.includes("service_role")) throw error;
    }
  }
  if (env.VERCEL_ENV === "production" && (!env.VITE_SUPABASE_URL || !key)) {
    throw new Error(
      "Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY antes de publicar em produção.",
    );
  }
  return { plugins: [react()] };
});
