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
      setLoading(true);
      const ordersData = await DataService.getOrders();
      
      if (!Array.isArray(ordersData)) {
        throw new Error('Sipariş verileri beklenen formatta değil');
      }
      
      // Verileri doğrula ve varsayılan değerler ekle
      const validatedOrders = ordersData.map(order => ({
        id: order.id || '',
        orderNumber: order.orderNumber || 0,
        customerName: order.customerName || 'Misafir Müşteri',
        customerPhone: order.customerPhone || '',
        items: Array.isArray(order.items) ? order.items : [],
        total: order.total || 0,
        status: order.status || 'pending',
        createdAt: order.createdAt || new Date().toISOString()
      }));
      
      setOrders(validatedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu: ' + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await DataService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      toast.success('Sipariş durumu güncellendi');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
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
            <th>Ürünler</th>
            <th>Toplam</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.orderNumber || 'N/A'}</td>
              <td>
                {order.customerName}
                {order.customerPhone && <div className="text-muted small">{order.customerPhone}</div>}
              </td>
              <td>
                <ul className="list-unstyled mb-0">
                  {(order.items || []).map((item, index) => (
                    <li key={index}>
                      {item.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{order.total || 0}₺</td>
              <td>{getStatusBadge(order.status || 'pending')}</td>
              <td>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowDetails(order)}
                >
                  Detaylar
                </Button>
                {order.status === 'pending' && (
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                  >
                    Hazırlanıyor
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleStatusChange(order.id, 'ready')}
                  >
                    Hazır
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    variant="success"
                    size="sm"
                    className="me-2"
                    onClick={() => handleStatusChange(order.id, 'delivered')}
                  >
                    Teslim Edildi
                  </Button>
                )}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                  >
                    İptal Et
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
              <h5>Sipariş No: #{selectedOrder.orderNumber}</h5>
              <p><strong>Müşteri:</strong> {selectedOrder.customerName}</p>
              {selectedOrder.customerPhone && (
                <p><strong>Telefon:</strong> {selectedOrder.customerPhone}</p>
              )}
              <p><strong>Tarih:</strong> {moment(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</p>
              <p><strong>Durum:</strong> {getStatusBadge(selectedOrder.status)}</p>
              
              <h6 className="mt-4">Sipariş Öğeleri:</h6>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
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