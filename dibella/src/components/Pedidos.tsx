import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, CircularProgress } from "@mui/material";
import api from "../api/axiosConfig";

interface Pedido {
  id: number;
  valor: number;
  data: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0!
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Pedidos: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/pedido/${id}`)
      .then((response) => {
        setPedido(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pedido:", error);
        setError("Erro ao carregar o pedido.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!pedido) {
    return <p>Pedido não encontrado.</p>;
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="mb-4 text-2xl font-semibold">
        Detalhes do Pedido {pedido.id}
      </h1>
      <p>Valor: {pedido.valor}</p>
      <p>Data: {formatDate(pedido.data)}</p>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.history.back()}
      >
        Voltar
      </Button>
    </div>
  );
};

export default Pedidos;
