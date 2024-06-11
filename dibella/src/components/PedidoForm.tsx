import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Button, TextField, LinearProgress, MenuItem } from "@mui/material";

interface Produto {
  id: number;
  nome: string;
  tamanho: string;
  valor: number;
  estoque: number;
  quantidade?: number;
}

interface Pedido {
  id?: number;
  valor: number;
  produtos: Produto[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const PedidoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido>({ valor: 0, produtos: [] });
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (id) {
      api
        .get(`/pedido/${id}`)
        .then((response) => {
          const pedidoData = response.data;
          pedidoData.produtos = pedidoData.produtos.map((p: any) => ({
            produtoId: p.produtoId,
            quantidade: p.quantidade,
            ...p.produto,
          }));
          setPedido(pedidoData);
          calculateTotalValue(pedidoData.produtos);
          updateProgress(pedidoData);
        })
        .catch((error) => console.error("Error fetching pedido:", error));
    }
    api
      .get("/produto")
      .then((response) => setProdutos(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, [id]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number | null = null
  ) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newProdutos = [...pedido.produtos];
      newProdutos[index] = {
        ...newProdutos[index],
        [name]: name === "quantidade" ? Number(value) : value,
      };
      setPedido({ ...pedido, produtos: newProdutos });
      calculateTotalValue(newProdutos);
    } else {
      setPedido({ ...pedido, [name]: Number(value) });
    }
    updateProgress(pedido);
  };

  const addProduct = () => {
    setPedido({
      ...pedido,
      produtos: [
        ...pedido.produtos,
        { id: 0, nome: "", tamanho: "", valor: 0, estoque: 0, quantidade: 0 },
      ],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pedidoData = {
      ...pedido,
      produtos: pedido.produtos.map((p) => ({
        produtoId: p.id,
        quantidade: p.quantidade,
      })),
    };
    const request = id
      ? api.put(`/pedido/${id}`, pedidoData)
      : api.post("/pedido", pedidoData);
    request
      .then(() => navigate("/"))
      .catch((error) => console.error("Error saving pedido:", error));
  };

  const calculateTotalValue = (produtos: Produto[]) => {
    const total = produtos.reduce((acc, produto) => {
      return acc + (produto ? produto.valor * (produto.quantidade || 0) : 0);
    }, 0);
    setPedido((prevPedido) => ({ ...prevPedido, valor: total }));
  };

  const updateProgress = (pedido: Pedido) => {
    const totalFields = 1 + pedido.produtos.length * 2;
    let filledFields = 0;
    if (pedido.valor > 0) filledFields += 1;
    pedido.produtos.forEach((produto) => {
      if (produto.id > 0) filledFields += 1;
      if (produto.quantidade && produto.quantidade > 0) filledFields += 1;
    });
    setProgress((filledFields / totalFields) * 100);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">
        {id ? "Editar Pedido" : "Criar Pedido"}
      </h1>
      <div className="flex itens-center gap-4">
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleHomeClick}
        >
          Home
        </Button>
        <div className="p-2 border w-fit">
          <p>Valor do Pedido: {formatCurrency(pedido.valor)}</p>
        </div>
      </div>
      <LinearProgress variant="determinate" value={progress} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {pedido.produtos.map((produto, index) => (
          <div key={index} className="space-x-4">
            <TextField
              select
              label="Produto"
              name="id"
              value={produto.id}
              onChange={(e) => handleInputChange(e, index)}
              required
            >
              <MenuItem value={0}>Selecione um Produto</MenuItem>
              {produtos.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nome}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantidade"
              name="quantidade"
              type="number"
              value={produto.quantidade}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </div>
        ))}
        <div className="space-x-4">
          <Button
            type="button"
            variant="contained"
            color="secondary"
            onClick={addProduct}
          >
            Adicionar Produto
          </Button>
          <Button type="submit" variant="contained" color="success">
            Comprar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PedidoForm;
