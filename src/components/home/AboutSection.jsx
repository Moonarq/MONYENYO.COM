import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import './AboutSection.css'
import aboutImg from '../../assets/images/about.png';

const AboutSection = () => {
  const { t } = useLanguage()
  
  return (
    <section className="about-hero" id="about">
      <div className="container">
        <div className="about-hero-split">
          <div className="hero-image-side">
            <div className="hero-image-container">
                <img src={aboutImg} alt="Monyenyo About" className="hero-image" />
            </div>
          </div>
          <div className="hero-content-side">
            <div className="hero-content">
              <span className="company-label">{t('MONYENYO')}</span>
              <h2 
                className="hero-main-title"
                dangerouslySetInnerHTML={{ __html: t('CEMILAN<br>RASA TERBARU DARI<br>MONYENYO') }}
              />
              
              <div className="hero-features">
                <div className="hero-feature">
                  <div className="feature-check">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.25 6.25L8.125 14.375L3.75 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>{t('Banana Strudel Mini')}</h3>
                    <p>{t("Dengan isian pisang, keju, dan cokelat pilihan, dibalut dengan kulit pastry olahan terbaik. Bentuknya yang mini menjadikan cemilan ini lebih praktis.")}</p>
                  </div>
                </div>
                
                <div className="hero-feature">
                  <div className="feature-check">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16.25 6.25L8.125 14.375L3.75 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="feature-text">
                    <h3>{t('Tradisi Bertemu Inovasi')}</h3>
                    <p>{t("Strudel berasal dari Eropa dan merupakan kue tradisional Austria serta Jerman dengan sejarah yang panjang. Di Indonesia, khususnya Banana Strudel, kue ini menjadi populer sebagai oleh-oleh khas dari Kota Malang.")}</p>
                  </div>
                </div>
              </div>
              
              <div className="about-cta">
                <Link to="/about" className="about-btn">{t("Produk Baru & Best Seller")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
