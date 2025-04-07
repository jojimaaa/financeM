
import { useState } from "react";
import { supabase } from "../utils/db.tsx"
import { useNavigate } from "react-router-dom";
import "../App.css";

export function Login(){
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [ativo, setAtivo] = useState(false);

    const Logar = async(event) => {
        event.preventDefault();
        const {data, error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if(error){
            setMessage(error.message);
            return;
        }

        if(data){
            navigate("/");
            return;
        }
    }


    const Registro = async (event) => {
        event.preventDefault();
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if(error){
            setMessage(error.message);
            return;
        }

        const userId = data.user?.id;
        if(userId){

            const { data, error } = await supabase.from('pessoa').insert([
                { 
                  id_pessoa: userId,
                  nome: name
                },
            ])
            .select()

            if(error){
                setMessage(error.message);
                return;
            }
            if(data){
                setEmail("");
                setName("");
                setPassword("");
            }
        }
    }

    return (

            <div className="mt-20 ml-[50%] relative w-240 h-110 translate-x-[-50%] flex flex-row">
                <div className="border-t border-l border-b w-120 h-110 rounded-tl-[20px] rounded-bl-[20px] bg-[#E0F5EA]">
                    <form onSubmit={Logar}>
                        <div className="flex flex-col items-center">
                            <h1 className=" mt-8 text-[40px] text-center">Fazer Login</h1>
                            <span className="text-red-500">{message}</span>
                            <input className="outline-none bg-white mt-10 h-8 border-1 rounded-[6px] w-80" type="text" name="email"  placeholder="Email do Usuario" onChange={(e) => setEmail(e.target.value)} />
                            <input className="outline-none bg-white mt-5 h-8 border-1 rounded-[6px] w-80" type="password" name="senha"  placeholder="Digite sua senha" onChange={(e) => setPassword(e.target.value)} />
                            <button className="hover:text-[25px] cursor-pointer bg-green3 mt-22 rounded-[6px] h-10 w-80 text-[22px] border-1 text-center" type="submit">Entrar</button>
                        </div>
                    </form> 
                    
                </div>
                <div className="border-1 w-120 h-110 rounded-tr-[20px] rounded-br-[20px] bg-[#E0F5EA]">
                    <form onSubmit={Registro}>
                        <div className="flex flex-col items-center">
                            <h1 className=" mt-8 text-[40px] text-center">Fazer Cadastro</h1>
                            <span  className="text-red-500">{message}</span>
                            <input className="outline-none bg-white mt-10 h-8 border-1 rounded-[6px] w-80" type="text" name="nome" placeholder="Nome do Usuario"  onChange={(e) => setName(e.target.value)}/>
                            <input className="outline-none bg-white mt-5 h-8 border-1 rounded-[6px] w-80" type="text" name="email"  placeholder="Digite seu Email" onChange={(e) => setEmail(e.target.value)} />
                            <input className="outline-none bg-white mt-5 h-8 border-1 rounded-[6px] w-80" type="password" name="senha"  placeholder="Digite sua senha" onChange={(e) => setPassword(e.target.value)} />
                            <button className="hover:text-[25px] cursor-pointer bg-green3 h-10 mt-10 rounded-[6px] w-80 text-[22px] border-1 text-center" type="submit">Cadastrar</button>
                        </div>
                    </form>
                </div>
                <div className={`absolute w-120 transition-all duration-1000 h-110 bg-green7 ${ativo ? "rounded-bl-[20px] rounded-tl-[20px]" : "ml-[50%] rounded-br-[20px] rounded-tr-[20px]"}`}>
                    <div className="mt-24 flex flex-rows text-[60px] w-120  font-raleway text-white items-center justify-center pl">
                        <img
                            src="/src/assets/folha.png"
                            alt="Logo"
                            className="w-22 h-22 mr-2"
                        />
                      <h1>FINANCEM</h1>
                    </div>
                    <h1 className="text-white justify-center text-center mt-5">Organize suas finanças, controle seus gastos, visualize metas e acompanhe sua evolução financeira dia após dia.</h1>
                    <button className="hover:text-[25px] cursor-pointer text-[20px] h-10 rounded-[6px] bg-green5 ml-[50%] translate-x-[-50%] w-80 border-1-black text-white justify-center text-center mt-10" onClick={() => setAtivo(!ativo)}>{ativo ? "Ja Tenho Conta" : "Criar Conta"}</button>
                </div>
            </div>
    );
}