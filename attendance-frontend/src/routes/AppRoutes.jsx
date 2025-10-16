// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CheckInPage from '../pages/CheckInPage';
import ProtectedRoute from './ProtectedRoute';
import CourseListPage from '../pages/CourseListPage'; // Import trang mới

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        {/* Trang chủ giờ là danh sách lớp học */}
        <Route path="/" element={<CourseListPage />} />
        {/* Trang điểm danh giờ có đường dẫn động */}
        <Route path="/check-in/:courseId" element={<CheckInPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;