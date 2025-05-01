import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import DataService from '../../../services/dataService';
import { toast } from 'react-toastify';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true,
    stock: 0
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const items = await DataService.getMenuItems();
      setMenuItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Menü öğeleri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleModalShow = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        isAvailable: item.isAvailable,
        stock: item.stock || 0
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isAvailable: true,
        stock: 0
      });
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true,
      stock: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Güncelleme işlemi
        await DataService.updateMenuItem(editingItem.id, formData);
        toast.success('Menü öğesi başarıyla güncellendi!');
      } else {
        // Yeni öğe ekleme
        await DataService.addMenuItem(formData);
        toast.success('Yeni menü öğesi başarıyla eklendi!');
      }
      handleModalClose();
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Menü öğesi kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu menü öğesini silmek istediğinizden emin misiniz?')) {
      try {
        await DataService.deleteMenuItem(id);
        toast.success('Menü öğesi başarıyla silindi!');
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Menü öğesi silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Menü Yönetimi</h2>
        <Button variant="primary" onClick={() => handleModalShow()}>
          <i className="fas fa-plus me-2"></i>
          Yeni Menü Öğesi
        </Button>
      </div>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Görsel</th>
            <th>Ad</th>
            <th>Açıklama</th>
            <th>Fiyat</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item.id}>
              <td>
                <img 
                  src={item.image || 'https://via.placeholder.com/50'} 
                  alt={item.name}
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.price}₺</td>
              <td>{item.category}</td>
              <td>{item.stock || 0}</td>
              <td>
                <span className={`badge bg-${item.isAvailable ? 'success' : 'danger'}`}>
                  {item.isAvailable ? 'Mevcut' : 'Tükendi'}
                </span>
              </td>
              <td>
                <Button 
                  variant="warning" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleModalShow(item)}
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? 'Menü Öğesi Düzenle' : 'Yeni Menü Öğesi Ekle'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Ad</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fiyat</Form.Label>
              <Form.Control
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Kategori Seçin</option>
                <option value="Pizza">Pizza</option>
                <option value="Makarna">Makarna</option>
                <option value="Ana Yemek">Ana Yemek</option>
                <option value="Tatlı">Tatlı</option>
                <option value="Çorba">Çorba</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stok</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Görsel URL</Form.Label>
              <Form.Control
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="isAvailable"
                label="Mevcut"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              İptal
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement; 