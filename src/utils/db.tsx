import { createClient, PostgrestError } from "@supabase/supabase-js";
import { FormsSchema, Fluxo } from "../components/Types";
import { format } from "date-fns";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
export const admin = createClient(supabaseUrl, supabaseAdminKey);
export class db {
  async getFluxo(): Promise<{
    data: null | Fluxo[];
    error: null | PostgrestError;
  }> {
    const uid = await this.getUserID();
    console.log(uid);
    const { data, error } = await supabase
      .from("fluxo")
      .select(
        `
          id_fluxo,
          data_fluxo,
          valor,
          tipo(tipo_nome),
          categoria_fluxo(categoria_nome),
          descricao_fluxo,
          is_entrada
        `
      )
      .eq("id_pessoa", uid);
    if (error) {
      console.error("Error fetching" + error);
      return { data, error };
    }
    console.log("Data fetched successfully:", data);
    return { data, error };
  }

  fluxo_equals(o: FormsSchema, d: FormsSchema) {
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

  async updateFluxo(id_fluxo: number, d: FormsSchema, o: FormsSchema) {
    if (this.fluxo_equals(d, o)) {
      console.error("Nenhum valor alterado");
      return;
    }

    console.log(d.data_fluxo_field);
    console.log(o.data_fluxo_field);

    const data_fluxo = format(d.data_fluxo_field, "yyyy-MM-dd");
    console.log(data_fluxo);
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
    }
    if (error3) {
      console.error(error3);
      return;
    }

    const { data: id_tipo_quary, error: error2 } = await supabase
      .from("tipo")
      .select("id_tipo")
      .eq("tipo_nome", d.tipo_nome_field);
    if (id_tipo_quary) {
      console.log("foi");
      id_tipo = id_tipo_quary[0].id_tipo;
    }
    if (error2) {
      console.error(error2);
      return;
    }

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

  async getCategorias() {
    const { data, error } = await supabase
      .from("categoria_fluxo")
      .select("categoria_nome");
    if (error) {
      console.error("Error fetching categories: ", error);
      return;
    }
    return data;
  }

  async getTipos() {
    const { data, error } = await supabase.from("tipo").select("tipo_nome");
    if (error) {
      console.error("Error fetching types: ", error);
      return;
    }
    return data;
  }

  getUserID = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const userId = session.user.id;
      console.log(userId);
      console.log(typeof userId);
      return userId;
    } else {
      console.error("O usuário não está logado");
      return null;
    }
  };

  getNome = async (id_pessoa: string) => {
    const { data, error } = await supabase
      .from("pessoa")
      .select("nome")
      .eq("id_pessoa", id_pessoa)
      .single();
    if (error) {
      console.error("erro ao pegar nome", error);
      return null;
    }
    if (data) return data.nome;
    else {
      console.error("Usuário não logado");
      return "";
    }
  };

  updateNome = async (id_pessoa: string, nome: string) => {
    console.log(id_pessoa, nome);
    const { data, error } = await supabase
      .from("pessoa")
      .update({ nome })
      .eq("id_pessoa", id_pessoa);
    if (error) {
      console.error("erro ao atualizar nome", error);
      return { data, error };
    }
    if (data) return { data, error };
    else {
      console.error("Usuário não logado");
      return { data, error };
    }
  };

  excluiConta = async (id_pessoa: string) => {
    const { data, error } = await admin.auth.admin.deleteUser(id_pessoa);
    if (error) {
      console.error("Erro deletando conta: ", id_pessoa, ":", error);
      return;
    }
    return data;
  };

  async insertFluxo(d: FormsSchema) {
    const id_pessoa = await this.getUserID();
    console.log(id_pessoa);

    if (!id_pessoa) {
      console.error("Erro inserindo dados, usuário não logado!");
    } else {
      const data_fluxo = format(d.data_fluxo_field, "yyyy-MM-dd");
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
      } else if (error3) {
        console.error(error3);
        return;
      }

      const { data: id_tipo_quary, error: error2 } = await supabase
        .from("tipo")
        .select("id_tipo")
        .eq("tipo_nome", d.tipo_nome_field);
      if (id_tipo_quary) {
        console.log("foi");
        id_tipo = id_tipo_quary[0].id_tipo;
      } else if (error2) {
        console.error(error2);
        return;
      }

      const { error } = await supabase.from("fluxo").insert({
        id_pessoa,
        id_categoria,
        id_tipo,
        descricao_fluxo,
        data_fluxo,
        valor,
        is_entrada,
      });

      if (error) {
        console.error("Erro inserindo dados: ", error);
        return;
      }
    }
  }
}
