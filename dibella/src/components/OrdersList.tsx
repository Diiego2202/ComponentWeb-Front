import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import api from '../api/axiosConfig';

interface Order {
  id: number;
  valor: number;
  data: string;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/pedido')
      .then(response => setOrders(response.data))
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      <Link to="/order/new">
        <Button variant="contained" color="primary">Create New Order</Button>
      </Link>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            <Link to={`/order/${order.id}`}>Order {order.id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;
