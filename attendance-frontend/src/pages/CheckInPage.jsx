// src/pages/CheckInPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

function CheckInPage() {
  const [configMethod, setConfigMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Lấy cấu hình điểm danh khi component được tải
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        // Gắn token vào header cho các yêu cầu sau
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await apiClient.get('/config/method/');
        setConfigMethod(response.data.active_method);
      } catch (error) {
        console.error('Không thể lấy cấu hình:', error);
        setMessage({ type: 'error', text: 'Lỗi kết nối đến server.' });
      }
    };
    fetchConfig();
  }, [navigate]);

  // Khởi động camera nếu phương thức là 'face'
  useEffect(() => {
    if (configMethod === 'face') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Lỗi camera: ", err);
          setMessage({ type: 'error', text: 'Không thể truy cập camera.' });
        }
      };
      startCamera();

      // Dọn dẹp: Tắt camera khi component bị unmount
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [configMethod]);


  const handleGpsCheckIn = () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await apiClient.post('/attendance/check-in/', { latitude, longitude });
          setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Điểm danh GPS thất bại.' });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setMessage({ type: 'error', text: 'Không thể lấy vị trí GPS.' });
        setIsLoading(false);
      }
    );
  };

  const handleFaceCheckIn = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      // Chuyển ảnh từ canvas sang dạng base64
      const imageData = canvas.toDataURL('image/jpeg');

      try {
        const response = await apiClient.post('/attendance/check-in/', { image: imageData });
        setMessage({ type: 'success', text: response.data.message });
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Điểm danh khuôn mặt thất bại.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    apiClient.defaults.headers.common['Authorization'] = null;
    navigate('/login');
  };

  const renderCheckInUI = () => {
    if (!configMethod) {
      return <CircularProgress />;
    }

    if (configMethod === 'face') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '400px', border: '1px solid #ccc' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <Button variant="contained" onClick={handleFaceCheckIn} disabled={isLoading} sx={{ mt: 2 }}>
            Điểm danh bằng khuôn mặt
          </Button>
        </Box>
      );
    }

    if (configMethod === 'gps') {
      return (
        <Button variant="contained" onClick={handleGpsCheckIn} disabled={isLoading}>
          Điểm danh bằng GPS
        </Button>
      );
    }

    return null;
  };

  return (
    <Container>
      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Trang Điểm Danh
        </Typography>

        {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

        <Box sx={{ my: 4 }}>
          {isLoading ? <CircularProgress /> : renderCheckInUI()}
        </Box>

        <Button variant="outlined" color="error" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Box>
    </Container>
  );
}

export default CheckInPage;