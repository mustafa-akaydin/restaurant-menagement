import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Modal, Spinner, Badge } from 'react-bootstrap';
import DataService from '../services/dataService';
import { toast } from 'react-toastify';

const Menu = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const items = await DataService.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Menü yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = (item) => {
    if (item.stock <= 0) {
      toast.warning('Bu ürün şu anda tükendi!');
      return;
    }
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedItem || selectedItem.stock < quantity) {
      toast.error('Yeterli stok bulunmamaktadır!');
      return;
    }

    try {
      const order = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity,
        price: selectedItem.price,
        totalPrice: selectedItem.price * quantity,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Siparişi ekle
      await DataService.addOrder(order);
      
      // Stok güncelleme
      const updatedStock = selectedItem.stock - quantity;
      await DataService.updateMenuItem(selectedItem.id, { stock: updatedStock });
      
      // Menüyü yenile
      await fetchMenuItems();
      
      toast.success('Siparişiniz alındı!');
      setShowModal(false);
      setQuantity(1);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Sipariş verilirken bir hata oluştu');
    }
  };

  const handleQuantityChange = (e) => {
    if (!selectedItem) return;
    
    const newQuantity = parseInt(e.target.value) || 1;
    const maxQuantity = selectedItem.stock;
    
    if (newQuantity > maxQuantity) {
      toast.warning(`Maksimum ${maxQuantity} adet sipariş verebilirsiniz!`);
      setQuantity(maxQuantity);
    } else if (newQuantity < 1) {
      setQuantity(1);
    } else {
      setQuantity(newQuantity);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Menü</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Menüde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Tüm Kategoriler' : category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredItems.map(item => (
          <Col key={item.id}>
            <Card className="h-100 shadow-sm">
              <Card.Img 
                variant="top" 
                src={item.image} 
                style={{ 
                  height: '250px', 
                  objectFit: 'cover',
                  borderBottom: '1px solid rgba(0,0,0,0.1)'
                }} 
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-2">
                  {item.name}
                  {item.stock <= 0 && (
                    <Badge bg="danger" className="ms-2">Tükendi</Badge>
                  )}
                </Card.Title>
                <Card.Text className="flex-grow-1 mb-3">{item.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <div>
                    <span className="h5 mb-0">{item.price} TL</span>
                    {item.stock > 0 && (
                      <small className="text-muted ms-2">Stok: {item.stock}</small>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => handleOrder(item)}
                    disabled={item.stock <= 0}
                    className="px-4"
                  >
                    {item.stock <= 0 ? 'Tükendi' : 'Sipariş Ver'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sipariş Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <h5>{selectedItem.name}</h5>
              <p>{selectedItem.description}</p>
              <Form.Group className="mb-3">
                <Form.Label>Adet</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={selectedItem.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                />
                <Form.Text className="text-muted">
                  {selectedItem.stock === 1 
                    ? 'Son 1 adet kaldı!' 
                    : `Maksimum ${selectedItem.stock} adet sipariş verebilirsiniz`}
                </Form.Text>
              </Form.Group>
              <p className="h5">
                Toplam: {selectedItem.price * quantity} TL
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmOrder}
            disabled={!selectedItem || quantity > selectedItem.stock}
          >
            Onayla
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Menu; 