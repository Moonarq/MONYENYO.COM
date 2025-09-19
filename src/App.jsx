import React from 'react'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import API_CONFIG from './config/api' // 👈 Import config
import Layout from './components/layout/Layout'
import ScrollToTop from './components/common/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import Menu from './pages/Menu'
import MenuDetail from './pages/MenuDetail'
import Blogs from './pages/Blogs'
import Outlets from './pages/Outlets'
import Contact from './pages/Contact'
import CartPage from './pages/Cart'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { CartProvider } from './contexts/CartContext.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import TermsPage from './pages/Terms.jsx'

// 👈 Use config instead of hardcoded URL
axios.defaults.baseURL = API_CONFIG.BASE_URL
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

function App() {
  useSmoothScroll()
  return (
    <CartProvider>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
          <Route path="/blogs" element={<Tracking />} />
          <Route path="/outlets" element={<Outlets />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </Layout>
    </CartProvider>
  )
}

export default App