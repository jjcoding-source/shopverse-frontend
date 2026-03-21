import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/common/Layout";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import Home from "@/pages/Home";
import ProductListing from "@/pages/ProductListing";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserDashboard from "@/pages/UserDashboard";
import OrderHistory from "@/pages/OrderHistory";
import Wishlist from "@/pages/Wishlist";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes — with Navbar + Footer */}
      <Route element={<Layout />}>
        <Route path="/"           element={<Home />} />
        <Route path="/products"   element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart"       element={<Cart />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/checkout"   element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/dashboard"  element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/orders"     element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/wishlist"   element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      </Route>

      {/* Admin routes — with AdminLayout, no public Navbar */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
      <Route path="/admin/orders"   element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users"    element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;