import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    role: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Kullanıcılar yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleModalShow = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        role: user.role || '',
        isActive: user.isActive !== false
      });
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      role: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), formData);
      toast.success('Kullanıcı başarıyla güncellendi!');
      handleModalClose();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Kullanıcı güncellenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success('Kullanıcı başarıyla silindi!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Kullanıcı silinirken bir hata oluştu.');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: 'danger',
      staff: 'warning',
      user: 'info'
    };

    return (
      <Badge bg={roleColors[role] || 'secondary'}>
        {role || 'Kullanıcı'}
      </Badge>
    );
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
    <div className="user-management">
      <h2 className="mb-4">Kullanıcı Yönetimi</h2>

      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Rol</th>
            <th>Durum</th>
            <th>Kayıt Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || '-'}</td>
              <td>{user.email}</td>
              <td>{getRoleBadge(user.role)}</td>
              <td>
                <Badge bg={user.isActive !== false ? 'success' : 'danger'}>
                  {user.isActive !== false ? 'Aktif' : 'Pasif'}
                </Badge>
              </td>
              <td>
                {user.createdAt?.toDate 
                  ? user.createdAt.toDate().toLocaleDateString('tr-TR')
                  : '-'
                }
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleModalShow(user)}
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Kullanıcı Düzenle</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {selectedUser && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>E-posta</Form.Label>
                  <Form.Control
                    type="email"
                    value={selectedUser.email}
                    disabled
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="">Seçiniz</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Personel</option>
                    <option value="user">Kullanıcı</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="isActive"
                    label="Aktif"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              İptal
            </Button>
            <Button variant="primary" type="submit">
              Güncelle
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 