import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uormsldzwpbrkppzgayt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcm1zbGR6d3BicmtwcHpnYXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODk1ODksImV4cCI6MjA1ODc2NTU4OX0.ETb-a4WA6wLbNmFSIW5VHC79TUDDOGc5dLNUMt8fq4U";
export const supabase = createClient(supabaseUrl, supabaseKey);

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
