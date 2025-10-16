// src/pages/CheckInPage.jsx
import React, { useState, useEffect, useRef } from 'react';
// Thêm useParams để đọc ID từ URL
import { Container, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

function CheckInPage() {
  const { courseId } = useParams();
  console.log("Course ID từ URL:", courseId);
  // State mới để lưu trạng thái của cả 2 phương thức
const [config, setConfig] = useState({ face_enabled: false, gps_enabled: false });
  const [isLoading, setIsLoading] = useState(true); // Bật loading lúc đầu
  const [isCheckingIn, setIsCheckingIn] = useState(false); // State loading riêng cho việc điểm danh
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Lấy cấu hình điểm danh khi component được tải
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await apiClient.get('/config/method/');
        setConfig(response.data); // Lưu cả object cấu hình
      } catch (error) {
        console.error('Không thể lấy cấu hình:', error);
        setMessage({ type: 'error', text: 'Lỗi kết nối đến server.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [navigate]);

  // Khởi động camera nếu phương thức 'face' được bật
  useEffect(() => {
    if (config.face_enabled) {
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

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [config.face_enabled]);

  const handleGpsCheckIn = () => {
    setIsCheckingIn(true);
    setMessage({ type: '', text: '' });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Thêm 'course_section_id' vào request body
          const response = await apiClient.post('/attendance/check-in/', { 
          course_section_id: courseId, 
          method: 'gps', 
          latitude, 
          longitude
          });
          setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
          setMessage({ type: 'error', text: error.response?.data?.message || 'Điểm danh GPS thất bại.' });
        } finally {
          setIsCheckingIn(false);
        }
      },
      (_error) => {
        setMessage({ type: 'error', text: 'Không thể lấy vị trí GPS.' });
        setIsCheckingIn(false);
      }
    );
  };

  const handleFaceCheckIn = async () => {
    setIsCheckingIn(true);
    setMessage({ type: '', text: '' });
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      const imageData = canvas.toDataURL('image/jpeg');

      try {
        // Gửi kèm 'method'
        // Thêm 'course_section_id' vào request body
        const response = await apiClient.post('/attendance/check-in/', { 
          course_section_id: courseId, 
          method: 'face', 
          image: imageData 
        });
        setMessage({ type: 'success', text: response.data.message });
      } catch (error) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Điểm danh khuôn mặt thất bại.' });
      } finally {
        setIsCheckingIn(false);
      }
    }
  };

const handleLogout = () => {
  // 1. Xóa token khỏi localStorage của trình duyệt
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // 2. Xóa token khỏi header mặc định của axios để các yêu cầu sau không còn token nữa
  apiClient.defaults.headers.common['Authorization'] = null;

  // 3. Chuyển hướng người dùng về trang đăng nhập
  navigate('/login');
};

  return (
    <Container>
      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Điểm danh cho Lớp #{courseId}
        </Typography>

        {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {isCheckingIn && <CircularProgress />}
            
            {/* Hiển thị camera nếu điểm danh khuôn mặt được bật */}
            {config.face_enabled && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxWidth: '400px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <Button variant="contained" onClick={handleFaceCheckIn} disabled={isCheckingIn} sx={{ mt: 2 }}>
                  Điểm danh bằng khuôn mặt
                </Button>
              </Box>
            )}

            {/* Hiển thị nút GPS nếu điểm danh GPS được bật */}
            {config.gps_enabled && (
              <Button variant="contained" onClick={handleGpsCheckIn} disabled={isCheckingIn}>
                Điểm danh bằng GPS
              </Button>
            )}

            {!config.face_enabled && !config.gps_enabled && (
                <Typography>Chưa có phương thức điểm danh nào được bật.</Typography>
            )}

          </Box>
        )}

        <Button variant="outlined" color="error" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Box>
    </Container>
  );
}

export default CheckInPage;