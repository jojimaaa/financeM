"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { User, Save, Trash2 } from "lucide-react";
import { db, supabase } from "../utils/db.tsx";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const accountFormSchema = z.object({
  nome: z
    .string()
    .min(2, {
      message: "Nome deve ter pelo menos 2 caracteres.",
    })
    .max(30, {
      message: "Nome não deve ter mais de 30 caracteres.",
    }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function AccountSettingsForm() {
  let nome = "";
  const navigate = useNavigate();
  const database = new db();
  const [nomeuser, setNomeuser] = useState(nome);
  const [userid, setUserid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getUser = async () => {
    const userId = await database.getUserID();
    if (userId) {
      setUserid(userId);
      nome = await database.getNome(userId);
      console.log(nome, typeof nome);
      if (nome) setNomeuser(nome);
      else console.error("Erro ao buscar nome");
    } else {
      console.error("O usuário não está logado");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // This simulates the default values that would come from a database
  const defaultValues: Partial<AccountFormValues> = {
    nome: nomeuser,
  };

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: AccountFormValues) {
    setIsLoading(true);

    const { error } = await database.updateNome(userid, data.nome);
    setIsLoading(false);
    if (error) {
      console.error(error);
    }
    window.location.reload();
  }

  async function handleDeleteAccount() {
    setIsLoading(true);
    const { error } = await database.excluiConta(userid);
    setIsLoading(false);
    if (error) {
      console.error(error);
    }
    const { error2 } = await supabase.auth.signOut();
    if (error2) {
      console.error("Erro ao deslogar:", error2.message);
    } else {
      console.log("Usuário deslogado com sucesso!");
      navigate("/");
      window.location.reload();
    }
  }

  console.log(nomeuser);
  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações da Conta
          </h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta.
          </p>
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize as informações do seu perfil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-8"
                            placeholder={nomeuser}
                            defaultValue={nomeuser}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Este é o seu nome de exibição público.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Dialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-del0 hover:red-del1 transitions hover:cursor-pointer text-green0"
                      type="button"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Você tem certeza?</DialogTitle>
                      <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá
                        permanentemente sua conta e removerá seus dados de
                        nossos servidores.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        className="bg-green0 hover:bg-green1 text-green8 transition hover:cursor-pointer"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-del0 transition hover:red-del1 hover:cursor-pointer text-green0"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                      >
                        {isLoading
                          ? "Excluindo..."
                          : "Sim, excluir minha conta"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  type="submit"
                  className="bg-green8 text-green0 transition hover:bg-green7 hover:cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
