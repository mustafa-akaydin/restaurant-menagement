import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Container, Button, Form, Alert } from 'react-bootstrap';
import DataService from '../services/dataService';
import { toast } from 'react-toastify';

const QRGenerator = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ipAddress, setIpAddress] = useState('restaurant-menagement.vercel.app'); // Production URL

  useEffect(() => {
    // Admin olarak giriş yapmış kullanıcının restoran bilgilerini al
    const fetchRestaurantInfo = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          setError('Restoran bilgilerine erişmek için giriş yapmalısınız');
          return;
        }

        // Kullanıcının restoran bilgilerini al
        const restaurantInfo = await DataService.getRestaurantInfo(user.id);
        if (restaurantInfo) {
          setRestaurantId(restaurantInfo.id);
          setRestaurantName(restaurantInfo.name);
        } else {
          // Eğer restoran bilgisi yoksa, yeni bir restoran oluştur
          const newRestaurant = await DataService.createRestaurant({
            name: user.name + ' Restoranı',
            ownerId: user.id,
            email: user.email
          });
          setRestaurantId(newRestaurant.id);
          setRestaurantName(newRestaurant.name);
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error);
        setError('Restoran bilgileri alınırken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, []);

  // QR kodun yönlendireceği URL'i oluştur
  const qrValue = `https://${ipAddress}/menu/${restaurantId}`;

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `menu-qr-${restaurantName || 'restaurant'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrValue)
      .then(() => {
        toast.success('URL kopyalandı!');
      })
      .catch(() => {
        toast.error('URL kopyalanırken bir hata oluştu');
      });
  };

  const handleIpChange = (e) => {
    setIpAddress(e.target.value);
  };

  if (loading) {
    return (
      <Container className="text-center mt-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="text-center mt-4">
      <h2 className="mb-4">QR Menü Oluşturucu</h2>
      {restaurantName && (
        <h4 className="mb-4">{restaurantName}</h4>
      )}
      <div className="mb-3">
        <QRCodeCanvas
          id="qr-code"
          value={qrValue}
          size={256}
          level="H"
          includeMargin={true}
        />
      </div>
      <div className="mb-3">
        <Form.Control
          type="text"
          value={`https://restaurant-menagement.vercel.app/menu/${restaurantId}`}
          readOnly
          className="text-center"
          onClick={copyToClipboard}
          style={{ cursor: 'pointer' }}
          title="Kopyalamak için tıklayın"
        />
      </div>
      <Button variant="primary" onClick={downloadQR}>
        QR Kodu İndir
      </Button>
    </Container>
  );
};

export default QRGenerator; 