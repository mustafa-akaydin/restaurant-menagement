import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Alert } from 'react-bootstrap';
import DataService from '../services/dataService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          const allOrders = await DataService.getOrders();
          // Kullanıcının siparişlerini filtrele
          const userOrders = Array.isArray(allOrders) 
            ? allOrders.filter(order => order.userId === user.id)
            : [];
          setOrders(userOrders);
        }
      } catch (err) {
        console.error('Siparişler yüklenirken hata:', err);
        setError('Siparişler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await DataService.cancelOrder(orderId);
      // Siparişi listeden kaldır
      setOrders(orders.filter(order => order.id !== orderId));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Sipariş iptal edilirken hata:', err);
      setError('Sipariş iptal edilirken bir hata oluştu');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'ready':
        return 'Hazır';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <h3>Siparişler yükleniyor...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Siparişlerim</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {showSuccess && (
        <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
          Sipariş başarıyla iptal edildi!
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <p>Henüz siparişiniz bulunmamaktadır.</p>
          </Card.Body>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Sipariş No</th>
              <th>Tarih</th>
              <th>Ürünler</th>
              <th>Toplam</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleDateString('tr-TR')}</td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{order.total} TL</td>
                <td>{getStatusText(order.status)}</td>
                <td>
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      İptal Et
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Orders; 