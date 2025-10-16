import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CheckInPage from '../pages/CheckInPage';
import ProtectedRoute from './ProtectedRoute'; // Import component

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Bọc CheckInPage trong ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<CheckInPage />} />
      </Route>

      {/* Thêm các route cần bảo vệ khác vào trong này */}
    </Routes>
  );
}

export default AppRoutes;