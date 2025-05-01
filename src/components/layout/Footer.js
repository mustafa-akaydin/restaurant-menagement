import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3 text-white">
              <i className="fas fa-utensils me-2"></i>
              Restaurant Management
            </h5>
            <p className="text-white-50">
              Modern ve kullanıcı dostu restoran yönetim çözümü ile işletmenizi bir adım öne taşıyın.
            </p>
            <div className="social-links mt-3">
              <a href="#" className="text-white me-3">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </Col>

          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3 text-white">Hızlı Bağlantılar</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/menu" className="text-white-50 text-decoration-none">
                  <i className="fas fa-chevron-right me-2"></i> Menü
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/reservations" className="text-white-50 text-decoration-none">
                  <i className="fas fa-chevron-right me-2"></i> Rezervasyonlar
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/orders" className="text-white-50 text-decoration-none">
                  <i className="fas fa-chevron-right me-2"></i> Siparişler
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white-50 text-decoration-none">
                  <i className="fas fa-chevron-right me-2"></i> İletişim
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4}>
            <h5 className="mb-3 text-white">İletişim</h5>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                Örnek Mahallesi, Örnek Sokak No:1
              </li>
              <li className="mb-2">
                <i className="fas fa-phone me-2"></i>
                +90 555 123 4567
              </li>
              <li className="mb-2">
                <i className="fas fa-envelope me-2"></i>
                info@restaurant.com
              </li>
              <li>
                <i className="fas fa-clock me-2"></i>
                Her gün 09:00 - 23:00
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 border-light" />

        <Row>
          <Col className="text-center">
            <p className="mb-0 text-white-50">
              &copy; {new Date().getFullYear()} Restaurant Management. Tüm hakları saklıdır.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 