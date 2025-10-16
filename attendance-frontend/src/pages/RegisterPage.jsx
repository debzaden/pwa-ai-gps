// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // Import apiClient

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/auth/register/', formData);
      // Nếu đăng ký thành công, chuyển hướng đến trang đăng nhập
      navigate('/login');
    } catch (err) {
      // Xử lý lỗi (ví dụ: username đã tồn tại)
      setError('Đăng ký thất bại. Vui lòng thử lại.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Đăng ký
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="username" label="Tên đăng nhập" name="username" onChange={handleChange} />
          <TextField margin="normal" required fullWidth id="email" label="Email" name="email" type="email" onChange={handleChange} />
          <TextField margin="normal" required fullWidth name="password" label="Mật khẩu" type="password" id="password" onChange={handleChange} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Đăng ký
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default RegisterPage;