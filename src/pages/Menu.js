import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { FaShoppingCart, FaFilter } from 'react-icons/fa';
import DataService from '../services/dataService';
import { toast } from 'react-toastify';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMenuItems();
    loadCart();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const items = await DataService.getMenuItems();
      setMenuItems(items);
      
      // Kategorileri çıkar
      const uniqueCategories = ['all', ...new Set(items.map(item => item.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Menü öğeleri yüklenirken bir hata oluştu');
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity >= item.stock) {
        toast.warning('Maksimum stok miktarına ulaştınız!');
        return;
      }
      const updatedCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      toast.success(`${item.name} sepete eklendi (${existingItem.quantity + 1} adet)`);
    } else {
      const newCart = [...cart, { ...item, quantity: 1 }];
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
      toast.success(`${item.name} sepete eklendi`);
    }
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Ürün sepetten çıkarıldı');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    if (item && newQuantity > item.stock) {
      toast.warning('Maksimum stok miktarına ulaştınız!');
      return;
    }
    
    const updatedCart = cart.map(cartItem =>
      cartItem.id === itemId
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getCartItemCount = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Menü</h1>
      
      {/* Kategori Filtresi */}
      <div className="mb-4">
        <Form.Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-auto"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Tüm Kategoriler' : category}
            </option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredItems.map(item => (
            <Col key={item.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={item.image} 
                  alt={item.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    <span>{item.name}</span>
                    <Badge bg="secondary" className="ms-2">
                      {item.price}₺
                    </Badge>
                  </Card.Title>
                  <Card.Text className="text-muted mb-3">
                    {item.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <small className="text-muted">
                        Stok: {item.stock}
                      </small>
                      <small className="text-muted">
                        Kategori: {item.category}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span className="text-secondary">
                          {getCartItemCount(item.id) > 0 && `Sepette: ${getCartItemCount(item.id)} adet`}
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => addToCart(item)}
                        disabled={item.stock === 0}
                      >
                        <FaShoppingCart className="me-1" />
                        {item.stock === 0 ? 'Tükendi' : 'Sepete Ekle'}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Menu; 