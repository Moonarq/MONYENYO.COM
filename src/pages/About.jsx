
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../hooks/useLanguage'
import './About.css'
import aboutImg from '../assets/images/about.png';
import about1Img from '../assets/images/about1.png';
import about2Img from '../assets/images/about2.png';
import about3Img from '../assets/images/about3.png';

const About = () => {
  const { t } = useLanguage()

  // Apply About page styles to header
  React.useEffect(() => {
    document.body.classList.add('about-page')
    return () => {
      document.body.classList.remove('about-page')
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>About Us - Monyenyo</title>
        <meta name="description" content="Learn about Monyenyo's heritage, tradition, and commitment to authentic Indonesian brownies and pastries." />
        <link rel="icon" href="/images/favicon_large.ico" type="image/x-icon" />
      </Helmet>
      
      {/* About Hero Section */}
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
                <h1 
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh From The Kitchen Section */}
      <section className="fresh-section">
        <div className="container">
          <div className="fresh-header">
            <span className="fresh-label">{t('BEST SELLER')}</span>
            <h2 className="fresh-title">{t('FRESH FROM THE KITCHEN')}</h2>
            <p className="fresh-description">
            {t("Nikmati perpaduan sempurna antara cita rasa tradisional Indonesia dan teknik kuliner modern, yang diolah setiap hari dari bahan-bahan terbaik.")}
          </p>
          </div>
          
            
        <div className="fresh-grid">
          <div className="fresh-item">
            <div className="fresh-image">
              <img src={about1Img} alt={t('Cheese Roll Cocol')} />
            </div>
            <div className="fresh-content">
              <h3>{t('Cheese Roll Cocol')}</h3>
              <p>{t("Rasakan sensasi baru camilan kesukaanmu dengan cocolan stroberi dan vanila yang bikin nagih. Ngemil jadi makin seru.")}</p>
            </div>
          </div>
            
           <div className="fresh-item">
            <div className="fresh-image">
              <img src={about2Img} alt={t('Brownies Pastry Tabur Keju')} />
            </div>
            <div className="fresh-content">
              <h3>{t('Brownies Pastry Tabur Keju')}</h3>
              <p>{t("Brownies fudgy dengan keju serut yang dibalut pastry, terasa kenyal, nyoklat, dan manisnya pas. Kejunya melimpah di dalam.")}</p>
            </div>
          </div>
            
            <div className="fresh-item">
            <div className="fresh-image">
              <img src={about3Img} alt={t('Banana Strudel Mini')} />
            </div>
            <div className="fresh-content">
              <h3>{t('Banana Strudel Mini')}</h3>
              <p>{t("Berisi pisang, keju, dan cokelat pilihan, dibalut kulit pastry terbaik, camilan ini hadir dengan bentuk mini yang praktis.")}</p>
            </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
