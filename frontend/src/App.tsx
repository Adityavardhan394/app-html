import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import RiderLayout from './layouts/RiderLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import UploadPrescription from './pages/UploadPrescription';
import Support from './pages/Support';
import EmergencySOS from './pages/EmergencySOS';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminInventory from './pages/admin/Inventory';
import AdminAnalytics from './pages/admin/Analytics';

// Rider Pages
import RiderDashboard from './pages/rider/Dashboard';
import RiderOrders from './pages/rider/Orders';
import RiderProfile from './pages/rider/Profile';

// Auth Guard
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import RiderRoute from './components/auth/RiderRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="emergency" element={<EmergencySOS />} />
          </Route>

          {/* Protected Customer Routes */}
          <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id/track" element={<OrderTracking />} />
            <Route path="profile" element={<Profile />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="upload-prescription" element={<UploadPrescription />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Rider Routes */}
          <Route path="/rider" element={<RiderRoute><RiderLayout /></RiderRoute>}>
            <Route index element={<RiderDashboard />} />
            <Route path="orders" element={<RiderOrders />} />
            <Route path="profile" element={<RiderProfile />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App; 