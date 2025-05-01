import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DataService from '../services/dataService';
import moment from 'moment';
import 'moment/locale/tr';

moment.locale('tr');

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetchOrders(user.id);
    }
  }, []);

  const fetchOrders = async (userId = null) => {
    try {
      setLoading(true);
      const allOrders = await DataService.getOrders();
      
      // Siparişleri filtrele
      let filteredOrders = allOrders;
      if (userId) {
        // Giriş yapmış kullanıcı için kendi siparişlerini göster
        filteredOrders = allOrders.filter(order => order.userId === userId);
      } else if (searchPhone && searchName) {
        // Misafir kullanıcı için telefon ve isim ile arama
        filteredOrders = allOrders.filter(order => 
          order.customerPhone === searchPhone && 
          order.customerName.toLowerCase() === searchName.toLowerCase()
        );
      }

      // Siparişleri sırala (en yeni en üstte)
      const sortedOrders = filteredOrders.sort((a, b) => 
        moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchPhone || !searchName) {
      toast.error('Lütfen telefon numarası ve isim girin');
      return;
    }
    fetchOrders();
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
      <Container className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Siparişlerim</h2>

      {!JSON.parse(localStorage.getItem('user')) && (
        <Form onSubmit={handleSearch} className="mb-4">
          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Ad Soyad</Form.Label>
                <Form.Control
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Telefon Numarası</Form.Label>
                <Form.Control
                  type="tel"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="(5XX) XXX XX XX"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button type="submit" variant="primary">
                Siparişleri Göster
              </Button>
            </div>
          </div>
        </Form>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-4">
          <p>Sipariş bulunamadı</p>
        </div>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Sipariş No</th>
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
                <td>#{order.orderNumber}</td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{order.total}₺</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowDetails(order)}
                  >
                    Detaylar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

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
    </Container>
  );
};

export default MyOrders; 