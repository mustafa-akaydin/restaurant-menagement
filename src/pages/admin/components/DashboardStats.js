import React from 'react';
import { Row, Col } from 'react-bootstrap';

const DashboardStats = ({ stats }) => {
  return (
    <Row className="mb-4">
      <Col md={6} lg={3} className="mb-3">
        <div className="stats-card">
          <div className="stats-icon menu">
            <i className="fas fa-utensils"></i>
          </div>
          <div className="stats-value">{stats.totalMenuItems}</div>
          <div className="stats-label">Toplam Menü Öğesi</div>
        </div>
      </Col>
      <Col md={6} lg={3} className="mb-3">
        <div className="stats-card">
          <div className="stats-icon orders">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="stats-value">{stats.totalOrders}</div>
          <div className="stats-label">Toplam Sipariş</div>
        </div>
      </Col>
      <Col md={6} lg={3} className="mb-3">
        <div className="stats-card">
          <div className="stats-icon reservations">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stats-value">{stats.totalReservations}</div>
          <div className="stats-label">Toplam Rezervasyon</div>
        </div>
      </Col>
      <Col md={6} lg={3} className="mb-3">
        <div className="stats-card">
          <div className="stats-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stats-value">{stats.totalUsers}</div>
          <div className="stats-label">Toplam Kullanıcı</div>
        </div>
      </Col>
    </Row>
  );
};

export default DashboardStats; 