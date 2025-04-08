"use client";

import { db } from "../utils/db.tsx";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";

const database = new db();
// Define the form schema with Zod
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

// Define the props for our component
interface AddItemDialogProps {
  buttonText?: string;
  dialogTitle?: string;
  dialogDescription?: string;
}

export default function FluxoButtonDialog({
  buttonText = "Adicionar Fluxo",
  dialogTitle = "Adicionar Fluxo",
  dialogDescription = "Adicione um fluxo de entrada ou saída para o banco de dados",
}: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayValue, setDisplayValue] = useState("$0.00");

  // Initialize the form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      data_fluxo_field: new Date(),
      valor_field: "$0.00",
      is_entrada_field: false,
      tipo_nome_field: "",
      categoria_nome_field: "",
      descricao_fluxo_field: "",
    },
  });

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

  // Handle form submission
  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      setIsSubmitting(true);
      await database.insertFluxo(values);
      // Reset form and close dialog
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsSubmitting(false);
      window.location.reload();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-green7 font-raleway text-lg rounded-lg px-2 py-1 bg-green2 hover:bg-green3 hover:cursor-pointer hover:shadow-lg active:border-green1 active:border-2">
          <PlusCircle className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] text-green8">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
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
                              "w-[240px] pl-3 text-left font-normal bg-green0 text-green8 hover:bg-green8 hover:text-green0",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Escolha a data</span>
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
                          disabled={(date: Date) =>
                            date < new Date("1900-01-01")
                          }
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
                          <SelectValue placeholder={"Selecione o tipo"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-green0 text-green8">
                        <SelectItem
                          className="hover:bg-green8 hover:text-green0"
                          value="Mensal"
                        >
                          Mensal
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-green8 hover:text-green0"
                          value="Diário"
                        >
                          Diário
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-green8 hover:text-green0"
                          value="Economia"
                        >
                          Economia
                        </SelectItem>
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
                          <SelectValue placeholder={"Selecione a categoria."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-green0 text-green8">
                        <SelectItem value="Uber">Uber</SelectItem>
                        <SelectItem value="Mercado">Mercado</SelectItem>
                        <SelectItem value="Farmácia">Farmácia</SelectItem>
                        <SelectItem value="Salário">Salário</SelectItem>
                        <SelectItem value="Restaurante">Restaurante</SelectItem>
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
                        placeholder="Descrição do fluxo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button
                  className="bg-red-del0 hover:bg-red-del1 hover:cursor-pointer transition"
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green8 text-green0 hover:bg-green7 hover:cursor-pointer transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
