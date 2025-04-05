import { useEffect, useState } from "react";
import "./App.css";
import { db } from "./utils/db.js";
import { Cabecalho } from "./components/Cabecalho.js";
import { Tabela } from "./components/Tabela.js";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.js";
import { Extrato } from "./pages/Extrato.js";
import { Layout } from "./Layout.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path={"/"} element={<Home />} />
          <Route path={"/extrato"} element={<Extrato />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
