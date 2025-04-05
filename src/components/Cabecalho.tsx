import { Link } from "react-router-dom";

export function Cabecalho() {
  return (
    <div className="bg-green7 w-screen h-18 flex flex-row items-center p-2 columns-5">
      <div className="flex flex-rows text-3xl  font-raleway text-white w-1/5 items-center justify-center pl">
        <img
          src="/src/assets/folha.png"
          alt="Logo"
          className="w-10 h-10 mr-2"
        />
        <h1>FINANCEM</h1>
      </div>

      <div className="flex flex-row justify-center w-1/5">
        <Link to={"/"}>
          <button
            className="text-white font-raleway text-lg px-2 py-1 hover:underline hover:cursor-pointer transition active:bg-green6 active:shadow-lg"
            onClick={() => {
              console.log("Home");
            }}
          >
            Home
          </button>
        </Link>
      </div>

      <div className="flex flex-row items-center justify-center w-1/5">
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

      <div className="flex flex-row justify-center w-1/5">
        <button
          className="text-white font-raleway text-lg px-2 py-1 hover:underline hover:cursor-pointer active:bg-green6 active:shadow-lg"
          onClick={() => {
            console.log("Conta");
          }}
        >
          Conta
        </button>
      </div>

      <div className="flex flex-row justify-center w-1/5">
        <button
          className="text-green7 font-raleway text-lg rounded-lg px-2 py-1 bg-green2 hover:bg-green3 hover:cursor-pointer hover:shadow-lg active:border-green1 active:border-2"
          onClick={() => {
            console.log("Add button");
          }}
        >
          Adicionar Fluxo
        </button>
      </div>
    </div>
  );
}
