import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import DataService from './services/dataService';
import { Container } from 'react-bootstrap';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Reservations from './pages/Reservations';
import Profile from './pages/Profile';
import AdminPanel from './pages/admin/AdminPanel';
import Contact from './pages/Contact';
import Reservation from './pages/Reservation';
import NotFound from './pages/NotFound';
import QRMenu from './pages/QRMenu';
import QRGenerator from './components/QRGenerator';
import MyOrders from './pages/MyOrders';

// Auth Guard
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  useEffect(() => {
    // Uygulama başladığında örnek menü verilerini yükle
    DataService.initializeMenuData();
  }, []);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 pt-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/reservation" element={
              <PrivateRoute>
                <Reservation />
              </PrivateRoute>
            } />
            <Route path="/contact" element={<Contact />} />
            <Route path="/qr-menu" element={<QRMenu />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
            <Route path="/admin/qr-generator" element={
              <AdminRoute>
                <QRGenerator />
              </AdminRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
