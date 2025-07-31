import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../hooks/useLanguage';
import './Contact.css';

const Contact = () => {
  const { t } = useLanguage();

  useEffect(() => {
    // Apply Contact page styles to header
    document.body.classList.add('contact-page');
    
    // AJAX Formspree submit
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      const form = e.target;
      const data = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      
      try {
        const response = await fetch('https://formspree.io/f/mblyzzkq', {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          // Tampilkan notifikasi toast kanan atas SETELAH submit sukses
          const toast = document.querySelector('.contact-toast-success');
          setTimeout(() => {
            toast.style.display = 'flex';
            toast.style.opacity = '1';
            setTimeout(() => {
              toast.style.opacity = '0';
              setTimeout(() => { toast.style.display = 'none'; }, 400);
            }, 3000);
          }, 200);
          // Reset form setelah submit sukses
          form.reset();
        } else {
          alert(t('Sorry, there was a problem sending your message. Please try again later.'));
        }
      } catch (err) {
        alert(t('Sorry, there was a problem sending your message. Please try again later.'));
      }
      
      submitBtn.disabled = false;
    };

    // Tombol close pada toast
    const handleToastClose = () => {
      const toast = document.querySelector('.contact-toast-success');
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 400);
    };

    // Pastikan toast selalu hidden saat halaman load
    const toast = document.querySelector('.contact-toast-success');
    if (toast) {
      toast.style.display = 'none';
      toast.style.opacity = '0';
    }

    // Add event listeners
    const form = document.querySelector('.contact-form');
    const closeBtn = document.querySelector('.toast-close-btn');
    
    form?.addEventListener('submit', handleFormSubmit);
    closeBtn?.addEventListener('click', handleToastClose);

    // Cleanup
    return () => {
      document.body.classList.remove('contact-page');
      form?.removeEventListener('submit', handleFormSubmit);
      closeBtn?.removeEventListener('click', handleToastClose);
    };
  }, [t]);

  return (
    <>
      <Helmet>
        <title>{t('Contact Us Today')} - Monyenyo</title>
        <meta name="description" content={t('Get in touch with Monyenyo. Contact us for inquiries, orders, or collaboration opportunities.')} />
        <link rel="icon" href="/images/favicon_large.ico" type="image/x-icon" />
      </Helmet>

      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero-section">
          <div className="container">
            <div className="contact-hero-content">
              <h1 className="contact-hero-title">{t('Contact Us Today')}</h1>
              <p className="contact-hero-subtitle">{t("We'd love to hear from you. Reach out for inquiries, orders, or collaboration opportunities.")}</p>
            </div>
          </div>
        </section>
        
        {/* Contact Form & Info */}
        <section className="contact-section">
          <div className="container contact-flex">
            <div className="contact-form-wrapper">
              <form className="contact-form" autoComplete="off">
                <div className="form-group">
                  <label htmlFor="name">{t('Name')}</label>
                  <input type="text" id="name" name="name" required placeholder={t('Your Name')} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('Email')}</label>
                  <input type="email" id="email" name="email" required placeholder={t('you@email.com')} />
                </div>
                <div className="form-group">
                  <label htmlFor="message">{t('Message')}</label>
                  <textarea id="message" name="message" rows="5" required placeholder={t('Type your message...')}></textarea>
                </div>
                <button type="submit" className="btn-primary">{t('Send Message')}</button>
              </form>
              
              {/* Notifikasi sukses di kanan atas, lebih turun dan ke kanan */}
              <div 
                className="contact-toast-success" 
                style={{
                  // display: 'none',
                  opacity: 0, 
                  position: 'fixed', 
                  top: '100px', 
                  right: '100px', 
                  zIndex: 9999, 
                  minWidth: '220px', 
                  maxWidth: '90vw', 
                  background: '#f0fdf4', 
                  color: '#2c7a4b', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 24px 0 rgba(44,122,75,0.13)', 
                  padding: '18px 28px 18px 20px', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  transition: 'opacity 0.3s'
                }}
              >
                <span style={{fontSize: '1.7rem', color: '#2c7a4b'}}>
                  <i className="fa-solid fa-circle-check"></i>
                </span>
                <span style={{fontSize: '1.08rem', fontWeight: 700}}>{t('Message sent successfully!')}</span>
                <button 
                  className="toast-close-btn" 
                  style={{
                    background: 'none', 
                    border: 'none', 
                    color: '#2c7a4b', 
                    fontSize: '1.2rem', 
                    marginLeft: 'auto', 
                    cursor: 'pointer', 
                    padding: '0 0 0 10px'
                  }} 
                  aria-label="Close notification"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Contact;
