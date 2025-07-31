import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../hooks/useLanguage'
import HeroSection from '../components/home/HeroSection'
import AboutSection from '../components/home/AboutSection'
import FreshSection from '../components/home/FreshSection'
import MenuSection from '../components/home/MenuSection'
import BlogPreviewSection from '../components/home/BlogPreviewSection'
import About from './About'

const Home = () => {
  const { t } = useLanguage()

  return (
    <>
      <Helmet>
        <title>{t("Monyenyo - Indonesia's Best Brownies Pastry")}</title>
  <meta name="description" content={t("Experience the perfect fusion of traditional Indonesian flavors with modern culinary techniques. Discover Monyenyo's signature brownies and pastries.")} />
  <meta name="keywords" content={t("Indonesian brownies, traditional pastry, Monyenyo, Jakarta food, Indonesian desserts")} />

  {/* Open Graph Meta */}
  <meta property="og:title" content="Monyenyo - Brownies Indonesia Terbaik" />
  <meta property="og:description" content="Coba brownies khas Indonesia dengan sentuhan modern." />
  <meta property="og:image" content="https://monyenyo.com/assets/share-image.jpg" />
  <meta property="og:url" content="https://monyenyo.com" />
  <meta property="og:type" content="website" />

  {/* Twitter Card Meta */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Monyenyo - Brownies Indonesia Terbaik" />
  <meta name="twitter:description" content="Coba brownies khas Indonesia dengan sentuhan modern." />
  <meta name="twitter:image" content="https://monyenyo.com/assets/share-image.jpg" />

  {/* Favicon */}
  <link rel="icon" href="/images/favicon_large.ico" type="image/x-icon" />

  {/* Preload hero images */}
  <link rel="preload" href="/images/desktop1.jpg" as="image" />
  <link rel="preload" href="/images/desktop2.jpg" as="image" />
  <link rel="preload" href="/images/desktop4.jpg" as="image" />

  {/* DNS prefetch for external resources */}
  <link rel="dns-prefetch" href="//fonts.googleapis.com" />
  <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
      </Helmet>

      <HeroSection />
      <AboutSection />
      <FreshSection />
      <MenuSection />
      
    </>
  )
}

export default Home
