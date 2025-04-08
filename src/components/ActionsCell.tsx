import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
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

import { db } from "../utils/db.tsx";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Trash, Pencil } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Fluxo } from "./Types.tsx";

export const FormSchema = z.object({
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

export function ActionsCell({ row }: { row: Fluxo }) {
  const database = new db();

  interface Tipo {
    tipo_nome: string;
  }

  interface Categoria {
    categoria_nome: string;
  }

  const fluxo_original = row; // Get the original date object from the row
  const [displayValue, setDisplayValue] = useState(
    fluxo_original.valor.toString()
  );
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  console.log(fluxo_original.data_fluxo);
  console.log(dateParse(fluxo_original.data_fluxo));

  async function fetchData() {
    const categorias = await database.getCategorias();
    if (!categorias) {
      console.error("erro nas categorias");
    }
    const tipos = await database.getTipos();
    if (!tipos) {
      console.error("erro nos tipos");
    }
    console.log(categorias);
    console.log(tipos);
    setTipos(tipos ? tipos : []);
    setCategorias(categorias ? categorias : []);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema), // Pass only the schema here
    defaultValues: {
      data_fluxo_field: dateParse(fluxo_original.data_fluxo), // Set the default value for the "dob" field
      valor_field: fluxo_original.valor.toString(),
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
    valor_field: fluxo_original.valor.toString(),
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
    console.log(fluxo_original.valor.toString().replace("$", ""));
    await database.updateFluxo(fluxo_original.id_fluxo, data, original_values);
    window.location.reload();
  }

  function dateParse(date: string) {
    const dateTest = new Date(date); // Convert the string to a UTC date object and subtract one day
    const day = dateTest.getDate() + 1; // Subtract one day
    dateTest.setDate(day); // Set the new date
    return dateTest;
  }

  async function handleDelete(id_fluxo: number) {
    try {
      setIsDeleting(true);
      const data = await database.deleteFluxo(id_fluxo);
      if (data) console.log("Deletado", data);
      else console.error("Erro ao deletar");
      setOpen(false);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
      window.location.reload();
    }
  }

  return (
    <div className="flex justify-center gap-7 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="bg-green3 hover:bg-green4 hover:cursor-pointer text-green8"
          >
            <Pencil />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
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
                                "w-[240px] pl-3 text-left font-normal text-green8 hover:bg-green8 hover:text-green0",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-60" />
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
                          className="hover:bg-green8 hover:text-green0 file:bg_green8 file:text:green0"
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
                          <SelectTrigger className="hover:bg-green8 hover:text-green0">
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-green0 text-green8">
                          {tipos.map((tipo) => {
                            return (
                              <SelectItem
                                className="hover:bg-green8 hover:text-green0"
                                value={tipo.tipo_nome}
                              >
                                {tipo.tipo_nome}
                              </SelectItem>
                            );
                          })}
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
                          <SelectTrigger className="hover:bg-green8 hover:text-green0">
                            <SelectValue placeholder={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-green0 text-green8">
                          {(categorias || []).map((categoria) => {
                            return (
                              <SelectItem
                                className="hover:bg-green8 hover:text-green0"
                                value={categoria.categoria_nome}
                              >
                                {categoria.categoria_nome}
                              </SelectItem>
                            );
                          })}
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
                          className="bg-green2 border-green3 [state=checked]:bg-green8"
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
                          className="hover:bg-green8 hover:text-green0"
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
        onClick={() => setOpen(true)}
        size="icon"
        className="bg-red-del0 hover:bg-red-del1 hover:cursor-pointer"
      >
        <Trash />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md font-raleway">
          <DialogHeader>
            <DialogTitle className="text-green8">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-green7/80">
              Tem certeza que quer deletar esse fluxo? Essa ação não pode ser
              desfeita
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="bg-green8 text-green0 hover:text-green0 cursor-pointer hover:bg-green7 transition"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-del0 hover:bg-red-del1 hover:cursor-pointer transition"
              variant="destructive"
              onClick={async () => await handleDelete(fluxo_original.id_fluxo)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
