import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useNavbarScroll } from '../hooks/useNavbarScroll';
import './Cart.css';
import { API_ENDPOINTS, getImageUrl } from '../config/api'



/**
 * Cart utility functions
 */
const CartUtils = {
  /**
   * Format price with Indonesian locale
   * @param {number} price - Price to format
   * @returns {string} Formatted price string
   */
  formatPrice: (price) => {
    return `Rp${Number(price).toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
  }
};

/**
 * API service for vouchers
 */
const VoucherAPI = {
  /**
   * Get all available vouchers
   */
  getVouchers: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VOUCHERS);
      if (!response.ok) throw new Error('Failed to fetch vouchers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }
  },

  /**
   * Validate voucher
   */
  validateVoucher: async (voucherName, totalAmount) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.VOUCHERS}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucher_name: voucherName,
          total_amount: totalAmount
        })
      });
      
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      console.error('Error validating voucher:', error);
      return { success: false, message: 'Error validating voucher' };
    }
  },

  /**
   * Apply voucher (increment usage)
   */
  applyVoucher: async (voucherName) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.VOUCHERS}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucher_name: voucherName
        })
      });
      
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error) {
      console.error('Error applying voucher:', error);
      return { success: false, message: 'Error applying voucher' };
    }
  }
};

/**
 * Trash Icon Component
 */
const TrashIcon = ({ width = 20, height = 20, className = '', style = {} }) => (
  <svg
    viewBox="-3 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    width={width}
    height={height}
    className={`trash-icon ${className}`}
    style={style}
  >
    <path
      d="M282,211 L262,211 C261.448,211 261,210.553 261,210 C261,209.448 261.448,209 262,209 L282,209 C282.552,209 283,209.448 283,210 C283,210.553 282.552,211 282,211 L282,211 Z M281,231 C281,232.104 280.104,233 279,233 L265,233 C263.896,233 263,232.104 263,231 L263,213 L281,213 L281,231 L281,231 Z M269,206 C269,205.447 269.448,205 270,205 L274,205 C274.552,205 275,205.447 275,206 L275,207 L269,207 L269,206 L269,206 Z M283,207 L277,207 L277,205 C277,203.896 276.104,203 275,203 L269,203 C267.896,203 267,203.896 267,205 L267,207 L261,207 C259.896,207 259,207.896 259,209 L259,211 C259,212.104 259.896,213 261,213 L261,231 C261,233.209 262.791,235 265,235 L279,235 C281.209,235 283,233.209 283,231 L283,213 C284.104,213 285,212.104 285,211 L285,209 C285,207.896 284.104,207 283,207 L283,207 Z M272,231 C272.552,231 273,230.553 273,230 L273,218 C273,217.448 272.552,217 272,217 C271.448,217 271,217.448 271,218 L271,230 C271,230.553 271.448,231 272,231 L272,231 Z M267,231 C267.552,231 268,230.553 268,230 L268,218 C268,217.448 267.552,217 267,217 C266.448,217 266,217.448 266,218 L266,230 C266,230.553 266.448,231 267,231 L267,231 Z M277,231 C277.552,231 278,230.553 278,230 L278,218 C278,217.448 277.552,217 277,217 C276.448,217 276,217.448 276,218 L276,230 C276,230.553 276.448,231 277,231 L277,231 Z"
      transform="translate(-259 -203)"
    />
  </svg>
);

/**
 * Quantity Control Component
 */
const QuantityControl = ({ quantity, onIncrease, onDecrease }) => (
  <div className="cart-quantity-controls">
    <button
      className="cart-qty-btn"
      onClick={onDecrease}
      aria-label="Decrease quantity"
      type="button"
    >
      -
    </button>
    <span className="cart-qty-value" aria-label={`Quantity: ${quantity}`}>
      {quantity}
    </span>
    <button
      className="cart-qty-btn"
      onClick={onIncrease}
      aria-label="Increase quantity"
      type="button"
    >
      +
    </button>
  </div>
);

/**
 * Product Info Component
 */
const ProductInfo = ({ item, onImageError }) => (
  <div className="cart-product-container">
    <img
      src={item.images && item.images.length > 0 
        ? getImageUrl(item.images[0])
        : item.image || '/images/placeholder.jpg'}
      alt={item.name}
      className="cart-product-img"
      onError={onImageError}
      loading="lazy"
    />
    <div className="cart-product-info">
      <div className="cart-product-name">{item.name}</div>
      <div className="cart-product-sku">{item.sku}</div>
    </div>
  </div>
);

/**
 * Cart Item Row Component
 */
const CartItemRow = ({ item, onQuantityChange, onRemove }) => {
  const handleImageError = useCallback((e) => {
    e.target.src = item.image || '/images/placeholder.jpg';
  }, [item.image]);

  const handleQuantityIncrease = useCallback(() => {
    onQuantityChange(item.id, 1);
  }, [item.id, onQuantityChange]);

  const handleQuantityDecrease = useCallback(() => {
    onQuantityChange(item.id, -1);
  }, [item.id, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <div className="cart-table-row" key={item.id}>
      {/* Product Column */}
      <div className="cart-table-col product">
        <ProductInfo item={item} onImageError={handleImageError} />
      </div>
      
      {/* Price Column */}
      <div className="cart-table-col price">
        <div className="base-price">
          {CartUtils.formatPrice(item.price)}
        </div>
      </div>
      
      {/* Quantity Column */}
      <div className="cart-table-col quantity">
        <QuantityControl
          quantity={item.quantity}
          onIncrease={handleQuantityIncrease}
          onDecrease={handleQuantityDecrease}
        />
      </div>
      
      {/* Total Column */}
      <div className="cart-table-col total">
        <div className="final-total">
          {CartUtils.formatPrice(item.price * item.quantity)}
        </div>
      </div>
      
      {/* Action Column */}
      <div className="cart-table-col action">
        <button
          className="cart-remove-btn"
          onClick={handleRemove}
          title="Remove item"
          aria-label={`Remove ${item.name} from cart`}
          type="button"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

/**
 * Combined Cart Summary with Voucher Selector Component
 */
const CartSummaryWithVoucher = ({ 
  totalItems, 
  subtotal, 
  cartVoucher,
  cartVoucherDiscount,
  finalTotal, 
  onContinueShopping,
  onCheckout,
  onVoucherApply,
  onVoucherRemove
}) => {
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Fetch available vouchers on component mount
  useEffect(() => {
    const fetchVouchers = async () => {
      const vouchers = await VoucherAPI.getVouchers();
      setAvailableVouchers(vouchers);
    };
    fetchVouchers();
  }, []);

  const handleVoucherSelect = async (voucher) => {
    setIsLoading(true);
    setValidationMessage('');

    const validation = await VoucherAPI.validateVoucher(voucher.name, subtotal);

    if (validation.success) {
      onVoucherApply(validation.voucher, validation.discount);
      setValidationMessage('Voucher berhasil diterapkan!');
      setIsDropdownOpen(false);
    } else {
      setValidationMessage(validation.message);
    }

    setIsLoading(false);
  };

  const handleVoucherRemove = () => {
    onVoucherRemove();
    setValidationMessage('');
    setIsDropdownOpen(false);
  };

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return `Berlaku s/d: ${new Date(dateString).toLocaleDateString('id-ID')}`;
  };

  return (
    <div className="cart-summary-box">
      <div className="cart-summary-title">Total Belanja</div>

      {/* Subtotal Row */}
      <div className="cart-summary-row">
        <span>
          SubTotal (
          <span className="cart-summary-items">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </span>
          )
        </span>
        <span className="cart-summary-subtotal">
          {CartUtils.formatPrice(subtotal)}
        </span>
      </div>

      {/* Voucher Section */}
      <div className="cart-voucher-section">
        <div className="voucher-selector-header">
          {cartVoucher ? (
            <>
              <span>Voucher Discount</span>
            <button
  className="voucher-remove-btn"
  onClick={handleVoucherRemove}
  type="button"
>
  <i className="fas fa-times"></i>
</button>

            </>
          ) : (
            <span
              onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
              style={{
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '190px',
                fontWeight: 500,
                userSelect: 'none'
              }}
            >
              Voucher Diskon <span style={{ fontSize: '20px' }}>{isLoading ? '...' : '˅'}</span>
            </span>
          )}
        </div>

        {/* Applied Voucher Display */}
        {cartVoucher && (
          <div className="cart-summary-row cart-summary-voucher">
            <span>
              {cartVoucher.name}
            </span>
            <span className="voucher-discount-amount">
              -{CartUtils.formatPrice(cartVoucherDiscount)}
            </span>
          </div>
        )}

        {/* Voucher Dropdown - Fixed Version */}
        {isDropdownOpen && !cartVoucher && (
          <div className="voucher-dropdown">
            {availableVouchers.length === 0 ? (
              <div className="voucher-empty">Tidak ada voucher tersedia</div>
            ) : (
              availableVouchers.map((voucher) => {
                const isDisabled = voucher.min_purchase && subtotal < voucher.min_purchase;
                
                return (
                  <div
                    key={voucher.id}
                    className={`voucher-option ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && !isLoading && handleVoucherSelect(voucher)}
                    style={{ cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="voucher-option-content">
                      <div className="voucher-option-header">
                        <div className="voucher-badge-container">
                          {/* Badge Hijau Universal */}
                          <span className="voucher-type-badge">
                            DISKON
                          </span>
                          <h4 className="voucher-name">{voucher.name}</h4>
                        </div>
                        
                        <div className="voucher-value-container">
                          {/* Nilai Voucher - Warna Hijau - FIXED FORMAT */}
                          <p className="voucher-value">
                            {voucher.type === 'percent'
                              ? `${voucher.value}% OFF`
                              : `${CartUtils.formatPrice(voucher.value)} OFF`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="voucher-option-details">
                        {/* Tanggal Berlaku - Menggunakan end_date */}
                        {voucher.end_date && (
                          <p className="voucher-expiry">
                            {formatDate(voucher.end_date)}
                          </p>
                        )}
                        
                        {/* Requirements dari Database - FIXED */}
                        <div className="voucher-requirements">
                          {voucher.min_purchase && (
                            <span className="voucher-requirement-badge">
                              Min. pembelian {CartUtils.formatPrice(voucher.min_purchase)}
                            </span>
                          )}
                          {voucher.max_discount && (
                            <span className="voucher-requirement-badge">
                              Max. diskon {CartUtils.formatPrice(voucher.max_discount)}
                            </span>
                          )}
                          {voucher.usage_limit && (
                            <span className="voucher-requirement-badge">
                              Terbatas {voucher.usage_limit} penggunaan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Validation Message */}
        {validationMessage && (
          <div className={`voucher-message ${cartVoucher ? 'success' : 'error'}`}>
            {validationMessage}
          </div>
        )}
      </div>

      {/* Total Row */}
      <div className="cart-summary-row cart-summary-total-row">
        <span>Total</span>
        <span className="cart-summary-total">
          {CartUtils.formatPrice(finalTotal)}
        </span>
      </div>

      {/* Action Buttons */}
      <button
        className="cart-checkout-btn"
        type="button"
        onClick={onCheckout}
      >
        Checkout Sekarang
      </button>
      <button
        className="cart-continue-btn"
        onClick={onContinueShopping}
        type="button"
      >
        Lanjut Belanja
      </button>
    </div>
  );
};

/**
 * Main Cart Page Component
 */
const CartPage = () => {
  // Reset voucher cart setiap kali halaman ini dibuka
  useEffect(() => {
    removeCartVoucher();
  }, []);
  const navigate = useNavigate();
  const { 
    cart, 
    handleQuantity, 
    removeItem, 
    clearCart,
    cartVoucher,
    cartVoucherDiscount,
    applyCartVoucher,
    removeCartVoucher,
    getCartTotals
  } = useCart();

  // Memoized cart calculations using CartContext
  const { subtotalBeforeVoucher, totalVoucherDiscount, finalTotal, totalItems } = getCartTotals();

  // Handler functions
  const handleQuantityChange = useCallback((id, delta) => {
    handleQuantity(id, delta);
  }, [handleQuantity]);

  const handleRemoveItem = useCallback((id) => {
    removeItem(id);
  }, [removeItem]);

  const handleClearCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const handleContinueShopping = useCallback(() => {
    navigate('/menu');
  }, [navigate]);

  const handleCheckout = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  const handleVoucherApply = useCallback((voucher, discount) => {
    applyCartVoucher(voucher, discount);
  }, [applyCartVoucher]);

  const handleVoucherRemove = useCallback(() => {
    removeCartVoucher();
  }, [removeCartVoucher]);

  // Early return for empty cart
  const isEmpty = cart.length === 0;

  return (
    <div className="cart-page">
      <h1 className="cart-title">Keranjang Belanja</h1>
      
      <div className="cart-container">
        {/* Cart Items Table */}
        <div className="cart-table-box">
          <div className="cart-table-header">
            <div className="cart-table-title">Keranjang Anda</div>
          </div>
          
          <div className="cart-table-content">
            {isEmpty ? (
              <div className="cart-empty-message">
                Keranjang Anda Kosong.
              </div>
            ) : (
              cart.map(item => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))
            )}
          </div>
          
          {/* Cart Footer */}
          <div className="cart-table-footer">
            <button
              className="cart-clear-btn"
              onClick={handleClearCart}
              disabled={isEmpty}
              type="button"
              aria-label="Clear all items from cart"
            >
              <TrashIcon width={16} height={16} style={{ marginRight: '6px' }} />
              Clear cart
            </button>
          </div>
        </div>

        {/* Combined Cart Summary with Voucher */}
        <CartSummaryWithVoucher
          totalItems={totalItems}
          subtotal={subtotalBeforeVoucher}
          cartVoucher={cartVoucher}
          cartVoucherDiscount={cartVoucherDiscount}
          finalTotal={finalTotal}
          onContinueShopping={handleContinueShopping}
          onCheckout={handleCheckout}
          onVoucherApply={handleVoucherApply}
          onVoucherRemove={handleVoucherRemove}
        />
      </div>
    </div>
  );
};

export default CartPage;