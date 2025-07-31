
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../hooks/useLanguage'
import { Link } from 'react-router-dom'
import './Menu.css'

import desktop1 from '../assets/images/desktop1.jpg';
import desktop2 from '../assets/images/desktop2.jpg';
import desktop3 from '../assets/images/desktop3.jpg';
import desktop4 from '../assets/images/desktop4.jpg';
import desktop5 from '../assets/images/desktop5.jpg';
import desktop6 from '../assets/images/desktop6.jpg';
import menu7 from '../assets/images/menu7.jpg';
import menu8 from '../assets/images/menu8.jpg';

const Menu = () => {
  const { t } = useLanguage();
  const [menuItems, setMenuItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Format harga dalam bentuk Rupiah
  const formatRupiah = (number) => {
    return 'Rp ' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0
    }).format(number);
  };

  React.useEffect(() => {
    document.body.classList.add('menu-page');
    return () => {
      document.body.classList.remove('menu-page');
    };
  }, []);

  React.useEffect(() => {
    const promoHTML = '<br/><span class="promo-badge promo-pulse">CLICK PROMO SPESIAL!</span>';
    fetch('http://localhost:8000/api/products')
      .then(res => res.json())
      .then(data => {
        setMenuItems(data.map(item => ({
          ...item,
          name: t(item.name),
          description: t(item.description) + promoHTML,
          category: t(item.category)
        })));
        setLoading(false);
      });
  }, [t]);

  return (
    <>
      <Helmet>
        <title>Menu - Monyenyo</title>
        <meta name="description" content="Explore our delicious menu of traditional Indonesian brownies, pastries, and specialty items." />
        <link rel="icon" href="/favicon_large.ico" type="image/x-icon" />
      </Helmet>
      <div className="menu-page">
        {/* Menu Header Section */}
        <section className="menu-hero">
          <div className="container">
            <div className="menu-header-content">
              <span className="menu-label">{t('KOLEKSI LEZAT KAMI')}</span>
              <h1 className="menu-title">{t('MENU CAMILAN')}</h1>
              <p className="menu-description">
                {t('Nikmati kreasi kuliner khas kami dengan bahan terbaik dan rasa istimewa untuk pengalaman camilan tak terlupakan.')}
              </p>
            </div>
          </div>
        </section>
        {/* Menu Items Section */}
        <section className="menu-items">
          <div className="container">
            <div className="menu-grid">
              {loading ? (
                [...Array(3)].map((_, idx) => (
                  <div key={idx} className="menu-item">
                    <div className="menu-image skeleton-loader" />
                    <div className="menu-content">
                      <div className="skeleton-title" style={{height: 28, width: '60%', marginBottom: 16, borderRadius: 8}} />
                      <div className="skeleton-text" style={{height: 60, width: '100%', marginBottom: 16, borderRadius: 8}} />
                      <div className="menu-details">
                        <div className="skeleton-row" style={{height: 20, width: 80, borderRadius: 8}} />
                        <div className="skeleton-row" style={{height: 20, width: 60, borderRadius: 8}} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                menuItems.map((item) => (
                  <Link
                    className="menu-item"
                    key={item.id}
                    to={`/menu/${item.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="menu-image">
                      <img
                        src={item.images && item.images.length > 0 ? `http://localhost:8000/storage/${item.images[0]}` : item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = item.image || '/images/placeholder.jpg';
                        }}
                      />
                      <div className="menu-overlay">
                        <div className="menu-price">{formatRupiah(item.price)}</div>
                      </div>
                    </div>
                    <div className="menu-content">
                      <h3 className="menu-name">{item.name}</h3>
                      <p className="menu-desc" dangerouslySetInnerHTML={{ __html: item.description }} />
                      <div className="menu-details">
                        <span className="menu-category">{item.category}</span>
                        <div className="menu-rating">
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
          </div>
        </section>
      </div>
    </>
  )
}

export default Menu
