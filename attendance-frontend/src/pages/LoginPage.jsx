// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await apiClient.post('/auth/login/', formData);
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      // Chuyển hướng đến trang chính
      navigate('/');
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Đăng nhập
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="username" label="Tên đăng nhập" name="username" autoFocus onChange={handleChange} />
          <TextField margin="normal" required fullWidth name="password" label="Mật khẩu" type="password" id="password" onChange={handleChange} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Đăng nhập
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;