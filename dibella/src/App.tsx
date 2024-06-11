import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ListaPedidos from "./components/ListaPedidos";
import PedidoForm from "./components/PedidoForm";
import Pedidos from "./components/Pedidos";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ListaPedidos />} />
        <Route path="/pedido/new" element={<PedidoForm />} />
        <Route path="/pedido/:id" element={<Pedidos />} />
      </Routes>
    </Router>
  );
};

export default App;
