// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import AdminPage from './AdminPage';
import ProductsPage from './ProductsPage'; // Import the new ProductsPage
import ProductDetailPage from './ProductDetailPage'; // Import the new ProductDetailPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path= "/admin"element={<AdminPage />} />
        {/* Route for product listing based on category and optional subcategory */}
        {/* This route needs to be before the generic /products for specific matches */}



        {/* Route for product listing page */}
        <Route path="/collection/:gender/:subcategoryName" element={<ProductsPage />} />
        {/* Route for individual product detail page */}
        <Route path="/product/:gender/:subcategoryName/:productId" element={<ProductDetailPage />} />


        {/* Add more routes here for other pages (e.g., ContactPage, etc.) */}
        {/* Wildcard route for 404 Not Found (optional) */}
        <Route path="*" element={<div><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p></div>} />
      </Routes>
    </Router>
  );
}

export default App;