import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Button, TextField, LinearProgress, MenuItem } from '@mui/material';

interface Produto {
  id: number;
  nome: string;
  tamanho: string;
  valor: number;
  estoque: number;
}

interface ProdutoPedido {
  produtoId: number;
  quantidade: number;
}

interface Pedido {
  id?: number;
  valor: number;
  produtos: ProdutoPedido[];
}

const OrderForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<Pedido>({ valor: 0, produtos: [] });
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (id) {
      api.get(`/pedido/${id}`)
        .then(response => {
          const pedidoData = response.data;
          pedidoData.produtos = pedidoData.produtos.map((p: any) => ({
            produtoId: p.produtoId,
            quantidade: p.quantidade,
          }));
          setPedido(pedidoData);
          updateProgress(pedidoData);
        })
        .catch(error => console.error('Error fetching order:', error));
    }
    api.get('/produto')
      .then(response => setProdutos(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number | null = null) => {
    const { name, value } = e.target;
    if (index !== null) {
      const newProdutos = [...pedido.produtos];
      newProdutos[index] = {
        ...newProdutos[index],
        [name]: name === 'quantidade' ? Number(value) : value,
      };
      setPedido({ ...pedido, produtos: newProdutos });
    } else {
      setPedido({ ...pedido, [name]: Number(value) });
    }
    updateProgress(pedido);
  };

  const addProduct = () => {
    setPedido({ ...pedido, produtos: [...pedido.produtos, { produtoId: 0, quantidade: 0 }] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request = id ? api.put(`/pedido/${id}`, pedido) : api.post('/pedido', pedido);
    request
      .then(() => navigate('/'))
      .catch(error => console.error('Error saving order:', error));
  };

  const updateProgress = (pedido: Pedido) => {
    const totalFields = 1 + pedido.produtos.length * 2;
    let filledFields = 0;
    if (pedido.valor > 0) filledFields += 1;
    pedido.produtos.forEach(produto => {
      if (produto.produtoId > 0) filledFields += 1;
      if (produto.quantidade > 0) filledFields += 1;
    });
    setProgress((filledFields / totalFields) * 100);
  };

  return (
    <div>
      <h1>{id ? 'Edit Order' : 'Create Order'}</h1>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Order Value"
          name="valor"
          type="number"
          value={pedido.valor}
          onChange={(e) => handleInputChange(e)}
          required
        />
        {pedido.produtos.map((produto, index) => (
          <div key={index}>
            <TextField
              select
              label="Product"
              name="produtoId"
              value={produto.produtoId}
              onChange={(e) => handleInputChange(e, index)}
              required
            >
              <MenuItem value={0}>Select a product</MenuItem>
              {produtos.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Quantity"
              name="quantidade"
              type="number"
              value={produto.quantidade}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </div>
        ))}
        <Button type="button" onClick={addProduct}>Add Product</Button>
        <LinearProgress variant="determinate" value={progress} />
        <Button type="submit" variant="contained" color="primary">Save</Button>
      </form>
    </div>
  );
};

export default OrderForm;
