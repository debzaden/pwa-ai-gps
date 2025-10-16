// src/pages/CourseListPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await apiClient.get('/my-courses/');
        setCourses(response.data);
      } catch (err) {
        setError('Không thể tải danh sách lớp học.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Danh sách Lớp học phần
        </Typography>
        <List>
          {courses.length > 0 ? (
            courses.map((course) => (
              <ListItem key={course.id} disablePadding>
                <ListItemButton component={RouterLink} to={`/check-in/${course.id}`}>
                  <ListItemText primary={course.name} secondary={course.code} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Typography>Bạn chưa được thêm vào lớp học nào.</Typography>
          )}
        </List>
      </Box>
    </Container>
  );
}

export default CourseListPage;