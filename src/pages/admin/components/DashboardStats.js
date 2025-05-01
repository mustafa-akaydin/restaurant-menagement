import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: 'fas fa-shopping-cart',
      color: 'primary'
    },
    {
      title: 'Toplam Rezervasyon',
      value: stats.totalReservations,
      icon: 'fas fa-calendar-check',
      color: 'success'
    },
    {
      title: 'Menü Öğeleri',
      value: stats.totalMenuItems,
      icon: 'fas fa-utensils',
      color: 'warning'
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: 'fas fa-users',
      color: 'info'
    }
  ];

  return (
    <Row className="mb-4">
      {statCards.map((stat, index) => (
        <Col key={index} sm={6} lg={3} className="mb-4">
          <Card className={`dashboard-stat-card bg-${stat.color} text-white h-100`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2">{stat.title}</h6>
                  <h2 className="card-title mb-0">{stat.value}</h2>
                </div>
                <div className="stat-icon">
                  <i className={`${stat.icon} fa-2x`}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats; 