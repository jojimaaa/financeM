import { Fluxo, columns } from "../components/columns.js";
import "../App.css";
import { db, supabase } from "../utils/db.js";
import { Cabecalho } from "../components/Cabecalho.tsx";
import { DataTable } from "../components/extrato-table.js";
import { useEffect, useState } from "react";

export function Extrato() {
  const database = new db();
  const [data, setData] = useState(null);
  const [userid, setUserid] = useState("");
  const [nomeuser, setNomeuser] = useState("");

  useEffect(() => {
    fetchData();
    getUser();
  }, []);

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
  const fetchData = async () => {
    const result = await database.getFluxo();
    console.log(result);
    setData(result || null);
  };

  if (!data) {
    return (
      <div className="text-3xl font-raleway text-green4 flex justify-center bg-green0 mt-3 mx-2 rounded-md">
        Loading Table...
      </div>
    );
  }
  return (
    <div className="w=screen h-full mt-3 mx-2">
      <div className="font-raleway text-4xl m-3">
        <h1>Extrato de: {nomeuser}</h1>
      </div>
      <div className="bg-green0 w-full">
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  );
}
