import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OrdersList />} />
        <Route path="/order/new" element={<OrderForm />} />
        <Route path="/order/:id" element={<OrderForm />} />
      </Routes>
    </Router>
  );
}

export default App;
