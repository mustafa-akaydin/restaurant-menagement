import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { isAdmin } from '../../utils/authUtils';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import DataService from '../../services/dataService';

const NavigationBar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase'den gelen kullanıcı bilgilerini al
        const userData = await DataService.findUserByEmail(firebaseUser.email);
        if (userData) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name,
            role: userData.role
          });
        }
      } else {
        setUser(null);
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await DataService.logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="py-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <i className="fas fa-utensils me-2"></i>
          Restaurant
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              <i className="fas fa-home me-1"></i> Ana Sayfa
            </Nav.Link>
            <Nav.Link as={Link} to="/menu" className="nav-link-custom">
              <i className="fas fa-list me-1"></i> Menü
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/orders" className="nav-link-custom">
                  <i className="fas fa-shopping-cart me-1"></i> Siparişlerim
                </Nav.Link>
                <Nav.Link as={Link} to="/reservations" className="nav-link-custom">
                  <i className="fas fa-calendar-alt me-1"></i> Rezervasyonlar
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic" className="d-flex align-items-center">
                  <i className="fas fa-user-circle me-2"></i>
                  {user.name || 'Profil'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="fas fa-user me-2"></i> Profil
                  </Dropdown.Item>
                  {isAdmin(user) && (
                    <Dropdown.Item as={Link} to="/admin">
                      <i className="fas fa-cog me-2"></i> Admin Paneli
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i> Çıkış Yap
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Button 
                  variant="outline-light" 
                  as={Link} 
                  to="/login"
                  className="me-2"
                >
                  <i className="fas fa-sign-in-alt me-1"></i> Giriş Yap
                </Button>
                <Button 
                  variant="primary" 
                  as={Link} 
                  to="/register"
                >
                  <i className="fas fa-user-plus me-1"></i> Kayıt Ol
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar; 