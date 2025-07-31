import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export const useNavbarScroll = () => {
  const lastScrollY = useRef(0)
  const location = useLocation()

  useEffect(() => {
    const header = document.querySelector('.header')
    if (!header) return

    const updateNavbar = () => {
      const scrollY = window.scrollY
      const scrollDirection = scrollY > lastScrollY.current ? 'down' : 'up'
      const isMobile = window.innerWidth <= 768

      // Define pages that should have always-visible navbar
      const isAbout = location.pathname.includes('/about')
      const isMenu = location.pathname.includes('/menu')
      const isBlogs = location.pathname.includes('/blogs')
      const isOutlets = location.pathname.includes('/outlets')
      const isContact = location.pathname.includes('/contact')
      const isCartpage = location.pathname.includes('/cart')
      const isCheckout = location.pathname.includes('/checkout')
      const isOrderSuccess = location.pathname.includes('/order-success')
      const isTerms = location.pathname.includes('/terms')

      // Pages with always-visible navbar
      const isAlwaysVisiblePage = isAbout || isMenu || isBlogs || isOutlets || isContact || isCartpage || isCheckout || isOrderSuccess || isTerms

      if (isMobile) {
        // Mobile behavior
        header.classList.remove('hide-on-scroll', 'show-on-scroll-up')
        
        if (isAlwaysVisiblePage) {
          // For special pages (including cart), navbar hidden at top, visible when scrolling
          if (scrollY <= 50) {
            // At top - hide navbar completely
            header.classList.add('hide-on-scroll')
          } else {
            // When scrolling - show navbar
            header.classList.remove('hide-on-scroll')
            header.classList.add('show-on-scroll-up')
          }
        } else {
          // Normal behavior for other pages
          if (scrollY <= 50) {
            // At top - transparent navbar
          } else if (scrollDirection === 'down' && scrollY > 50) {
            header.classList.add('hide-on-scroll')
          } else if (scrollDirection === 'up' && scrollY > 50) {
            header.classList.add('show-on-scroll-up')
          }
        }
      } else {
        // Desktop behavior (unchanged)
        header.classList.remove('hide-on-scroll', 'show-on-scroll-up')
        header.classList.remove('desktop-transparent', 'desktop-solid')

        if (isAlwaysVisiblePage) {
          header.classList.add('desktop-solid')
        } else {
          if (scrollY > 100) {
            header.classList.add('desktop-solid')
          } else {
            header.classList.add('desktop-transparent')
          }
        }
      }

      lastScrollY.current = scrollY
    }

    // Initial call
    updateNavbar()

    // Add scroll listener
    window.addEventListener('scroll', updateNavbar)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateNavbar)
    }
  }, [location.pathname])
}