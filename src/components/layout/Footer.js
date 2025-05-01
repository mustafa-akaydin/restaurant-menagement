import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <h5 className="text-secondary mb-4">Restaurant</h5>
            <p className="text-light">
              Lezzetli yemeklerimiz ve sıcak atmosferimizle sizleri ağırlamaktan mutluluk duyarız.
            </p>
            <div className="social-links mt-4">
              <a href="#" className="social-link me-3">
                <FaFacebook />
              </a>
              <a href="#" className="social-link me-3">
                <FaTwitter />
              </a>
              <a href="#" className="social-link me-3">
                <FaInstagram />
              </a>
              <a href="#" className="social-link">
                <FaYoutube />
              </a>
            </div>
          </Col>
          <Col md={4}>
            <h5 className="text-secondary mb-4">Hızlı Bağlantılar</h5>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link to="/" className="text-light text-decoration-none hover-link">
                  Ana Sayfa
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/menu" className="text-light text-decoration-none hover-link">
                  Menü
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/reservations" className="text-light text-decoration-none hover-link">
                  Rezervasyonlar
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none hover-link">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-light text-decoration-none hover-link">
                  İletişim
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5 className="text-secondary mb-4">İletişim</h5>
            <ul className="list-unstyled contact-info">
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
                <span className="text-light">123 Restaurant Caddesi, İstanbul</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-phone me-2 text-secondary"></i>
                <span className="text-light">+90 (212) 123 45 67</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <i className="fas fa-envelope me-2 text-secondary"></i>
                <span className="text-light">info@restaurant.com</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="fas fa-clock me-2 text-secondary"></i>
                <span className="text-light">Her gün 10:00 - 23:00</span>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-4 border-secondary" />
        <Row>
          <Col className="text-center">
            <p className="mb-0 text-light">
              &copy; {currentYear} Restaurant. Tüm hakları saklıdır.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 