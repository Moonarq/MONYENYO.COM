import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useNavbarScroll } from '../hooks/useNavbarScroll';
import './MenuDetail.css';
import CartOverlay from '../components/common/CartOverlay';
import ShareOverlay from '../components/common/ShareOverlay';
import MenuDetailVoucherSelector from '../components/common/MenuDetailVoucherSelector';
import { useCart } from '../contexts/CartContext';
import { API_ENDPOINTS, getImageUrl as getApiImageUrl } from '../config/api'

// Helper to get and set cart in localStorage
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

// Helper to get and set menu voucher in localStorage
const getMenuVoucher = () => {
  try {
    const menuVoucher = localStorage.getItem('menuVoucher');
    return menuVoucher ? JSON.parse(menuVoucher) : null;
  } catch {
    return null;
  }
};

const setMenuVoucher = (voucher) => {
  if (voucher) {
    localStorage.setItem('menuVoucher', JSON.stringify(voucher));
  } else {
    localStorage.removeItem('menuVoucher');
  }
};

// SOLUTION: Helper to clear menu voucher from localStorage
const clearMenuVoucher = () => {
  localStorage.removeItem('menuVoucher');
};

const MenuDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [infoOpen, setInfoOpen] = useState({
    info: false, 
    refund: false, 
    shipping: false
  });
  const { cart, addToCart, updateQuantity, removeItem } = useCart();
  const [cartOverlayOpen, setCartOverlayOpen] = useState(false);
  const [shareOverlayOpen, setShareOverlayOpen] = useState(false);

  // Menu voucher state
  const [menuVoucher, setMenuVoucherState] = useState(null);
  const [menuVoucherDiscount, setMenuVoucherDiscount] = useState(0);

  // Use navbar scroll hook
  useNavbarScroll();

  // Add menu-detail-page class to body for navbar styling
  useEffect(() => {
    document.body.classList.add('menu-detail-page');
    return () => {
      document.body.classList.remove('menu-detail-page');
    };
  }, []);

  // Selalu reset voucher setiap kali halaman ini dibuka
  useEffect(() => {
    clearMenuVoucher();
    setMenuVoucherState(null);
    setMenuVoucherDiscount(0);
  }, [id]);

  useEffect(() => {
    fetch(API_ENDPOINTS.PRODUCTS)
      .then(res => res.json())
      .then(data => {
        const found = data.find(m => String(m.id) === String(id));
        setItem(found);
        setLoading(false);
      });
  }, [id]);

  // Sync cart state to localStorage
  useEffect(() => {
    setCart(cart);
  }, [cart]);

  // Load menu voucher on component mount
  useEffect(() => {
    const savedMenuVoucher = getMenuVoucher();
    if (savedMenuVoucher) {
      setMenuVoucherState(savedMenuVoucher.voucher);
      setMenuVoucherDiscount(savedMenuVoucher.discount);
    }
  }, []);

  // FIXED: Function to get proper image URL
  const getItemImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('/images/')) {
      return imagePath;
    }
    
    // Otherwise, use API config to build full URL
    return getApiImageUrl(imagePath);
  };

  // Function to calculate discounted price
  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    if (!discountPercentage || discountPercentage <= 0) return originalPrice;
    return originalPrice - (originalPrice * discountPercentage / 100);
  };

  // Calculate total with voucher discount
  const calculateTotalWithVoucher = () => {
    if (!item) return 0;
    
    const finalPrice = item.discount_percentage && item.discount_percentage > 0 
      ? calculateDiscountedPrice(item.price, item.discount_percentage)
      : item.price;
    
    const subtotal = finalPrice * qty;
    return Math.max(0, subtotal - menuVoucherDiscount);
  };

  // Menu voucher handlers
  const handleMenuVoucherApplied = (voucher, discount) => {
    setMenuVoucherState(voucher);
    setMenuVoucherDiscount(discount);
    // Save to localStorage
    setMenuVoucher({ voucher, discount });
  };

  const handleMenuVoucherRemoved = () => {
    setMenuVoucherState(null);
    setMenuVoucherDiscount(0);
    // Remove from localStorage
    setMenuVoucher(null);
  };

  // SOLUTION: Modified Add to cart handler - Clear menu voucher when adding to cart
  const handleAddToCart = () => {
    if (!item) return;
    const finalPrice = item.discount_percentage && item.discount_percentage > 0 
      ? calculateDiscountedPrice(item.price, item.discount_percentage)
      : item.price;
    
    const itemToAdd = {
      id: item.id,
      name: item.name,
      price: finalPrice,
      originalPrice: item.price,
      discount_percentage: item.discount_percentage,
      image: item.image,
      images: item.images,
      sku: item.sku
    };
    
    addToCart(itemToAdd, qty);
    
    // SOLUTION: Clear menu voucher when adding to cart
    // This prevents the menu voucher from being carried over to cart checkout
    clearMenuVoucher();
    setMenuVoucherState(null);
    setMenuVoucherDiscount(0);
    
    setCartOverlayOpen(true);
  };

  // Buy Now handler - keep menu voucher data (unchanged)
  const handleBuyNow = () => {
    if (!item) return;
    
    const finalPrice = item.discount_percentage && item.discount_percentage > 0 
      ? calculateDiscountedPrice(item.price, item.discount_percentage)
      : item.price;
    
    const buyNowItem = {
      id: item.id,
      name: item.name,
      price: finalPrice,
      originalPrice: item.price,
      discount_percentage: item.discount_percentage,
      image: item.image,
      images: item.images,
      sku: item.sku,
      quantity: qty
    };
    
    navigate('/checkout', {
      state: {
        buyNowItem: buyNowItem,
        menuVoucher: menuVoucher ? { voucher: menuVoucher, discount: menuVoucherDiscount } : null
      }
    });
  };

  // Share handler
  const handleShare = () => {
    setShareOverlayOpen(true);
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="breadcrumb-skeleton"></div>
          <div className="product-container">
            <div className="product-gallery">
              <div className="main-image-skeleton"></div>
              <div className="thumbnail-list">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="thumbnail-skeleton"></div>
                ))}
              </div>
            </div>
            <div className="product-details">
              <div className="title-skeleton"></div>
              <div className="price-skeleton"></div>
              <div className="quantity-skeleton"></div>
              <div className="buttons-skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="product-page">
        <div className="container">
          <div className="error-state">
            <h2>{t('Produk tidak ditemukan')}</h2>
            <button onClick={() => navigate(-1)} className="btn-back">
              {t('Kembali')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cleanDescription = item.description;
  const sku = item ? item.sku : '';
  
  // Calculate discount values
  const hasDiscount = item.discount_percentage && item.discount_percentage > 0;
  const originalPrice = item.price;
  const discountedPrice = hasDiscount ? calculateDiscountedPrice(originalPrice, item.discount_percentage) : originalPrice;
  
  // Calculate subtotal before voucher
  const subtotalBeforeVoucher = discountedPrice * qty;
  
  return (
    <div className="product-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <a href="/" className="breadcrumb-link">Home</a>
          <span className="breadcrumb-divider">&gt;</span>
          <span className="breadcrumb-current">
            {t(item.name)}
          </span>
        </nav>

        {/* Main Product Container */}
        <div className="product-container">
          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={
                  item.images && item.images.length > 0 
                    ? getItemImageUrl(item.images[activeImg]) 
                    : getItemImageUrl(item.image)
                } 
                alt={t(item.name)} 
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            </div>
            
            <div className="thumbnail-list">
              {(item.images && item.images.length > 0 ? item.images : [item.image]).map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${activeImg === idx ? 'active' : ''}`}
                  onClick={() => setActiveImg(idx)}
                >
                  <img
                    src={getItemImageUrl(img)}
                    alt={`Gambar ${idx + 1}`}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details">
            <div className="product-header">
              <h1 className="product-name">{t(item.name)}</h1>
              <button className="share-btn" onClick={handleShare} title="Bagikan produk">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                </svg>
              </button>
            </div>
            
            {/* Price Section */}
            <div className="price-section">
              {hasDiscount ? (
                <>
                  <div className="discount-info">
                    <span className="discount-percentage">
                      {Math.round(item.discount_percentage)}%
                    </span>
                    <span className="original-price">
                      Rp{Number(originalPrice).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="current-price">
                    Rp{Number(discountedPrice).toLocaleString('id-ID')}
                  </div>
                </>
              ) : (
                <div className="current-price">
                  Rp{Number(originalPrice).toLocaleString('id-ID')}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info">
            
              <div className="info-row">
                <span className="info-label">Kategori:</span>
                <span className="info-value">{
                  (item.category_name || item.category || '-')
                    .toLowerCase()
                    .replace(/\b\w/g, c => c.toUpperCase())
                }</span>
              </div>
              <div className="info-row">
                <span className="info-label">Kondisi:</span>
                <span className="info-value">Fresh from the oven</span>
              </div>
            </div>

            {/* Voucher Section */}
            <div className="voucher-section">
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>Voucher</h4>
              <MenuDetailVoucherSelector
                totalAmount={subtotalBeforeVoucher}
                onVoucherApplied={handleMenuVoucherApplied}
                onVoucherRemoved={handleMenuVoucherRemoved}
                appliedVoucher={menuVoucher}
              />
            </div>

            {/* Price Summary with Voucher */}
            {/* {menuVoucherDiscount > 0 && (
              <div className="price-summary-section">
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>Rp{subtotalBeforeVoucher.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="price-row discount-row">
                    <span>Diskon Voucher:</span>
                    <span className="discount-amount">-Rp{menuVoucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="price-row total-row">
                    <span><strong>Total:</strong></span>
                    <span><strong>Rp{calculateTotalWithVoucher().toLocaleString('id-ID')}</strong></span>
                  </div>
                </div>
              </div>
            )} */}
            
            {/* Quantity and Actions */}
            <div className="purchase-section">
              <div className="quantity-section">
                <span className="quantity-label">Atur jumlah</span>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="text" 
                    value={qty} 
                    readOnly
                    className="qty-input"
                  />
                  <button 
                    className="qty-btn"
                    onClick={() => setQty(qty + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button 
                  className="btn-add-cart"
                  onClick={handleAddToCart}
                >
                  + Keranjang
                </button>
                <button 
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                >
                  Beli Langsung
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="description-section">
          <h3 className="section-title">Deskripsi Produk</h3>
          <div className="description-content">
            <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />
          </div>
        </div>

        {/* Additional Info */}
    <div className="additional-info">
      <div className={`info-accordion ${infoOpen.info ? 'open' : ''}`}>
        <button 
          className="accordion-header"
          onClick={() => setInfoOpen(o => ({...o, info: !o.info}))}
        >
          <span>Syarat Garansi Produk</span>
          <span className="accordion-icon">{infoOpen.info ? '−' : '+'}</span>
        </button>

        {infoOpen.info && (
          <div className="accordion-content">
            <div
              dangerouslySetInnerHTML={{
                __html: `
                  <p><strong>Bentuk Garansi :</strong> Jika produk yang diterima dalam kondisi rusak (berjamur) atau tidak layak dimakan, <strong>Garansi 100% uang kembali</strong>.</p>
                  <p><strong>Syarat :</strong> Kirimkan video unboxing tanpa jeda dari awal sampai akhir ke admin kami. Tanpa ada video unboxing, garansi tidak berlaku.</p>
                `
              }}
            />
          </div>
        )}
      </div>
        
          <div 
            className={`info-accordion ${infoOpen.shipping ? 'open' : ''}`}
          >
            <button 
              className="accordion-header"
              onClick={() => setInfoOpen(o => ({...o, shipping: !o.shipping}))}
            >
              <span>Informasi Pengiriman</span>
              <span className="accordion-icon">{infoOpen.shipping ? '−' : '+'}</span>
            </button>
            {infoOpen.shipping && (
              <div className="accordion-content">
                 <p><strong>Waktu pengiriman pesanan:</strong> pukul 20.00 sampai 22.00</p>
                  <p>Pemesanan di bawah pukul 12.00 dikirim di hari yang sama.</p>
                  <p>Pemesanan di atas jam 12.00 dikirim keesokan harinya.</p>
                  <p>Semua produk yang kami kirimkan <strong>fresh from the oven</strong>.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartOverlay 
        cart={cart} 
        visible={cartOverlayOpen} 
        onClose={() => setCartOverlayOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      <ShareOverlay 
        visible={shareOverlayOpen} 
        onClose={() => setShareOverlayOpen(false)}
        product={item}
      />
    </div>
  );
};

export default MenuDetail;