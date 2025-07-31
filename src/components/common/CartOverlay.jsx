import React, { useEffect, useRef } from 'react';
import './CartOverlay.css';
import { API_ENDPOINTS, getImageUrl } from '../../config/api'

const CartOverlay = ({ cart, visible, onClose, onUpdateQuantity, onRemoveItem }) => {
  const overlayRef = useRef();

  useEffect(() => {
    if (visible) {
      overlayRef.current?.focus();
    }
  }, [visible]);

  if (!visible) return null;

  // Calculate totals with voucher support
  const calculateItemTotal = (item) => {
    const basePrice = item.price * item.quantity;
    const voucherDiscount = (item.voucherDiscount || 0) * item.quantity;
    return Math.max(0, basePrice - voucherDiscount);
  };

  const subtotalBeforeVoucher = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalVoucherDiscount = cart.reduce((sum, item) => sum + ((item.voucherDiscount || 0) * item.quantity), 0);
  const finalTotal = Math.max(0, subtotalBeforeVoucher - totalVoucherDiscount);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    onRemoveItem(itemId);
  };

  return (
    <div className="cart-overlay-backdrop" onClick={onClose}>
      <aside
        className="cart-overlay-box"
        ref={overlayRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
      >
        <div className="cart-overlay-header">
          <span className="cart-overlay-title">Your cart</span>
          <button className="cart-overlay-close" onClick={onClose}>&times;</button>
        </div>
        <div className="cart-overlay-content">
          {cart.length === 0 ? (
            <div className="cart-overlay-empty">Keranjang kosong</div>
          ) : (
            cart.map(item => (
              <div className="cart-overlay-row" key={item.id}>
                <img
                  src={item.images && item.images.length > 0 ? getImageUrl(item.images[0]) : (item.image || '/images/placeholder.jpg')}
                  alt={item.name}
                  className="cart-overlay-img"
                  onError={e => { e.target.src = '/images/placeholder.jpg'; }}
                />
                <div className="cart-overlay-info">
                  <div className="cart-overlay-name">{item.name}</div>
                  
                  {/* Price Information with Voucher */}
                  <div className="cart-overlay-price-section">
                    <div className="cart-overlay-base-price">
                      Rp{Number(item.price).toLocaleString('id-ID')}
                      {item.quantity > 1 && (
                        <span className="price-multiplier"> x {item.quantity}</span>
                      )}
                    </div>
                    
                    {/* Show voucher discount if applied */}
                    {item.voucher && item.voucherDiscount > 0 && (
                      <div className="cart-overlay-voucher-info">
                        <span className="voucher-name">{item.voucher.name}</span>
                        <span className="voucher-discount">
                          -Rp{Number(item.voucherDiscount * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="cart-overlay-quantity-controls">
                    <button 
                      className="cart-overlay-qty-btn" 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <input
                      type="text"
                      className="cart-overlay-qty-input"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value) || 1;
                        if (!isNaN(newQty) && newQty > 0) {
                          handleQuantityChange(item.id, newQty);
                        }
                      }}
                      readOnly
                    />
                    <button 
                      className="cart-overlay-qty-btn" 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Remove Button and Item Total */}
                <div className="cart-overlay-item-total">
                  {/* Remove Button */}
                  <button 
                    className="cart-overlay-remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                  
                  {/* Item Total Price (after voucher discount) */}
                  <div className="cart-overlay-item-price">
                    Rp{calculateItemTotal(item).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-overlay-summary">
          <div className="cart-overlay-subtotal">
            SubTotal (<span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>)
            <span>Rp{subtotalBeforeVoucher.toLocaleString('id-ID')}</span>
          </div>
          
          {/* Show total voucher discount if any */}
          {totalVoucherDiscount > 0 && (
            <div className="cart-overlay-voucher-total">
              Voucher Discount
              <span>-Rp{totalVoucherDiscount.toLocaleString('id-ID')}</span>
            </div>
          )}
          
          <div className="cart-overlay-total">
            <b>Cart Total</b>
            <span><b>Rp{finalTotal.toLocaleString('id-ID')}</b></span>
          </div>
        </div>
        <div className="cart-overlay-actions">
          <button className="cart-overlay-view-btn" onClick={() => window.location.href = '/cart'}>View Cart</button>
          <button className="cart-overlay-continue-btn" onClick={onClose}>Checkout Now</button>
        </div>
      </aside>
    </div>
  );
};

export default CartOverlay;