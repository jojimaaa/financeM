import { columns } from "../components/columns.tsx";
import { db, supabase } from "../utils/db.js";
import { DataTable } from "../components/extrato-table.js";
import { useEffect, useState } from "react";
import { Fluxo } from "../components/columns";

export function Extrato() {
  const database = new db();
  const [data, setData] = useState(null);
  const [nomeuser, setNomeuser] = useState("");
  const [numcalcular, setnumCalcular] = useState(0);

  useEffect(() => {
    fetchData();
    getUser();
  }, []);

  useEffect(() => {
    if (data) {
      Calcular();
    }
  }, [data]);

  const getUser = async () => {
    const userId = await database.getUserID();
    if (userId) {
      const nome = await database.getNome(userId);
      if (nome) setNomeuser(nome);
      else console.error("Erro ao buscar nome");
    } else {
      console.error("O usuário não está logado");
    }
  };

  const Calcular = () => {
    console.log("ozsidbiasdhsaofsa");
    const total = (data ?? []).reduce((acc, item: Fluxo) => {
      const valorNumerico = parseFloat(
        item.valor.replace("$", "").replace(/,/g, "")
      );
      return item.tipo.tipo_nome == "Mensal"
        ? item.is_entrada
          ? acc + valorNumerico
          : acc - valorNumerico
        : item.is_entrada
        ? acc + valorNumerico
        : acc - valorNumerico;
    }, 0);
    console.log("asdoiasoidasd", total);
    setnumCalcular(total);
  };

  const fetchData = async () => {
    const result = await database.getFluxo();
    console.log(result);
    if (result.data) {
      setData(result.data ? result.data : []);
      console.log("data set", data);
    } else console.error("Erro no fetch");
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
      <div className="font-raleway text-4xl m- flex flex-row">
        <h1>Extrato de: {nomeuser}</h1>
        <h1 className="ml-40">Total: {numcalcular}</h1>
      </div>

      <div className="bg-green0 w-full">
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  );
}
