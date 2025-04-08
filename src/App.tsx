import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home.js";
import { Extrato } from "./pages/Extrato.js";
import { Layout } from "./Layout.js";
import { Login } from "./pages/Login.tsx";
import { Conta } from "./pages/Conta.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path={"/"} element={<Home />} />
          <Route path={"/login"} element={<Login />} />
          <Route path={"/extrato"} element={<Extrato />} />
          <Route path={"/conta"} element={<Conta />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
