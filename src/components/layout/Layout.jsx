import React from 'react'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFloat from '../common/WhatsAppFloat'
import { Helmet } from 'react-helmet-async'
import favicon from '../../assets/images/favicon_large.ico'

const Layout = ({ children }) => {
  return (
    <>
      <Helmet>
        <link rel="icon" type="image/x-icon" href={favicon} />
      </Helmet>

      <Header />
      <main>
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}

export default Layout
