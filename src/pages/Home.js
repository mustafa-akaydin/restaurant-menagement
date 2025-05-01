import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true
  };

  const [sliderImages] = useState([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Lezzetli Yemekler',
      description: 'En taze malzemelerle hazırlanan özel lezzetlerimizi keşfedin'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Özel Etkinlikler',
      description: 'Özel günleriniz için unutulmaz anlar yaşayın'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      title: 'Profesyonel Hizmet',
      description: 'Deneyimli ekibimizle size en iyi hizmeti sunuyoruz'
    }
  ]);

  const [features] = useState([
    {
      id: 1,
      icon: 'fas fa-utensils',
      title: 'Lezzetli Yemekler',
      description: 'Usta şeflerimizin hazırladığı özel lezzetler'
    },
    {
      id: 2,
      icon: 'fas fa-calendar-check',
      title: 'Kolay Rezervasyon',
      description: 'Online rezervasyon sistemi ile kolay masa ayırtma'
    },
    {
      id: 3,
      icon: 'fas fa-truck',
      title: 'Hızlı Teslimat',
      description: 'Siparişleriniz hızlı ve güvenli teslimat'
    },
    {
      id: 4,
      icon: 'fas fa-gift',
      title: 'Özel Etkinlikler',
      description: 'Doğum günü, yıl dönümü gibi özel günler için özel menüler'
    }
  ]);

  return (
    <div className="home-page">
      {/* Hero Slider */}
      <div className="hero-slider">
        <Slider {...sliderSettings}>
          {sliderImages.map((slide) => (
            <div key={slide.id} className="slider-item">
              <div 
                className="slider-image" 
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '80vh'
                }}
              >
                <div className="slider-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <Button 
                    variant="btn btn-primary" 
                    size="lg"
                    onClick={() => navigate('/menu')}
                  >
                    Menüyü Görüntüle
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <h2 className="text-center mb-5">Neden Bizi Seçmelisiniz?</h2>
          <Row>
            {features.map((feature) => (
              <Col md={3} key={feature.id} className="mb-4">
                <Card className="h-100 feature-card">
                  <Card.Body className="text-center">
                    <i className={`${feature.icon} fa-3x mb-3`}></i>
                    <Card.Title>{feature.title}</Card.Title>
                    <Card.Text>{feature.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2>Hemen Rezervasyon Yapın</h2>
              <p className="lead">
                Unutulmaz bir deneyim için hemen rezervasyon yapın. 
                Özel günleriniz için özel menülerimizle sizleri bekliyoruz.
              </p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate('/reservations')}
              >
                Rezervasyon Yap
              </Button>
            </Col>
            <Col md={6}>
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Restaurant Interior" 
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Special Offers */}
      <section className="special-offers py-5">
        <Container>
          <h2 className="text-center mb-5">Özel Teklifler</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 special-offer-card">
                <Card.Img 
                  variant="top" 
                  src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                />
                <Card.Body>
                  <Card.Title>Hafta Sonu Brunch</Card.Title>
                  <Card.Text>
                    Cumartesi ve Pazar günleri özel brunch menümüz ile tanışın.
                  </Card.Text>
                  <Button variant="btn btn-primary">Detaylar</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 special-offer-card">
                <Card.Img 
                  variant="top" 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                />
                <Card.Body>
                  <Card.Title>Öğle Menüsü</Card.Title>
                  <Card.Text>
                    Hafta içi öğle yemeklerinde %20 indirim fırsatı.
                  </Card.Text>
                  <Button variant="btn btn-primary">Detaylar</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 special-offer-card">
                <Card.Img 
                  variant="top" 
                  src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                />
                <Card.Body>
                  <Card.Title>Doğum Günü Özel</Card.Title>
                  <Card.Text>
                    Doğum gününüzde özel menü ve %15 indirim fırsatı.
                  </Card.Text>
                  <Button variant="btn btn-primary">Detaylar</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home; 