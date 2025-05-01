import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DataService from '../services/DataService';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userData = await DataService.login(email, password);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Başarıyla giriş yapıldı');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form content */}
    </div>
  );
};

export default Login; 