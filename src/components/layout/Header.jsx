import React, { useState, useEffect, useRef } from 'react'
import logoImg from '../../assets/images/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useNavbarScroll } from '../../hooks/useNavbarScroll'
import { useCart } from '../../contexts/CartContext' // Pastikan path ini sesuai
import './Header.css'

const Header = () => {
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);
  const location = useLocation()
  const navigate = useNavigate()
  
  // Gunakan cart context untuk mendapatkan jumlah jenis produk
const { cartCount } = useCart();
const cartItemsCount = cartCount; // Jumlah jenis produk, bukan total quantity

  useEffect(() => {
    const updateNavbarSolid = () => {
      const isDesktop = window.innerWidth > 768;
      const pathname = location.pathname;
      const isSpecialPage = ['/about', '/menu', '/blogs', '/outlets', '/contact', '/cart', '/checkout', '/order-success','/terms'].some(p => pathname.includes(p));
      if (isDesktop && isSpecialPage) {
        setIsNavbarSolid(true);
      } else {
        if (window.scrollY > 50) {
          setIsNavbarSolid(true);
        } else {
          setIsNavbarSolid(false);
        }
      }
    };
    updateNavbarSolid();
    window.addEventListener('scroll', updateNavbarSolid);
    window.addEventListener('resize', updateNavbarSolid);
    return () => {
      window.removeEventListener('scroll', updateNavbarSolid);
      window.removeEventListener('resize', updateNavbarSolid);
    };
  }, [location.pathname]);

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const lastScrollPosition = useRef(0)
  
  useNavbarScroll()

  const saveScrollPosition = () => {
    lastScrollPosition.current = window.scrollY
  }

  const handleHamburgerClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isMenuOpen) {
      closeMobileMenu()
    } else {
      setIsMenuOpen(true)
      window.requestAnimationFrame(() => {
        document.body.classList.add('mobile-menu-active')
        document.body.style.position = 'fixed'
        document.body.style.top = `-${lastScrollPosition.current}px`
        document.body.style.left = '0'
        document.body.style.right = '0'
        document.body.style.width = '100%'
        document.body.style.overflow = 'hidden'
      })
    }
  }

  const closeMobileMenu = () => {
    setIsMenuOpen(false)
    document.body.classList.remove('mobile-menu-active')
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    document.documentElement.classList.add('no-smooth-scroll')
    setTimeout(() => {
      if (window.scrollY !== lastScrollPosition.current) {
        window.scrollTo({ top: lastScrollPosition.current, left: 0, behavior: 'auto' })
      }
      setTimeout(() => {
        document.documentElement.classList.remove('no-smooth-scroll')
        if (typeof window !== 'undefined') {
          const event = new window.Event('scroll');
          window.dispatchEvent(event);
        }
      }, 32)
    }, 0)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('mobile-menu-active')
    }
  }, [isMenuOpen])

  const handleHomeClick = (e) => {
    closeMobileMenu();
    setTimeout(() => {
      document.documentElement.classList.add('no-smooth-scroll');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      setTimeout(() => {
        document.documentElement.classList.remove('no-smooth-scroll');
      }, 32);
    }, 100);
  }

  const handleNavClick = () => {
    closeMobileMenu()
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleDesktopNavClick = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className={`header ${isNavbarSolid ? 'desktop-solid' : 'desktop-transparent'}`}> 
      <div className="container">
        {/* Mobile Left Section - Hamburger & Cart */}
        <div className="mobile-left-section">
          {/* Hamburger Menu Button (Mobile Only) */}
          <button 
            className={`hamburger-menu ${isMenuOpen ? 'active menu-open' : ''}`}
            onMouseDown={saveScrollPosition}
            onTouchStart={saveScrollPosition}
            onClick={handleHamburgerClick}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Mobile Cart Icon with Badge */}
          <Link to="/cart" className="mobile-cart-icon" aria-label="Cart">
            <i className="fas fa-shopping-cart"></i>
            {cartItemsCount > 0 && (
              <span className="cart-badge mobile-cart-badge">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="social-icons">
          <a 
            href="https://www.instagram.com/monyenyo.bdg?igsh=cXloM2VqczJ1YTY2" 
            className="social-link" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a 
            href="https://www.tiktok.com/@browniespastry_store?_t=ZS-8y6Z5ke8R1N&_r=1" 
            className="social-link" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <i className="fab fa-tiktok"></i>
          </a>
          <a 
            href="https://www.facebook.com/share/153Ak7u2jD/" 
            className="social-link"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook"></i>
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={handleHomeClick}
          >
            HOME
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={handleDesktopNavClick}
          >
            ABOUT
          </Link>
          <Link 
            to="/menu" 
            className={`nav-link ${isActive('/menu') ? 'active' : ''}`}
            onClick={handleDesktopNavClick}
          >
            MENU
          </Link>
        </nav>

        {/* Logo */}
        <div className="nav-logo">
          <Link to="/" className="logo-text" onClick={async (e) => {
            e.preventDefault();
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            } else {
              closeMobileMenu();
              navigate('/');
              setTimeout(() => {
                document.documentElement.classList.add('no-smooth-scroll');
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                setTimeout(() => {
                  document.documentElement.classList.remove('no-smooth-scroll');
                }, 32);
              }, 100);
            }
          }}>
            <img src={logoImg} alt="Monyenyo Logo" className="desktop-navbar-logo" style={{ height: 42, width: 160 }} />
          </Link>
        </div>

        {/* Right Navigation */}
        <nav className="nav-menu-right">
          <Link 
            to="/blogs" 
            className={`nav-link ${isActive('/blogs') ? 'active' : ''}`}
            onClick={handleDesktopNavClick}
          >
            TRACKING
          </Link>
          <Link 
            to="/outlets" 
            className={`nav-link ${isActive('/outlets') ? 'active' : ''}`}
            onClick={handleDesktopNavClick}
          >
            OUTLETS
          </Link>
          <Link 
            to="/contact" 
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={handleDesktopNavClick}
          >
            CONTACT
          </Link>
        </nav>

        {/* Language Toggle */}
        <div className="language-toggle">
          {/* Desktop Cart Icon with Badge */}
          <Link to="/cart" className="cart-icon" aria-label="Cart">
            <i className="fas fa-shopping-cart"></i>
            {cartItemsCount > 0 && (
              <span className="cart-badge desktop-cart-badge">
                {cartItemsCount}
              </span>
            )}
          </Link>
          <span 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            data-lang="en"
            onClick={() => handleLanguageChange('en')}
            style={{ cursor: 'pointer' }}
          >
            EN
          </span>
          <span className="lang-separator">|</span>
          <span 
            className={`lang-btn ${language === 'id' ? 'active' : ''}`}
            data-lang="id"
            onClick={() => handleLanguageChange('id')}
            style={{ cursor: 'pointer' }}
          >
            ID
          </span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target.classList.contains('mobile-menu-overlay')) {
            closeMobileMenu()
          }
        }}
      >
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <span className="mobile-logo">
              <img src={logoImg} alt="Monyenyo Logo" style={{ height: 50, width: 'auto' }} />
            </span>
            <button 
              className="close-menu" 
              onClick={closeMobileMenu}
              onTouchStart={closeMobileMenu}
            >
              &times;
            </button>
          </div>

          <nav className="mobile-nav">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={handleHomeClick}
            >
              HOME
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              ABOUT
            </Link>
            <Link 
              to="/menu" 
              className={`mobile-nav-link ${isActive('/menu') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              MENU
            </Link>
            <Link 
              to="/blogs" 
              className={`mobile-nav-link ${isActive('/blogs') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              TRACKING
            </Link>
            <Link 
              to="/outlets" 
              className={`mobile-nav-link ${isActive('/outlets') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              OUTLETS
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              CONTACT
            </Link>
          </nav>

          <div className="mobile-contact">
            <a href="tel:+6282295029308">
              <i className="fas fa-phone"></i>
              +62 822-9502-9308
            </a>
          </div>

          <div className="mobile-social">
            <span className="mobile-social-title">Follow Us</span>
            <div className="mobile-social-links">
              <a 
                href="https://www.instagram.com/kelvianov/" 
                className="mobile-social-link" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://www.tiktok.com/@apartmenttheringgo?is_from_webapp=1&sender_device=pc" 
                className="mobile-social-link" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="fab fa-tiktok"></i>
              </a>
              <a 
                href="#" 
                className="mobile-social-link"
              >
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header