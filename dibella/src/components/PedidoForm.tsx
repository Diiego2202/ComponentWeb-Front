import React, { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import {
  Button,
  TextField,
  LinearProgress,
  MenuItem,
  IconButton,
  Snackbar,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

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

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PedidoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido>({ valor: 0, produtos: [] });
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
      updateProgress({ ...pedido, produtos: newProdutos });
    } else {
      setPedido({ ...pedido, [name]: Number(value) });
      updateProgress({ ...pedido, [name]: Number(value) });
    }
  };

  const addProduct = () => {
    setPedido({
      ...pedido,
      produtos: [
        ...pedido.produtos,
        { id: 0, nome: "", tamanho: "", valor: 0, estoque: 0, quantidade: 0 },
      ],
    });
    updateProgress({
      ...pedido,
      produtos: [
        ...pedido.produtos,
        { id: 0, nome: "", tamanho: "", valor: 0, estoque: 0, quantidade: 0 },
      ],
    });
  };

  const removeProduct = (index: number) => {
    const newProdutos = [...pedido.produtos];
    newProdutos.splice(index, 1);
    setPedido({ ...pedido, produtos: newProdutos });
    updateProgress({ ...pedido, produtos: newProdutos });
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

    if (
      pedidoData.produtos.length === 0 ||
      pedidoData.produtos.some((p) => p.produtoId === 0 || p.quantidade === 0)
    ) {
      setError("Selecione um produto ou defina uma quantidade.");
      return;
    }

    const request = id
      ? api.put(`/pedido/${id}`, pedidoData)
      : api.post("/pedido", pedidoData);
    request
      .then(() => navigate("/"))
      .catch((error) => console.error("Error saving pedido:", error));
  };

  const updateProgress = (pedido: Pedido) => {
    const totalFields = pedido.produtos.length * 2;
    let filledFields = 0;

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
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleHomeClick}
        >
          Home
        </Button>
      </div>
      <LinearProgress variant="determinate" value={progress} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {pedido.produtos.map((produto, index) => (
          <div key={index} className="flex items-center space-x-4">
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
            <IconButton
              edge="end"
              color="error"
              onClick={() => removeProduct(index)}
            >
              X
            </IconButton>
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
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default PedidoForm;
