import { Fluxo, columns } from "./Extrato-lib/columns.js";
import "../App.css";
import { db } from "../utils/db.js";
import { Cabecalho } from "../components/Cabecalho.tsx";
import { DataTable } from "./Extrato-lib/extrato-table.js";
import { useEffect, useState } from "react";

export function Extrato() {
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

  if (!data) {
    return (
      <div className="text-3xl font-raleway text-green4 flex justify-center bg-green0 mt-3 mx-2 rounded-md">
        Loading Table...
      </div>
    );
  }
  return (
    <div className="w=screen h-screen bg-green0 mt-3 mx-2">
      <DataTable data={data} columns={columns} />
    </div>
  );
}
