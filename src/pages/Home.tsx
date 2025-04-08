import { useEffect, useState } from "react";
import "../App.css";
import { db } from "../utils/db.js";
import { Cabecalho } from "../components/Cabecalho.js";
import { Tabela } from "../components/Tabela.js";
import { dataType } from "../utils/db.js";

export function Home() {
  const database = new db();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const result = await database.getFluxo();
    console.log(result);
    setData(result || null);
  };
  return (
    <div className="w-full h-full bg-white">
      <div className="flex flex-col items-center w-full h-80 bg-green0 mt-10">
        <Tabela data={data} />
      </div>
    </div>
  );
}
