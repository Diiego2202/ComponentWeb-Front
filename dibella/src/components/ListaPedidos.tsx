import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import api from "../api/axiosConfig";

interface Pedido {
  id: number;
  valor: number;
  data: string;
}

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    api
      .get("/pedido")
      .then((response) => setPedidos(response.data))
      .catch((error) => console.error("Error fetching pedidos:", error));
  }, []);

  return (
    <div className="space-y-4 p-4">
      <h1 className="mb-4 text-2xl font-semibold">Pedidos</h1>
      <Link to="/pedido/new">
        <Button variant="contained" color="primary">
          Novo Pedido
        </Button>
      </Link>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            <Link to={`/pedido/${pedido.id}`}>- Pedido {pedido.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaPedidos;
