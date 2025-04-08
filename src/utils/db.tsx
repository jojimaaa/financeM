import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabaseUrl = "https://uormsldzwpbrkppzgayt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcm1zbGR6d3BicmtwcHpnYXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODk1ODksImV4cCI6MjA1ODc2NTU4OX0.ETb-a4WA6wLbNmFSIW5VHC79TUDDOGc5dLNUMt8fq4U";
export const supabase = createClient(supabaseUrl, supabaseKey);

const FluxoFormSchema = z.object({
  data_fluxo_field: z.date({
    required_error: "A date of birth is required.",
  }),
  valor_field: z.string(),
  is_entrada_field: z.boolean(),
  tipo_nome_field: z.string(),
  categoria_nome_field: z.string(),
  descricao_fluxo_field: z.string(),
});

export class db {
  async getFluxo() {
    const { data, error } = await supabase.from("fluxo").select(
      `
          id_fluxo,
          data_fluxo,
          valor,
          tipo(tipo_nome),
          categoria_fluxo(categoria_nome),
          descricao_fluxo,
          is_entrada
        `
    );
    if (error) {
      console.error("Error fetching" + error);
      return;
    }
    console.log("Data fetched successfully:", data);
    return data;
  }

  fluxo_equals(
    o: z.infer<typeof FluxoFormSchema>,
    d: z.infer<typeof FluxoFormSchema>
  ) {
    if (
      o.data_fluxo_field != d.data_fluxo_field ||
      o.valor_field != d.valor_field ||
      o.is_entrada_field != d.is_entrada_field ||
      o.tipo_nome_field != d.tipo_nome_field ||
      o.categoria_nome_field != d.categoria_nome_field ||
      o.descricao_fluxo_field != d.descricao_fluxo_field
    )
      return false;
    return true;
  }

  async updateFluxo(
    id_fluxo: number,
    d: z.infer<typeof FluxoFormSchema>,
    o: z.infer<typeof FluxoFormSchema>
  ) {
    if (this.fluxo_equals(d, o)) {
      console.error("Nenhum valor alterado");
      return;
    }

    const data_fluxo = d.data_fluxo_field.toISOString().split("T")[0];
    const valor = d.valor_field;

    const is_entrada = d.is_entrada_field;

    let id_categoria, id_tipo;

    const descricao_fluxo = d.descricao_fluxo_field;

    const { data: id_categ_quary, error: error3 } = await supabase
      .from("categoria_fluxo")
      .select("id_categoria")
      .eq("categoria_nome", d.categoria_nome_field);
    if (id_categ_quary) {
      console.log("foi2");
      id_categoria = id_categ_quary[0].id_categoria;
    } else return;

    const { data: id_tipo_quary, error: error2 } = await supabase
      .from("tipo")
      .select("id_tipo")
      .eq("tipo_nome", d.tipo_nome_field);
    if (id_tipo_quary) {
      console.log("foi");
      id_tipo = id_tipo_quary[0].id_tipo;
    } else return;

    const { data, error } = await supabase
      .from("fluxo")
      .update({
        id_tipo,
        id_categoria,
        data_fluxo,
        valor,
        is_entrada,
        descricao_fluxo,
      })
      .eq("id_fluxo", id_fluxo)
      .select();
    console.log(data);
    console.log(error);
    return data;
  }

  async deleteFluxo(id_fluxo: number) {
    const { data, error } = await supabase
      .from("fluxo")
      .delete()
      .eq("id_fluxo", id_fluxo);
    if (error) {
      console.error("Erro deletando fluxo: ", id_fluxo, ":", error);
      return;
    }
    return data;
  }
}
