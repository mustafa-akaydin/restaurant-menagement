import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada form gönderme işlemi yapılacak
    console.log('Form data:', formData);
    setShowSuccess(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center mb-5">İletişim</h1>
          
          {showSuccess && (
            <Alert variant="success" onClose={() => setShowSuccess(false)} dismissible>
              Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
            </Alert>
          )}

          {showError && (
            <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
              Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
            </Alert>
          )}

          <Row className="mb-5">
            <Col md={4} className="mb-4">
              <div className="text-center p-4 bg-light rounded">
                <i className="fas fa-map-marker-alt fa-2x mb-3 text-primary"></i>
                <h5>Adres</h5>
                <p className="mb-0">Örnek Mahallesi, Örnek Sokak No:1</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="text-center p-4 bg-light rounded">
                <i className="fas fa-phone fa-2x mb-3 text-primary"></i>
                <h5>Telefon</h5>
                <p className="mb-0">+90 555 123 4567</p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="text-center p-4 bg-light rounded">
                <i className="fas fa-envelope fa-2x mb-3 text-primary"></i>
                <h5>Email</h5>
                <p className="mb-0">info@restaurant.com</p>
              </div>
            </Col>
          </Row>

          <Form onSubmit={handleSubmit} className="bg-light p-4 rounded">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Adınız Soyadınız</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Email Adresiniz</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Konu</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mesajınız</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="primary" type="submit" size="lg">
                <i className="fas fa-paper-plane me-2"></i>
                Gönder
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <div className="ratio ratio-21x9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633698339307!2d28.98510731541466!3d41.03700697929776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2zVGFrc2ltIE1leWRhbsSxLCBHw7xtw7zFn3N1eXUsIDM0NDM1IEJleW_En2x1L8Swc3RhbmJ1bA!5e0!3m2!1str!2str!4v1645000000000!5m2!1str!2str"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Restaurant Location"
            ></iframe>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact; 