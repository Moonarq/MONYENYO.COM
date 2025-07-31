
import React, { useState, useEffect } from 'react'
import './HeroSection.css'

import desktop1 from '../../assets/images/desktop1.jpg';
import desktop2 from '../../assets/images/desktop2.jpg';
import desktop3 from '../../assets/images/desktop3.jpg';
import desktop4 from '../../assets/images/desktop4.jpg';
import desktop5 from '../../assets/images/desktop5.jpg';
import desktop6 from '../../assets/images/desktop6.jpg';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const slides = [
    {
      image: desktop1,
      subtitle: "Lembut. Gurih. Nagih.",
      title: "NIKMAT GURIHNYA!<br />BOLU ABON MONYENYO"
    },
    {
      image: desktop2,
      subtitle: "Nyoklat. Lembut. Nagih.",
      title: "NYOKLAT BANGET!<br />BROWNIES PASTRY"
    },
    {
      image: desktop3,
      subtitle: 'Manis. Lembut. Nagih.',
      title: 'CHOCO ROLL<br />SUPER NYOKLAT'
    },
    {
      image: desktop4,
      subtitle: "Nyoklat. Keju. Juara.",
      title: "BROWNIES PASTRY<br />PAKAI KEJU MELIMPAH!"
    },
    {
      image: desktop5,
      subtitle: "Keju. Gurih. Lezat.",
      title: "CHEESE ROLL<br />TOPPING MELIMPAH!"
    },
    {
      image: desktop6,
      subtitle: "Pisang. Manis. Lembut.",
      title: "BANANA STRUDEL<br />NAGIH BANGET!"
    },
  ]

  // Function to change slide with animation
  const changeSlide = (newSlide) => {
    setIsTransitioning(true)
    
    setTimeout(() => {
      setCurrentSlide(newSlide)
    }, 250) // Wait for fade out
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 750) // Total animation time
  }

  // Auto-play functionality - berubah setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (currentSlide + 1) % slides.length
      changeSlide(nextSlide)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [currentSlide, slides.length])

  // Manual dot navigation
  const goToSlide = (index) => {
    if (index !== currentSlide) {
      changeSlide(index)
    }
  }

  return (
    <main 
      className={`hero slide-${currentSlide + 1}`}
      id="home"
      style={{
        backgroundImage: `url(${slides[currentSlide].image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 1s ease-in-out'
      }}
    >
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <p 
              className={`hero-subtitle ${isTransitioning ? 'fade-out' : 'fade-in'}`}
              key={`subtitle-${currentSlide}`}
            >
              {slides[currentSlide].subtitle}
            </p>
            <h1 
              className={`hero-title ${isTransitioning ? 'fade-out' : 'fade-in'}`}
              dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
              key={`title-${currentSlide}`}
            ></h1>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="pagination-dots">
          {slides.map((_, index) => (
            <span 
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default HeroSection
