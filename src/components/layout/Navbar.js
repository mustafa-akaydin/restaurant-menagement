import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown, Badge, Modal, Form, Table, Row, Col } from 'react-bootstrap';
import { isAdmin } from '../../utils/authUtils';
import { auth } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import DataService from '../../services/dataService';
import { FaShoppingCart, FaUser, FaTrash, FaList, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/tr';
import './Navbar.css';

moment.locale('tr');

const NavigationBar = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchName, setSearchName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: ''
  });
  const navigate = useNavigate();

  // Sepet verilerini güncelle
  const updateCart = useCallback(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await DataService.findUserByEmail(firebaseUser.email);
        if (userData) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name,
            role: userData.role
          });
        }
      } else {
        setUser(null);
      }
    });

    // İlk yüklemede sepeti al
    updateCart();

    // Her saniye sepeti kontrol et
    const interval = setInterval(updateCart, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [updateCart]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogout = async () => {
    try {
      await DataService.logout();
      setUser(null);
      setCart([]);
      localStorage.removeItem('cart');
      toast.success('Başarıyla çıkış yapıldı');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== itemId);
      toast.success('Ürün sepetten çıkarıldı');
      return newCart;
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      const item = prevCart.find(cartItem => cartItem.id === itemId);
      if (item && newQuantity > item.stock) {
        toast.warning('Maksimum stok miktarına ulaştınız!');
        return prevCart;
      }
      const newCart = prevCart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      return newCart;
    });
  };

  const formatPhoneNumber = useCallback((value) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Telefon numarası formatı: (5XX) XXX XX XX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else if (numbers.length <= 8) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`;
    }
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setOrderData(prev => ({ ...prev, customerPhone: formattedNumber }));
  }, [formatPhoneNumber]);

  const handleNameChange = useCallback((e) => {
    setOrderData(prev => ({ ...prev, customerName: e.target.value }));
  }, []);

  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value);
  }, []);

  const handleConfirmOrder = async () => {
    try {
      if (cart.length === 0) {
        toast.error('Lütfen en az bir ürün seçin');
        return;
      }

      if (!user && (!orderData.customerName || !orderData.customerPhone)) {
        toast.error('Lütfen ad soyad ve telefon bilgilerinizi girin');
        return;
      }

      const orderPayload = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        notes: orderNotes,
        // Misafir kullanıcı için girilen bilgileri kullan
        customerName: user ? user.name : orderData.customerName,
        customerPhone: user ? '' : orderData.customerPhone,
        // Giriş yapmış kullanıcı için ek bilgiler
        ...(user && {
          userId: user.id,
          customerEmail: user.email
        })
      };

      const result = await DataService.addOrder(orderPayload);
      
      // Stokları güncelle
      for (const item of cart) {
        const updatedStock = item.stock - item.quantity;
        await DataService.updateMenuItem(item.id, { stock: updatedStock });
      }
      
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      setCart([]);
      setOrderNotes('');
      setOrderData({ customerName: '', customerPhone: '' });
      setShowCartModal(false);
      
    } catch (error) {
      toast.error('Sipariş oluşturulurken bir hata oluştu: ' + error.message);
    }
  };

  const fetchOrders = async (userId = null) => {
    try {
      setLoading(true);
      const allOrders = await DataService.getOrders();
      
      let filteredOrders = allOrders;
      if (userId) {
        filteredOrders = allOrders.filter(order => order.userId === userId);
      } else if (searchName) {
        filteredOrders = allOrders.filter(order => 
          order.customerName.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      const sortedOrders = filteredOrders.sort((a, b) => 
        moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrders = (e) => {
    e.preventDefault();
    if (!searchName) {
      toast.error('Lütfen isim girin');
      return;
    }
    fetchOrders();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };

    const statusTexts = {
      pending: 'Beklemede',
      preparing: 'Hazırlanıyor',
      ready: 'Hazır',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };

    return (
      <Badge bg={statusColors[status]}>
        {statusTexts[status]}
      </Badge>
    );
  };

  // Siparişleri yükle
  useEffect(() => {
    if (showOrdersModal) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        fetchOrders(user.id);
      }
    }
  }, [showOrdersModal, user]);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="py-3 fixed-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <i className="fas fa-utensils me-2 text-secondary"></i>
            <span className="fw-bold">Restaurant</span>
          </Navbar.Brand>
          
          {/* Mobile Icons */}
          <div className="d-flex d-lg-none align-items-center">
            <button 
              type="button" 
              className="nav-action-btn me-2"
              onClick={() => setShowOrdersModal(true)}
            >
              <i className="fas fa-clipboard-list"></i>
              {orders.length > 0 && (
                <span className="badge">{orders.length}</span>
              )}
            </button>
            <button 
              type="button" 
              className="nav-action-btn me-2"
              onClick={() => setShowCartModal(true)}
            >
              <i className="fas fa-shopping-cart"></i>
              {cart.length > 0 && (
                <span className="badge">{getCartItemCount()}</span>
              )}
            </button>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
              <span className="navbar-toggler-icon"></span>
            </Navbar.Toggle>
          </div>

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="nav-link-custom position-relative">
                <i className="fas fa-home me-1"></i> Ana Sayfa
                <span className="nav-link-underline"></span>
              </Nav.Link>
              <Nav.Link as={Link} to="/menu" className="nav-link-custom position-relative">
                <i className="fas fa-list me-1"></i> Menü
                <span className="nav-link-underline"></span>
              </Nav.Link>
              {user && (
                <Nav.Link as={Link} to="/reservations" className="nav-link-custom position-relative">
                  <i className="fas fa-calendar-alt me-1"></i> Rezervasyonlar
                  <span className="nav-link-underline"></span>
                </Nav.Link>
              )}
            </Nav>
            <div className="nav-actions">
              <button 
                type="button" 
                className="nav-action-btn"
                onClick={() => setShowOrdersModal(true)}
              >
                <i className="fas fa-clipboard-list"></i>
                Siparişlerim
              </button>
              <button 
                type="button" 
                className="nav-action-btn"
                onClick={() => setShowCartModal(true)}
              >
                <i className="fas fa-shopping-cart"></i>
                Sepet
                {cart.length > 0 && (
                  <span className="badge">{cart.length}</span>
                )}
              </button>
              {user ? (
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="outline-secondary" 
                    id="dropdown-basic" 
                    className="d-flex align-items-center position-relative overflow-hidden"
                  >
                    <i className="fas fa-user-circle me-2"></i>
                    {user.name || 'Profil'}
                    <span className="button-ripple"></span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end shadow">
                    <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                      <i className="fas fa-user me-2 text-secondary"></i> Profil
                    </Dropdown.Item>
                    {isAdmin(user) && (
                      <Dropdown.Item as={Link} to="/admin" className="d-flex align-items-center">
                        <i className="fas fa-cog me-2 text-secondary"></i> Admin Paneli
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                      <i className="fas fa-sign-out-alt me-2 text-danger"></i> Çıkış Yap
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Button 
                    variant="outline-secondary" 
                    as={Link} 
                    to="/login"
                    className="me-2 position-relative overflow-hidden"
                  >
                    <i className="fas fa-sign-in-alt me-1"></i> Giriş Yap
                    <span className="button-ripple"></span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    as={Link} 
                    to="/register"
                    className="position-relative overflow-hidden"
                  >
                    <i className="fas fa-user-plus me-1"></i> Kayıt Ol
                    <span className="button-ripple"></span>
                  </Button>
                </>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Siparişler Modal */}
      <Modal show={showOrdersModal} onHide={() => setShowOrdersModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Siparişlerim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!user && (
            <div className="search-form">
              <Form onSubmit={handleSearchOrders}>
                <Row>
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Ad Soyad</Form.Label>
                      <Form.Control
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Adınız ve soyadınız"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button type="submit" variant="secondary" className="w-100">
                      <i className="fas fa-search me-1"></i>
                      Siparişleri Göster
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list fa-3x mb-3"></i>
              <p>Sipariş bulunamadı</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table>
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Müşteri</th>
                    <th>Ürünler</th>
                    <th>Toplam</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.orderNumber}</td>
                      <td>
                        {order.customerName}
                        {order.customerPhone && (
                          <div className="text-muted small">{order.customerPhone}</div>
                        )}
                      </td>
                      <td>
                        <ul className="list-unstyled mb-0">
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.name} x {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{order.total}₺</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowOrdersModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sepet Modal */}
      <Modal show={showCartModal} onHide={() => setShowCartModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Sepetim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-shopping-cart fa-3x mb-3"></i>
              <p>Sepetiniz boş</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="order-details">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                      />
                      <div>
                        <h6 className="mb-0">{item.name}</h6>
                        <p className="mb-0">{item.price} TL x {item.quantity}</p>
                        <small className="text-muted">Stok: {item.stock}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="order-details">
                <div className="d-flex justify-content-between">
                  <h6>Toplam:</h6>
                  <h6>{getCartTotal()} TL</h6>
                </div>
              </div>
              <div className="mt-3">
                <Form.Group>
                  <Form.Label>Sipariş Notu</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={orderNotes}
                    onChange={handleNotesChange}
                    placeholder="Siparişinizle ilgili notlarınızı buraya yazabilirsiniz..."
                  />
                </Form.Group>
                {!user && (
                  <div className="mt-3">
                    <Form.Group>
                      <Form.Label>Ad Soyad</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Adınız ve soyadınız"
                        value={orderData.customerName}
                        onChange={handleNameChange}
                      />
                    </Form.Group>
                    <Form.Group className="mt-2">
                      <Form.Label>Telefon</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="(5XX) XXX XX XX"
                        value={orderData.customerPhone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                      />
                    </Form.Group>
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCartModal(false)}>
            Kapat
          </Button>
          {cart.length > 0 && (
            <Button variant="secondary" onClick={handleConfirmOrder}>
              Siparişi Tamamla
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavigationBar; 