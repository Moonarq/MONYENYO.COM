// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, getImageUrl as getApiImageUrl } from '../config/api'

const CartContext = createContext();

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

const setCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

// Get cart-level voucher from localStorage
const getCartVoucher = () => {
  try {
    return JSON.parse(localStorage.getItem('cartVoucher')) || null;
  } catch {
    return null;
  }
};

const setCartVoucher = (voucher) => {
  if (voucher) {
    localStorage.setItem('cartVoucher', JSON.stringify(voucher));
  } else {
    localStorage.removeItem('cartVoucher');
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCartState] = useState(getCart());
  const [cartVoucher, setCartVoucherState] = useState(getCartVoucher());
  const [cartVoucherDiscount, setCartVoucherDiscount] = useState(0);

  // Sync cart state to localStorage whenever cart changes
  useEffect(() => {
    setCart(cart);
  }, [cart]);

  // Sync cart voucher to localStorage whenever it changes
  useEffect(() => {
    setCartVoucher(cartVoucher);
  }, [cartVoucher]);

  // Update quantity function - matches CartOverlay usage
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity > 0) {
      setCartState(cart => 
        cart.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Handle quantity change with delta - matches Cart.jsx usage
  const handleQuantity = (id, delta) => {
    setCartState(cart =>
      cart.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Remove item function - matches both components
  const removeItem = (id) => {
    setCartState(cart => cart.filter(item => item.id !== id));
  };

  // Add to cart function - SIMPLIFIED: No voucher per item
  const addToCart = (item, qty = 1) => {
    setCartState(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      } else {
        // Ensure all necessary properties are included, but NO voucher per item
        return [...prev, { 
          ...item, 
          quantity: qty,
          // Ensure images array is preserved
          images: item.images || [],
          // Fallback for image property
          image: item.image || '/images/placeholder.jpg'
        }];
      }
    });
  };

  // Clear cart function - matches Cart.jsx usage
  const clearCart = () => {
    setCartState([]);
    setCartVoucherState(null);
    setCartVoucherDiscount(0);
  };

  // Calculate item total - SIMPLIFIED: No voucher per item
  const calculateItemTotal = (item) => {
    return item.price * item.quantity;
  };

  // Cart voucher functions
  const applyCartVoucher = (voucher, discount) => {
    setCartVoucherState(voucher);
    setCartVoucherDiscount(discount);
  };

  const removeCartVoucher = () => {
    setCartVoucherState(null);
    setCartVoucherDiscount(0);
  };

  // Calculate cart totals - UPDATED: Use cart-level voucher
  const getCartTotals = () => {
    const subtotalBeforeVoucher = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalVoucherDiscount = cartVoucherDiscount; // Cart-level voucher discount
    const finalTotal = Math.max(0, subtotalBeforeVoucher - totalVoucherDiscount);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotalBeforeVoucher,
      totalVoucherDiscount,
      finalTotal,
      totalItems
    };
  };

  // FIXED: Get proper image URL - Remove circular reference
  const getImageUrl = (item) => {
    // If item has images array from server, use the first one
    if (item.images && item.images.length > 0) {
      return getApiImageUrl(item.images[0]); // Use the imported function with different name
    }
    // If item has single image property
    if (item.image) {
      return getApiImageUrl(item.image);
    }
    // Otherwise use placeholder
    return '/images/placeholder.jpg';
  };

  const contextValue = {
    cart,
    updateQuantity,
    handleQuantity,
    removeItem,
    addToCart,
    clearCart,
    calculateItemTotal,
    getCartTotals,
    getImageUrl,
    
    // Cart-level voucher functions
    cartVoucher,
    cartVoucherDiscount,
    applyCartVoucher,
    removeCartVoucher,
    
    // ✅ FIXED: Computed values for easy access
    // cartCount: Jumlah jenis produk (bukan total quantity)
    cartCount: cart.length, // ✅ Ini yang benar - menghitung jumlah jenis produk
    // totalQuantity: Total semua quantity (untuk keperluan lain jika diperlukan)
    totalQuantity: cart.reduce((sum, item) => sum + item.quantity, 0),
    // cartTotal: Total harga setelah diskon voucher
    cartTotal: (() => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return Math.max(0, subtotal - cartVoucherDiscount);
    })()
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};