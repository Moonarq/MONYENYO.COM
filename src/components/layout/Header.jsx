import React, { useState, useEffect, useRef } from 'react'
import logoImg from '../../assets/images/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useNavbarScroll } from '../../hooks/useNavbarScroll'
import './Header.css'

const Header = () => {
  // Example: useNavbarScroll returns a state or you can use your own scroll logic
  // For demonstration, let's assume you have a state called isNavbarSolid
  // You may need to adjust this logic to fit your actual scroll detection
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);

  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const updateNavbarSolid = () => {
      const isDesktop = window.innerWidth > 768;
      const pathname = location.pathname;
      const isSpecialPage = ['/about', '/menu', '/blogs', '/outlets', '/contact', '/cart', '/checkout', '/order-success'].some(p => pathname.includes(p));
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
  
  // Use navbar scroll hook
  useNavbarScroll()

  // Enhanced mobile menu functionality
  // Simpan posisi scroll secepat mungkin sebelum apapun berubah
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
    // Reset style body DULU
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    // Paksa scroll-behavior: auto di html sebelum scrollTo
    document.documentElement.classList.add('no-smooth-scroll')
    setTimeout(() => {
      if (window.scrollY !== lastScrollPosition.current) {
        window.scrollTo({ top: lastScrollPosition.current, left: 0, behavior: 'auto' })
      }
      // Hapus class setelah scrollTo (beri delay kecil agar pasti instant)
      setTimeout(() => {
        document.documentElement.classList.remove('no-smooth-scroll')
        // --- FORCE header update after menu close (mobile) ---
        // This will force the header to update its class (solid/coklat) instantly
        if (typeof window !== 'undefined') {
          const event = new window.Event('scroll');
          window.dispatchEvent(event);
        }
      }, 32)
    }, 0)
  }

  // Handle escape key and cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    // Cleanup function to ensure class is removed if component unmounts
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

  // Handle navigation with scroll to top
  const handleNavClick = () => {
    closeMobileMenu()
    // Use setTimeout to ensure navigation happens first, then scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  // Handle desktop navigation with scroll to top
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
              // Use navigate to go to home, then scroll to top after navigation
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
            BLOGS
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
  <Link to="/cart" className="cart-icon" aria-label="Cart">
    <i className="fas fa-shopping-cart"></i>
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
              BLOGS
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
