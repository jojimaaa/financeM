"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { db } from "../../utils/db.tsx";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Trash, Pencil } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useState } from "react";

export type Fluxo = {
  id_fluxo: number;
  data_fluxo: string;
  valor: number;
  tipo: { tipo_nome: string };
  categoria_fluxo: { categoria_nome: string };
  descricao_fluxo: string;
  is_entrada: boolean;
};

export const columns: ColumnDef<Fluxo>[] = [
  {
    accessorKey: "data_fluxo",
    header: "Data",
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
    cell: ({ row }: { row: any }) => <ActionsCell row={row} />,
  },
];

const database = new db();
function ActionsCell({ row }: { row: any }) {
  const fluxo_original = row.original; // Get the original date object from the row
  const [displayValue, setDisplayValue] = useState(fluxo_original.valor);
  const FormSchema = z.object({
    data_fluxo_field: z.date({
      required_error: "A date of birth is required.",
    }),
    valor_field: z
      .string()
      .min(1, { message: "Valor é obrigatório" })
      .refine(
        (val) => {
          // Remove currency symbols and commas for validation
          const numericValue = val.replace(/[R$,.\s]/g, "").replace(",", ".");
          return !isNaN(Number(numericValue)) && isFinite(Number(numericValue));
        },
        { message: "Por favor, insira um valor válido" }
      )
      .transform((val) => {
        // For internal use, keep as string
        return val;
      }),
    is_entrada_field: z.boolean(),
    tipo_nome_field: z.string(),
    categoria_nome_field: z.string(),
    descricao_fluxo_field: z.string(),
  });

  console.log(fluxo_original.data_fluxo);
  console.log(dateParse(fluxo_original.data_fluxo));

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema), // Pass only the schema here
    defaultValues: {
      data_fluxo_field: dateParse(fluxo_original.data_fluxo), // Set the default value for the "dob" field
      valor_field: fluxo_original.valor,
      is_entrada_field: fluxo_original.is_entrada,
      tipo_nome_field: fluxo_original.tipo.tipo_nome,
      categoria_nome_field: fluxo_original.categoria_fluxo.categoria_nome,
      descricao_fluxo_field: fluxo_original.descricao_fluxo,
    },
  });

  interface objTypes {
    data_fluxo_field: Date;
    valor_field: string;
    is_entrada_field: boolean;
    tipo_nome_field: string;
    categoria_nome_field: string;
    descricao_fluxo_field: string;
  }

  const original_values: objTypes = {
    data_fluxo_field: dateParse(fluxo_original.data_fluxo), // Set the default value for the "dob" field
    valor_field: fluxo_original.valor,
    is_entrada_field: fluxo_original.is_entrada,
    tipo_nome_field: fluxo_original.tipo.tipo_nome,
    categoria_nome_field: fluxo_original.categoria_fluxo.categoria_nome,
    descricao_fluxo_field: fluxo_original.descricao_fluxo,
  };

  const formatAsCurrency = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9,]/g, "");

    // Format with commas for thousands and decimal
    let formatted = "";
    if (numericValue) {
      // Format as Brazilian currency (R$)
      const number = numericValue.replace(/\D/g, "");
      formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(Number(number) / 100);
    }
    return formatted;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const rawValue = e.target.value;

    // If the user is deleting the $ sign, clear the input
    if (rawValue === "") {
      setDisplayValue("");
      onChange("");
      return;
    }

    // Format the value
    const formatted = formatAsCurrency(rawValue);
    setDisplayValue(formatted);

    // Pass the raw value to react-hook-form
    onChange(formatted);
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(fluxo_original.valor.replace("$", ""));
    console.log(z.coerce.number().parse(fluxo_original.valor.replace("$", "")));
    database.updateFluxo(fluxo_original.id_fluxo, data, original_values);
  }

  function dateParse(date: string) {
    const dateTest = new Date(date); // Convert the string to a UTC date object and subtract one day
    const day = dateTest.getDate() + 1; // Subtract one day
    dateTest.setDate(day); // Set the new date
    return dateTest;
  }

  return (
    <div className="flex justify-center gap-7 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="bg-green1 hover:bg-green2 hover:cursor-pointer text-green8"
          >
            <Pencil />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-green1">
          <div className="space-y-2">
            <h4 className="font-raleway leading-none">Editar Fluxo</h4>
            <p className="text-sm text-green8/60">
              Edite as informações do fluxo selecionado.
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full grid gap-4 font-raleway"
            >
              <div className="grid-rows-5 gap-4">
                <FormField
                  control={form.control}
                  name="data_fluxo_field"
                  render={({ field }) => (
                    <FormItem className="flex flex-row justify-start items-center my-1">
                      <Label>Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_field"
                  render={({ field }) => (
                    <FormItem className="w-full flex justify-start items-center my-1">
                      <Label>Valor</Label>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          defaultValue={displayValue}
                          onChange={(e) => handleInputChange(e, field.onChange)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_nome_field"
                  render={({ field }) => (
                    <FormItem className="w-full flex justify-start items-center my-1">
                      <Label>Tipo</Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mensal">Mensal</SelectItem>
                          <SelectItem value="Diário">Diário</SelectItem>
                          <SelectItem value="Economia">Economia</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria_nome_field"
                  render={({ field }) => (
                    <FormItem className="w-full flex justify-start items-center my-1">
                      <Label>Categoria</Label>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Uber">Uber</SelectItem>
                          <SelectItem value="Mercado">Mercado</SelectItem>
                          <SelectItem value="Farmácia">Farmácia</SelectItem>
                          <SelectItem value="Salário">Salário</SelectItem>
                          <SelectItem value="Restaurante">
                            Restaurante
                          </SelectItem>
                          <SelectItem value="Transporte público">
                            Transporte público
                          </SelectItem>
                          <SelectItem value="Educação">Educação</SelectItem>
                          <SelectItem value="Saúde">Saúde</SelectItem>
                          <SelectItem value="Lazer">Lazer</SelectItem>
                          <SelectItem value="Viagem">Viagem</SelectItem>
                          <SelectItem value="Compras online">
                            Compras online
                          </SelectItem>
                          <SelectItem value="Conta de água">
                            Conta de água
                          </SelectItem>
                          <SelectItem value="Prestações">Prestações</SelectItem>
                          <SelectItem value="Impostos">Impostos</SelectItem>
                          <SelectItem value="Reserva de Emergência">
                            Reserva de Emergência
                          </SelectItem>
                          <SelectItem value="Investimentos">
                            Investimentos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_entrada_field"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 border rounded-md p-1">
                      <FormControl>
                        <Checkbox
                          className="bg-green1 [state=checked]:bg-green8"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 text-sm leading-none">
                        Entrada
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao_fluxo_field"
                  render={({ field }) => (
                    <FormItem className="w-full flex justify-start items-center my-1">
                      <Label>Descrição</Label>
                      <FormControl>
                        <Input
                          placeholder={fluxo_original.descricao_fluxo}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="bg-green8">
                Salvar
              </Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
      <Button
        size="icon"
        className="bg-red-del0 hover:bg-red-del1 hover:cursor-pointer"
      >
        <Trash />
      </Button>
    </div>
  );
}
