import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import DataService from '../../../services/dataService';
import { toast } from 'react-toastify';
import moment from 'moment';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
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
      console.error('Error fetching reservations:', error);
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await DataService.updateReservationStatus(reservationId, newStatus);
      toast.success('Rezervasyon durumu güncellendi!');
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Rezervasyon durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleShowDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info'
    };

    const statusTexts = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      cancelled: 'İptal Edildi',
      completed: 'Tamamlandı'
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
    <div className="reservation-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rezervasyon Yönetimi</h2>
        <Form.Control
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ width: 'auto' }}
        />
      </div>

      <Table responsive striped bordered hover>
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
          {reservations.map((reservation) => (
            <tr key={reservation.id}>
              <td>#{reservation.id.slice(-6)}</td>
              <td>{reservation.customerName}</td>
              <td>{moment(reservation.date).format('DD/MM/YYYY')}</td>
              <td>{reservation.time}</td>
              <td>{reservation.guests}</td>
              <td>{getStatusBadge(reservation.status)}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShowDetails(reservation)}
                >
                  <i className="fas fa-eye"></i>
                </Button>
                {reservation.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </>
                )}
                {reservation.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                  >
                    <i className="fas fa-check-double"></i>
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