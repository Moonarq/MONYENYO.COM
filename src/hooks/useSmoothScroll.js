import { useEffect } from 'react'

export const useSmoothScroll = () => {
  useEffect(() => {
    // Save language to localStorage on click
    const handleLanguageClick = () => {
      document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          const lang = btn.getAttribute('data-lang')
          if (lang) {
            localStorage.setItem('monyenyo_lang', lang)
          }
        })
      })
    }

    // Smooth scroll for internal blog link
    const handleBlogLinks = () => {
      document.querySelectorAll('a[href="#blogs"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault()
          const target = document.getElementById('blogs')
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobileMenuOverlay') || 
                              document.querySelector('.mobile-menu-overlay')
            if (mobileMenu && (mobileMenu.classList.contains('active') || 
                              mobileMenu.classList.contains('show'))) {
              mobileMenu.classList.remove('active', 'show')
            }
          }
        })
      })
    }

    // Initialize after DOM is ready
    const timer = setTimeout(() => {
      handleLanguageClick()
      handleBlogLinks()
    }, 100)

    return () => clearTimeout(timer)
  }, [])
}
