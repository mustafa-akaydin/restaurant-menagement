import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Sayfa Bulunamadı</h2>
          <p className="lead mb-4">
            Aradığınız sayfa bulunamadı. Sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            Ana Sayfaya Dön
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 