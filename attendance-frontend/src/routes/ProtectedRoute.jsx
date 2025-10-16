import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');

  // Nếu có token, cho phép truy cập. Nếu không, chuyển về trang login.
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;