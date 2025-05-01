import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import DataService from '../../../services/dataService';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/tr';
import './Table.css';

moment.locale('tr');

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(moment().format('YYYY-MM-DD'));

  useEffect(() => {
    fetchReservations();
  }, [dateFilter]);

  const fetchReservations = async () => {
    try {
      const allReservations = await DataService.getReservations();
      
      // Tarihe göre filtrele
      const filteredReservations = allReservations.filter(reservation => {
        const reservationDate = moment(reservation.date).format('YYYY-MM-DD');
        return reservationDate === dateFilter;
      });

      // Tarih ve saate göre sırala
      const sortedReservations = filteredReservations.sort((a, b) => {
        const dateA = moment(`${a.date} ${a.time}`);
        const dateB = moment(`${b.date} ${b.time}`);
        return dateA - dateB;
      });

      setReservations(sortedReservations);
      setLoading(false);
    } catch (error) {
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await DataService.updateReservationStatus(reservationId, newStatus);
      toast.success('Rezervasyon durumu güncellendi');
      fetchReservations();
    } catch (error) {
      toast.error('Rezervasyon durumu güncellenirken bir hata oluştu');
    }
  };

  const handleShowDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Beklemede', icon: 'fas fa-clock' },
      confirmed: { text: 'Onaylandı', icon: 'fas fa-check-circle' },
      cancelled: { text: 'İptal Edildi', icon: 'fas fa-times-circle' },
      completed: { text: 'Tamamlandı', icon: 'fas fa-check-double' }
    };

    const config = statusConfig[status] || { text: status, icon: 'fas fa-info-circle' };

    return (
      <span className={`status-badge ${status}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rezervasyon Yönetimi</h2>
      </div>

      {/* Table Filters */}
      <div className="table-filters">
        <Form.Control
          type="text"
          placeholder="Müşteri adı veya rezervasyon no ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Form.Control
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Beklemede</option>
          <option value="confirmed">Onaylandı</option>
          <option value="cancelled">İptal Edildi</option>
          <option value="completed">Tamamlandı</option>
        </Form.Select>
      </div>

      {/* Reservations Table */}
      {filteredReservations.length === 0 ? (
        <div className="table-empty-state">
          <i className="fas fa-calendar-check"></i>
          <p>Rezervasyon bulunamadı</p>
        </div>
      ) : (
        <Table className="admin-table">
          <thead>
            <tr>
              <th>Rezervasyon No</th>
              <th>Müşteri</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>Kişi Sayısı</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>#{reservation.id.slice(-6)}</td>
                <td>{reservation.customerName}</td>
                <td>{moment(reservation.date).format('DD/MM/YYYY')}</td>
                <td>{reservation.time}</td>
                <td>{reservation.guests}</td>
                <td>{getStatusBadge(reservation.status)}</td>
                <td>
                  <div className="table-actions">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleShowDetails(reservation)}
                    >
                      <i className="fas fa-eye"></i>
                      Detaylar
                    </Button>
                    {reservation.status === 'pending' && (
                      <>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                        >
                          <i className="fas fa-check"></i>
                          Onayla
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                        >
                          <i className="fas fa-times"></i>
                          İptal
                        </Button>
                      </>
                    )}
                    {reservation.status === 'confirmed' && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                      >
                        <i className="fas fa-check-double"></i>
                        Tamamla
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rezervasyon Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReservation && (
            <>
              <h5>Rezervasyon No: #{selectedReservation.id.slice(-6)}</h5>
              <p><strong>Müşteri:</strong> {selectedReservation.customerName}</p>
              <p><strong>E-posta:</strong> {selectedReservation.email}</p>
              <p><strong>Telefon:</strong> {selectedReservation.phone}</p>
              <p><strong>Tarih:</strong> {moment(selectedReservation.date).format('DD/MM/YYYY')}</p>
              <p><strong>Saat:</strong> {selectedReservation.time}</p>
              <p><strong>Kişi Sayısı:</strong> {selectedReservation.guests}</p>
              <p><strong>Durum:</strong> {getStatusBadge(selectedReservation.status)}</p>
              
              {selectedReservation.specialRequests && (
                <div className="mt-3">
                  <strong>Özel İstekler:</strong>
                  <p className="mb-0">{selectedReservation.specialRequests}</p>
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

export default ReservationManagement; 