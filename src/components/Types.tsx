import { z } from "zod";
import { FormSchema } from "./ActionsCell";

export type Fluxo = {
  id_fluxo: number;
  data_fluxo: string;
  valor: number;
  is_entrada: boolean;
  tipo: { tipo_nome: string };
  categoria_fluxo: { categoria_nome: string };
  descricao_fluxo: string;
};

export type FormsSchema = z.infer<typeof FormSchema>;
