import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal } from 'react-bootstrap';
import DataService from '../../../services/dataService';
import { toast } from 'react-toastify';
import moment from 'moment';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersData = await DataService.getOrders();
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await DataService.updateOrderStatus(orderId, newStatus);
      toast.success('Sipariş durumu güncellendi!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Sipariş durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };

    const statusTexts = {
      pending: 'Beklemede',
      preparing: 'Hazırlanıyor',
      ready: 'Hazır',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };

    return (
      <Badge bg={statusColors[status]}>
        {statusTexts[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <h2 className="mb-4">Sipariş Yönetimi</h2>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Sipariş No</th>
            <th>Müşteri</th>
            <th>Toplam</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id.slice(-6)}</td>
              <td>{order.customerName}</td>
              <td>{order.total}₺</td>
              <td>{getStatusBadge(order.status)}</td>
              <td>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowDetails(order)}
                >
                  <i className="fas fa-eye"></i>
                </Button>
                {order.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  >
                    <i className="fas fa-utensils"></i>
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                  >
                    <i className="fas fa-check"></i>
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                  >
                    <i className="fas fa-truck"></i>
                  </Button>
                )}
                {['pending', 'preparing'].includes(order.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sipariş Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <h5>Sipariş No: #{selectedOrder.id.slice(-6)}</h5>
              <p><strong>Müşteri:</strong> {selectedOrder.customerName}</p>
              <p><strong>Telefon:</strong> {selectedOrder.phone}</p>
              <p><strong>Adres:</strong> {selectedOrder.address}</p>
              <p><strong>Tarih:</strong> {moment(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</p>
              <p><strong>Durum:</strong> {getStatusBadge(selectedOrder.status)}</p>
              
              <h6 className="mt-4">Sipariş Öğeleri:</h6>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}₺</td>
                      <td>{item.price * item.quantity}₺</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Toplam:</strong></td>
                    <td><strong>{selectedOrder.total}₺</strong></td>
                  </tr>
                </tbody>
              </Table>

              {selectedOrder.notes && (
                <div className="mt-3">
                  <strong>Notlar:</strong>
                  <p className="mb-0">{selectedOrder.notes}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagement; 