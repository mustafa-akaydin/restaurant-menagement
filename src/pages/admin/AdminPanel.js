import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Alert, Table, Button } from 'react-bootstrap';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import MenuManagement from './components/MenuManagement';
import OrderManagement from './components/OrderManagement';
import ReservationManagement from './components/ReservationManagement';
import UserManagement from './components/UserManagement';
import DashboardStats from './components/DashboardStats';
import { useNavigate } from 'react-router-dom';
import DataService from '../../services/dataService';
import './AdminPanel.css';

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalReservations: 0,
    totalMenuItems: 0,
    totalUsers: 0
  });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orders = await DataService.getOrders();
        const reservations = await DataService.getReservations();
        const menuItems = await DataService.getMenuItems();
        const users = await DataService.getUsers();

        setStats({
          totalOrders: orders.length,
          totalReservations: reservations.length,
          totalMenuItems: menuItems.length,
          totalUsers: users.length
        });

        setLoading(false);
      } catch (error) {
        console.error('Stats yüklenirken hata:', error);
        setError('İstatistikler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const userList = await DataService.getUsers();
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        setError('Kullanıcılar yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchStats();
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await DataService.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      setError('Rol güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="admin-panel d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <Container className="py-5">
          <Alert variant="danger" className="error-alert">
            <Alert.Heading>Hata!</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="admin-panel pt-4">
      <Container fluid className="py-4 ">
        <h1 className="page-title">Admin Paneli</h1>
        
        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />

        {/* Admin Tabs */}
        <Tab.Container id="admin-tabs" defaultActiveKey="menu">
          <Row>
            <Col md={3} lg={2}>
              <Nav variant="pills" className="flex-column admin-nav">
                <Nav.Item>
                  <Nav.Link eventKey="menu">
                    <i className="fas fa-utensils"></i>
                    Menü Yönetimi
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="orders">
                    <i className="fas fa-shopping-cart"></i>
                    Sipariş Yönetimi
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="reservations">
                    <i className="fas fa-calendar-alt"></i>
                    Rezervasyon Yönetimi
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="users">
                    <i className="fas fa-users"></i>
                    Kullanıcı Yönetimi
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col md={9} lg={10}>
              <Tab.Content className="tab-content">
                <Tab.Pane eventKey="menu">
                  <MenuManagement />
                </Tab.Pane>
                <Tab.Pane eventKey="orders">
                  <OrderManagement />
                </Tab.Pane>
                <Tab.Pane eventKey="reservations">
                  <ReservationManagement />
                </Tab.Pane>
                <Tab.Pane eventKey="users">
                  <UserManagement />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default AdminPanel; 