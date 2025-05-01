import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import DataService from '../../../services/dataService';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/tr';
import './Table.css';

moment.locale('tr');

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await DataService.getOrders();
      setOrders(allOrders);
    } catch (error) {
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await DataService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success('Sipariş durumu güncellendi');
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Beklemede', icon: 'fas fa-clock' },
      preparing: { text: 'Hazırlanıyor', icon: 'fas fa-utensils' },
      ready: { text: 'Hazır', icon: 'fas fa-check-circle' },
      delivered: { text: 'Teslim Edildi', icon: 'fas fa-truck' },
      cancelled: { text: 'İptal Edildi', icon: 'fas fa-times-circle' }
    };

    const config = statusConfig[status] || { text: status, icon: 'fas fa-info-circle' };

    return (
      <span className={`status-badge ${status}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Table Filters */}
      <div className="table-filters">
        <Form.Control
          type="text"
          placeholder="Müşteri adı veya sipariş no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="preparing">Hazırlanıyor</option>
          <option value="ready">Hazır</option>
          <option value="delivered">Teslim Edildi</option>
          <option value="cancelled">İptal Edildi</option>
        </Form.Select>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="table-empty-state">
          <i className="fas fa-clipboard-list"></i>
          <p>Sipariş bulunamadı</p>
        </div>
      ) : (
        <Table className="admin-table">
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
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.orderNumber}</td>
                <td>
                  <div>{order.customerName}</div>
                  <small className="text-muted">{order.customerPhone}</small>
                </td>
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
                  <div className="table-actions">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                      disabled={order.status !== 'pending'}
                    >
                      <i className="fas fa-utensils"></i>
                      Hazırla
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                      disabled={order.status !== 'preparing'}
                    >
                      <i className="fas fa-check"></i>
                      Hazır
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={order.status === 'delivered' || order.status === 'cancelled'}
                    >
                      <i className="fas fa-times"></i>
                      İptal
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default OrderManagement; 