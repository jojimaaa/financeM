import { useEffect } from "react";
import "../App.css";
import { db } from "../utils/db.js";
import { useNavigate } from "react-router-dom";

export function Home() {
  const navigate = useNavigate();
  const database = new db();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const uid = await database.getUserID();
    console.log(uid);
    if (uid) {
      navigate("/extrato");
      window.location.reload();
    } else {
      navigate("/login");
      window.location.reload();
    }
  };
}
