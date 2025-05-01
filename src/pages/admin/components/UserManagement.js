import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { toast } from 'react-toastify';
import './Table.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
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
      toast.success('Kullanıcı başarıyla güncellendi');
      handleModalClose();
      fetchUsers();
    } catch (error) {
      toast.error('Kullanıcı güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
      } catch (error) {
        toast.error('Kullanıcı silinirken bir hata oluştu');
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { text: 'Admin', icon: 'fas fa-user-shield' },
      staff: { text: 'Personel', icon: 'fas fa-user-tie' },
      user: { text: 'Kullanıcı', icon: 'fas fa-user' }
    };

    const config = roleConfig[role] || { text: role, icon: 'fas fa-user' };

    return (
      <span className={`status-badge ${role}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        <i className={`fas fa-${isActive ? 'check-circle' : 'times-circle'}`}></i>
        {isActive ? 'Aktif' : 'Pasif'}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive !== false) ||
                         (statusFilter === 'inactive' && user.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kullanıcı Yönetimi</h2>
      </div>

      {/* Table Filters */}
      <div className="table-filters">
        <Form.Control
          type="text"
          placeholder="İsim veya e-posta ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Form.Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tüm Roller</option>
          <option value="admin">Admin</option>
          <option value="staff">Personel</option>
          <option value="user">Kullanıcı</option>
        </Form.Select>
        <Form.Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </Form.Select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="table-empty-state">
          <i className="fas fa-users"></i>
          <p>Kullanıcı bulunamadı</p>
        </div>
      ) : (
        <Table className="admin-table">
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
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{getStatusBadge(user.isActive !== false)}</td>
                <td>
                  {user.createdAt?.toDate 
                    ? new Date(user.createdAt.toDate()).toLocaleDateString('tr-TR')
                    : '-'
                  }
                </td>
                <td>
                  <div className="table-actions">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleModalShow(user)}
                    >
                      <i className="fas fa-edit"></i>
                      Düzenle
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <i className="fas fa-trash"></i>
                      Sil
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

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