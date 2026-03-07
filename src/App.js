import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage'; // Trang chủ cũ của bạn
import AdminPage from './AdminPage'; // Trang quản trị bí mật

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn mặc định là trang chủ */}
        <Route path="/" element={<HomePage />} />
        
        {/* Đường dẫn bí mật để vào Admin (Bạn có thể đổi tên tùy ý) */}
        <Route path="/admin-tiep-1992004" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;