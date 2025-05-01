import React, { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Container, Button, Alert } from 'react-bootstrap';

const QRScanner = ({ onScan }) => {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);

  useEffect(() => {
    codeReader.current = new BrowserQRCodeReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError(null);
      
      const result = await codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            onScan(result.getText());
            stopScanning();
          }
          if (error && !(error instanceof Error)) {
            setError('QR kod okunamadı. Lütfen tekrar deneyin.');
          }
        }
      );
    } catch (err) {
      setError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  return (
    <Container className="text-center mt-4">
      <video
        ref={videoRef}
        style={{ width: '100%', maxWidth: '500px', display: isScanning ? 'block' : 'none' }}
      />
      
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      
      <div className="mt-3">
        {!isScanning ? (
          <Button variant="primary" onClick={startScanning}>
            QR Kodu Tara
          </Button>
        ) : (
          <Button variant="danger" onClick={stopScanning}>
            Taramayı Durdur
          </Button>
        )}
      </div>
    </Container>
  );
};

export default QRScanner; 