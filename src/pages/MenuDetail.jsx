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

// Sample review data
const sampleReviews = [
  {
    id: 1,
    rating: 5,
    comment: "Alhamdulillah barang sampai sesuai estimasi dengan selamat. Dijamin ori, segel ada. Kotak utuh dan tidak rusak. Kondisi barang sesuai dan terjamin ori",
    user: "F***l",
    date: "1 bulan lalu",
    images: [
      "/images/review1.jpg",
      "/images/review2.jpg"
    ]
  },
  {
    id: 2,
    rating: 5,
    comment: "Produk bagus sekali, fresh from the oven dan rasanya enak banget. Pengiriman cepat dan packaging rapi.",
    user: "A***n",
    date: "2 minggu lalu",
    images: []
  },
  {
    id: 3,
    rating: 4,
    comment: "Rasa enak, tapi agak manis untuk saya. Overall masih recommended sih.",
    user: "D***i",
    date: "3 hari lalu",
    images: ["/images/review3.jpg"]
  },
  {
    id: 4,
    rating: 5,
    comment: "Sudah langganan beli disini, selalu puas dengan kualitasnya. Mantap!",
    user: "R***o",
    date: "1 minggu lalu",
    images: []
  },
  {
    id: 5,
    rating: 3,
    comment: "Lumayan enak, tapi kemasan agak penyok waktu sampai.",
    user: "S***a",
    date: "5 hari lalu",
    images: []
  }
];

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

  // Review states
  const [reviews] = useState(sampleReviews);
  const [filteredReviews, setFilteredReviews] = useState(sampleReviews);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showWithMedia, setShowWithMedia] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);

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

  // Filter reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (selectedRating) {
      filtered = filtered.filter(review => review.rating === selectedRating);
    }

    // Filter by media
    if (showWithMedia) {
      filtered = filtered.filter(review => review.images && review.images.length > 0);
    }

    // Sort reviews
    if (sortBy === 'newest') {
      // Sort by newest (assuming newer reviews have higher IDs)
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.id - b.id);  
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    setFilteredReviews(filtered);
  }, [reviews, selectedRating, showWithMedia, sortBy]);

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

  // Calculate review statistics
  const calculateReviewStats = () => {
    const totalReviews = reviews.length;
    const ratingCounts = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };
    
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const satisfactionRate = Math.round((ratingCounts[4] + ratingCounts[5]) / totalReviews * 100);
    
    return {
      totalReviews,
      ratingCounts,
      averageRating: averageRating.toFixed(1),
      satisfactionRate
    };
  };

  const reviewStats = calculateReviewStats();

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

        {/* Review Section - DIPINDAHKAN KE PALING BAWAH */}
        <div className="review-section">
          <h3 className="section-title">ULASAN PEMBELI</h3>
          
          {/* Review Summary */}
          <div className="review-summary">
            <div className="rating-overview">
              <div className="rating-score">
                <span className="star-icon">⭐</span>
                <span className="score">{reviewStats.averageRating}</span>
                <span className="max-score">/ 5.0</span>
              </div>
              <div className="satisfaction-rate">
                {reviewStats.satisfactionRate}% pembeli merasa puas
              </div>
              <div className="total-reviews">
                {reviewStats.totalReviews} rating • {reviewStats.totalReviews} ulasan
              </div>
            </div>
            
            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-bar">
                  <div className="rating-label">
                    <span className="star-icon">⭐</span>
                    <span>{rating}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(reviewStats.ratingCounts[rating] / reviewStats.totalReviews) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="count">({reviewStats.ratingCounts[rating]})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Photos */}
          <div className="review-photos">
            <h4>FOTO & VIDEO PEMBELI</h4>
            <div className="photo-grid">
              {reviews.filter(r => r.images && r.images.length > 0)
                .slice(0, 6)
                .flatMap(r => r.images)
                .slice(0, 5)
                .map((image, idx) => (
                  <div key={idx} className="photo-item">
                    <img src={image} alt={`Review ${idx + 1}`} />
                  </div>
              ))}
              {reviews.filter(r => r.images && r.images.length > 0).length > 5 && (
                <div className="photo-item more-photos">
                  <span>+{reviews.filter(r => r.images && r.images.length > 0).length - 5}</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Filters */}
          <div className="review-filters">
            <div className="filter-section">
              <h4>FILTER ULASAN</h4>
              
              <div className="filter-group">
                <h5>Media</h5>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={showWithMedia}
                    onChange={(e) => setShowWithMedia(e.target.checked)}
                  />
                  <span>Dengan Foto & Video</span>
                </label>
              </div>

              <div className="filter-group">
                <h5>Rating</h5>
                {[5, 4, 3, 2, 1].map(rating => (
                  <label key={rating} className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedRating === rating}
                      onChange={(e) => setSelectedRating(e.target.checked ? rating : null)}
                    />
                    <span>
                      <span className="star-icon">⭐</span>
                      {rating}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="reviews-list">
              <div className="reviews-header">
                <h4>ULASAN PILIHAN</h4>
                <div className="reviews-info">
                  <span>Menampilkan {Math.min(10, filteredReviews.length)} dari {filteredReviews.length} ulasan</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="newest">Paling Membantu</option>
                    <option value="oldest">Terlama</option>
                    <option value="highest">Rating Tertinggi</option>
                    <option value="lowest">Rating Terendah</option>
                  </select>
                </div>
              </div>

              <div className="reviews-content">
                {(showAllReviews ? filteredReviews : filteredReviews.slice(0, 10)).map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                            ⭐
                          </span>
                        ))}
                        <span className="review-date">{review.date}</span>
                      </div>
                      <button className="review-menu">⋮</button>
                    </div>
                    
                    <div className="review-user">
                      <div className="user-avatar">
                        <span>{review.user.charAt(0)}</span>
                      </div>
                      <span className="user-name">{review.user}</span>
                    </div>

                    <div className="review-comment">
                      {review.comment}
                    </div>

                    {review.images && review.images.length > 0 && (
                      <div className="review-images">
                        {review.images.slice(0, 5).map((image, idx) => (
                          <div key={idx} className="review-image">
                            <img src={image} alt={`Review ${review.id} image ${idx + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredReviews.length > 10 && !showAllReviews && (
                <button 
                  className="show-more-reviews"
                  onClick={() => setShowAllReviews(true)}
                >
                  Lihat Semua Ulasan ({filteredReviews.length})
                </button>
              )}
            </div>
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