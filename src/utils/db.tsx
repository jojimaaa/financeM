import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export class db {
  async getFluxo() {
    const { data, error } = await supabase.from("fluxo").select(
      `
          id_fluxo,
          tipo(tipo_nome)
        `
    );
    if (error) {
      console.error("Error fetching" + error);
      return;
    }
    return data;
  }
}
