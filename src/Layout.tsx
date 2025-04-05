import { Outlet } from "react-router-dom";
import { Cabecalho } from "./components/Cabecalho.js";

export function Layout() {
  return (
    <>
      <Cabecalho />
      <main>
        <Outlet />
      </main>
    </>
  );
}
