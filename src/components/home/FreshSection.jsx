import React from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import about1Img from '../../assets/images/about1.png';
import about2Img from '../../assets/images/about2.png';
import about3Img from '../../assets/images/about3.png';

const FreshSection = () => {
  const { t } = useLanguage()
  
  return (
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
  )
}

export default FreshSection
