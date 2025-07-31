import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import './MenuSection.css'

const promoHTML = '<br/><span class="promo-badge promo-pulse">CLICK PROMO SPESIAL!</span>'

const MenuSection = () => {
  const { t } = useLanguage()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Format harga dalam bentuk Rupiah dengan koma sebagai pemisah ribuan
  const formatRupiah = (number) => {
    return 'Rp ' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0
    }).format(number)
  }

  useEffect(() => {
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        setMenuItems(data.map(item => ({
          ...item,
          name: t(item.name),
          description: t(item.description) + promoHTML,
          category: t(item.category)
        })))
        setLoading(false)
      })
  }, [t])

  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <div className="menu-section-header">
          <span className="menu-section-label">{t('KOLEKSI LEZAT KAMI')}</span>
          <h2 className="menu-section-title">{t('MENU CAMILAN')}</h2>
          <p className="menu-section-description">
            {t("Nikmati kreasi kuliner khas kami dengan bahan terbaik dan rasa istimewa untuk pengalaman camilan tak terlupakan.")}
          </p>
        </div>
        {/* Skeleton loader saat loading */}
        <div className="menu-section-grid">
          {loading ? (
            [...Array(3)].map((_, idx) => (
              <div key={idx} className="menu-section-item">
                <div className="menu-section-image skeleton-loader" />
                <div className="menu-section-content">
                  <div className="skeleton-title" style={{height: 28, width: '60%', marginBottom: 16, borderRadius: 8}} />
                  <div className="skeleton-text" style={{height: 60, width: '100%', marginBottom: 16, borderRadius: 8}} />
                  <div className="menu-section-details">
                    <div className="skeleton-row" style={{height: 20, width: 80, borderRadius: 8}} />
                    <div className="skeleton-row" style={{height: 20, width: 60, borderRadius: 8}} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            menuItems.map((item) => (
              <Link
                key={item.id}
                className="menu-section-item"
                to={`/menu/${item.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="menu-section-image">
                  <img 
                    src={
                      item.images && item.images.length > 0 
                        ? `http://localhost:8000/storage/${item.images[0]}` 
                        : item.image
                    } 
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = item.image || '/images/placeholder.jpg'
                    }}
                  />
                  <div className="menu-section-overlay">
                    <div className="menu-section-price">{formatRupiah(item.price)}</div>
                  </div>
                </div>
                <div className="menu-section-content">
                  <h3 className="menu-section-name">{item.name}</h3>
                  <p className="menu-section-desc" dangerouslySetInnerHTML={{ __html: item.description }} />
                  <div className="menu-section-details">
                    <span className="menu-section-category">{item.category}</span>
                    <div className="menu-section-rating">
                      {[...Array(5)].map((_, index) => (
                        <i key={index} className="fas fa-star"></i>
                      ))}
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="menu-section-cta">
          <Link to="/menu" className="menu-section-btn">{t('Lihat Semua Menu')}</Link>
        </div>
      </div>
    </section>
  )
}

export default MenuSection
