"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { ActionsCell } from "./ActionsCell";
import { Fluxo } from "./Types";

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-");
  const newDate = `${day}/${month}/${year}`;
  return newDate;
};

export const columns: ColumnDef<Fluxo>[] = [
  {
    accessorKey: "data_fluxo",
    header: "Data",
    cell: ({ row }: { row: Row<Fluxo> }) => (
      <p>{formatDate(row.original.data_fluxo)}</p>
    ),
  },
  {
    accessorKey: "valor",
    header: "Valor",
  },
  {
    accessorKey: "tipo.tipo_nome",
    header: "Tipo",
  },
  {
    accessorKey: "categoria_fluxo.categoria_nome",
    header: "Categoria",
  },
  {
    accessorKey: "descricao_fluxo",
    header: "Descrição",
  },
  {
    id: "actions",
    cell: ({ row }: { row: Row<Fluxo> }) => <ActionsCell row={row.original} />,
  },
];
