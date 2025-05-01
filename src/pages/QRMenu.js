import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import { Container, Card, Button } from 'react-bootstrap';

const QRMenu = () => {
  const navigate = useNavigate();
  const [scanned, setScanned] = useState(false);

  const handleScan = (result) => {
    if (result) {
      try {
        const url = new URL(result);
        const pathParts = url.pathname.split('/');
        const restaurantId = pathParts[pathParts.length - 1];
        
        if (restaurantId) {
          setScanned(true);
          navigate(`/menu/${restaurantId}`);
        }
      } catch (error) {
        console.error('Geçersiz QR kod:', error);
      }
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2 className="text-center">QR Menü</h2>
        </Card.Header>
        <Card.Body>
          {!scanned ? (
            <QRScanner onScan={handleScan} />
          ) : (
            <div className="text-center">
              <p>QR kod başarıyla okundu. Menüye yönlendiriliyorsunuz...</p>
              <Button variant="primary" onClick={() => setScanned(false)}>
                Yeni QR Kod Tara
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QRMenu; 