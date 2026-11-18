import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { createTeamHandler } from "./handler.js";

// A função valida o JWT com Auth e consulta administrators antes de usar a chave de serviço.
Deno.serve(
  createTeamHandler({ createClient, env: (key: string) => Deno.env.get(key) }),
);
