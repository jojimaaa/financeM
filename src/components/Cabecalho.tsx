import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../App.css";
import { db, supabase } from "../utils/db.tsx";
import FluxoButtonDialog from "./FluxoButtonDialogue.tsx";
export function Cabecalho() {
  const navigate = useNavigate();
  const database = new db();
  const [userid, setUserid] = useState("");
  const [nomeuser, setNomeuser] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  const Logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao deslogar:", error.message);
    } else {
      console.log("Usuário deslogado com sucesso!");
      navigate("/");
      window.location.reload();
    }
  };

  const getUser = async () => {
    const userId = await database.getUserID();
    if (userId) {
      setUserid(userId);

      const { data, error } = await supabase
        .from("pessoa")
        .select("nome")
        .eq("id_pessoa", userId)
        .single();

      if (data) setNomeuser(data.nome);
      else console.error("Erro ao buscar nome:", error?.message);
    } else {
      console.error("O usuário não está logado");
    }
  };

  if (userid) {
    return (
      <div className="bg-green7 w-screen h-18 flex flex-row items-center p-2 columns-5">
        <div className="flex flex-rows text-3xl  font-raleway text-white w-1/4 items-center justify-center pl">
          <img
            src="/src/assets/folha.png"
            alt="Logo"
            className="w-10 h-10 mr-2"
          />
          <h1>FINANCEM</h1>
        </div>

        <div className="flex flex-row items-center justify-center w-1/4">
          <Link to={"/extrato"}>
            <button
              className="text-white font-raleway text-lg px-2 py-1 hover:underline hover:cursor-pointer transition active:bg-green6 active:shadow-lg"
              onClick={() => {
                console.log("Extrato");
              }}
            >
              Extrato
            </button>
          </Link>
        </div>

        <div className="flex flex-row justify-center w-1/4">
          <FluxoButtonDialog buttonText="Adicionar Fluxo" />
        </div>
        <div className="flex flex-row justify-center items-center w-1/4">
          <button
            className=" text-center hover:underline hover:cursor-pointer text-red-200"
            onClick={Logout}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green7 w-screen h-18 flex flex-row items-center p-2 columns-5">
      <div className="flex flex-rows text-3xl  font-raleway text-white w-1/4 items-center justify-center pl">
        <img
          src="/src/assets/folha.png"
          alt="Logo"
          className="w-10 h-10 mr-2"
        />
        <h1>FINANCEM</h1>
      </div>
    </div>
  );
}
