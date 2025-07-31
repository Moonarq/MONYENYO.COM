import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const OrderSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  
  // Get data from checkout redirect
  const orderData = location.state?.orderData
  const checkoutData = location.state?.checkoutData

  // Redirect if no order data
  useEffect(() => {
    if (!orderData || !checkoutData) {
      navigate('/', { replace: true })
    }
  }, [orderData, checkoutData, navigate])

  if (!orderData || !checkoutData) {
    return null
  }

  // Payment method names mapping
  const paymentMethodNames = {
    bca: 'BCA Virtual Account',
    mandiri: 'Mandiri Virtual Account', 
    bri: 'BRI Virtual Account',
    alfamart: 'Alfamart / Alfamidi / Lawson',
    gopay: 'GoPay'
  }

  // Copy VA number to clipboard
  const copyVANumber = async () => {
    try {
      await navigator.clipboard.writeText(orderData.va_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  // Format expiration time (24 hours from now)
  const getExpirationTime = () => {
    const expiration = new Date()
    expiration.setHours(expiration.getHours() + 24)
    return expiration.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get payment instructions based on method
  const getPaymentInstructions = (method) => {
    switch (method) {
      case 'bca':
        return [
          'Buka aplikasi BCA Mobile atau KlikBCA',
          'Pilih menu "Transfer" → "Virtual Account"',
          'Masukkan nomor Virtual Account di atas',
          'Masukkan nominal pembayaran yang tepat',
          'Konfirmasi dan selesaikan pembayaran'
        ]
      case 'mandiri':
        return [
          'Buka aplikasi Livin by Mandiri',
          'Pilih menu "Bayar" → "Multipayment"',
          'Masukkan kode perusahaan 70012',
          'Masukkan nomor Virtual Account',
          'Konfirmasi dan selesaikan pembayaran'
        ]
      case 'bri':
        return [
          'Buka aplikasi BRImo',
          'Pilih menu "Pembayaran" → "BRIVA"',
          'Masukkan nomor BRIVA di atas',
          'Masukkan nominal pembayaran yang tepat',
          'Konfirmasi dan selesaikan pembayaran'
        ]
      case 'gopay':
        return [
          'Buka aplikasi Gojek atau GoPay',
          'Pilih "Bayar" dan scan QR code',
          'Atau masukkan kode pembayaran manual',
          'Konfirmasi dengan PIN GoPay Anda',
          'Simpan bukti pembayaran'
        ]
      case 'alfamart':
        return [
          'Kunjungi Alfamart/Alfamidi/Lawson terdekat',
          'Berikan kode pembayaran ke kasir',
          'Bayar sesuai nominal yang tertera',
          'Simpan struk sebagai bukti pembayaran', 
          'Pembayaran akan diproses otomatis'
        ]
      default:
        return ['Ikuti instruksi pembayaran yang dikirim via email/SMS']
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Check if mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    paddingTop: isMobile ? '7rem' : '8rem' // Responsive padding-top
  }

  const mainContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  }

  const successHeaderStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }

  const successIconStyle = {
    width: '48px',
    height: '48px',
    backgroundColor: '#28a745',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    fontSize: '20px',
    color: 'white'
  }

  const desktopGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  }

  const mobileStackStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }

  return (
    <>
      <Helmet>
        <title>Pembayaran Berhasil - Monyenyo</title>
        <meta name="description" content="Pesanan berhasil dibuat, silakan selesaikan pembayaran" />
        <link rel="icon" href="/images/favicon_large.ico" type="image/x-icon" />
      </Helmet>

      <div style={containerStyle}>
        <div style={mainContainerStyle}>
          
          {/* Success Header */}
          <div style={successHeaderStyle}>
            <div style={successIconStyle}>✓</div>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
              Pesanan Berhasil Dibuat!
            </h1>
            <p style={{ margin: '0', color: '#666', fontSize: '0.95rem' }}>
              Silakan selesaikan pembayaran dalam 24 jam
            </p>
          </div>

          <div style={isMobile ? mobileStackStyle : desktopGridStyle}>
            
            {/* Left Column - Payment Info */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                Informasi Pembayaran
              </h3>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>
                  Metode Pembayaran
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#333' }}>
                  {paymentMethodNames[checkoutData.paymentMethod]}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>
                  {checkoutData.paymentMethod === 'alfamart' ? 'Kode Pembayaran' : 'Nomor Virtual Account'}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.75rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  ...(isMobile && {
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '0.75rem'
                  })
                }}>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: isMobile ? '0.95rem' : '1rem', 
                    fontWeight: '600', 
                    flex: 1,
                    color: '#333',
                    ...(isMobile && {
                      textAlign: 'center',
                      wordBreak: 'break-all'
                    })
                  }}>
                    {orderData.va_number}
                  </span>
                  <button 
                    onClick={copyVANumber}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: copied ? '#28a745' : '#212529',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      ...(isMobile && {
                        alignSelf: 'center',
                        width: 'fit-content'
                      })
                    }}
                  >
                    {copied ? '✔ Tersalin' : 'Salin'}
                    </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>
                  Total Pembayaran
                </div>
                <div style={{ fontSize: isMobile ? '1.25rem' : '1.4rem', fontWeight: '700', color: '#28a745' }}>
                  {formatCurrency(orderData.grand_total)}
                </div>
              </div>

              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fff3cd', 
                borderRadius: '6px',
                border: '1px solid #ffeaa7'
              }}>
                <div style={{ fontWeight: '600', color: '#000000ff', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Selesaikan pembayaran sebelum:
                </div>
                <div style={{ color: '#000000ff', fontSize: '0.85rem' }}>
                  {getExpirationTime()}
                </div>
              </div>

              {/* Payment Instructions */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#333' }}>
                  Cara Pembayaran
                </h4>
                
             <ul style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                listStyleType: 'disc',
                paddingLeft: '1.25rem'
              }}>
                {getPaymentInstructions(checkoutData.paymentMethod).map((instruction, index) => (
                  <li key={index} style={{
                    color: '#444',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    lineHeight: '1.6',
                    marginBottom: '0.75rem'
                  }}>
                    {instruction}
                  </li>
                ))}
              </ul>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>
                Ringkasan Pesanan
              </h3>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ color: '#666', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Nomor Pesanan</span>
                  <span style={{ 
                    fontWeight: '600', 
                    fontFamily: 'monospace', 
                    fontSize: isMobile ? '0.8rem' : '0.9rem' 
                  }}>
                    {orderData.order_number}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Jumlah Item</span>
                  <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>{checkoutData.items.length} produk</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem' }}>
                {checkoutData.items.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'flex-start',
                    padding: '0.75rem 0',
                    borderBottom: index < checkoutData.items.length - 1 ? '1px solid #f8f9fa' : 'none',
                    ...(isMobile && {
                      flexDirection: 'column',
                      gap: '0.5rem'
                    })
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.name}</div>
                      {item.sku && <div style={{ fontSize: '0.8rem', color: '#666' }}>SKU: {item.sku}</div>}
                    </div>
                    <div style={{ 
                      marginLeft: isMobile ? '0' : '1rem', 
                      textAlign: 'right', 
                      minWidth: '80px',
                      ...(isMobile && {
                        alignSelf: 'flex-end'
                      })
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>×{item.quantity}</div>
                      <div style={{ fontWeight: '600', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>Subtotal</span>
                  <span style={{ fontSize: '0.9rem' }}>{formatCurrency(checkoutData.totals.subtotalBeforeVoucher)}</span>
                </div>
                
                {checkoutData.totals.totalVoucherDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#28a745' }}>
                    <span style={{ fontSize: '0.9rem' }}>Diskon Voucher</span>
                    <span style={{ fontSize: '0.9rem' }}>-{formatCurrency(checkoutData.totals.totalVoucherDiscount)}</span>
                  </div>
                )}

                {checkoutData.totals.shippingCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>Ongkos Kirim</span>
                    <span style={{ fontSize: '0.9rem' }}>{formatCurrency(checkoutData.totals.shippingCost)}</span>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: '700', 
                  fontSize: '1rem',
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '0.6rem',
                  marginTop: '0.6rem'
                }}>
                  <span>Total</span>
                  <span>{formatCurrency(orderData.grand_total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#333' }}>
                  Alamat Pengiriman
                </h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.4', color: '#555' }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{checkoutData.shippingAddress.name}</div>
                  <div style={{ marginBottom: '0.25rem' }}>{checkoutData.shippingAddress.phone}</div>
                  <div>
                    {checkoutData.shippingAddress.address}<br />
                    {checkoutData.shippingAddress.district}, {checkoutData.shippingAddress.regency}<br />
                    {checkoutData.shippingAddress.province} {checkoutData.shippingAddress.zipCode}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
        <div style={{ 
  display: 'flex', 
  gap: '1rem', 
  justifyContent: 'center',
  marginTop: isMobile ? '1.5rem' : '2rem',
  flexWrap: 'wrap',
  flexDirection: isMobile ? 'column' : 'row',
}}>
  {/* Tombol Lanjut Belanja */}
  <button 
    onClick={() => navigate('/menu')}
    style={{
      padding: '0.75rem 2rem',
      backgroundColor: '#7a3e14',
      color: '#fff',
      border: '1px solid #7a3e14',
      borderRadius: '8px',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      minWidth: '140px',
      width: isMobile ? '100%' : 'auto',
      transition: 'all 0.25s ease-in-out',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#5f2d0f';
      e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
      e.target.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#7a3e14';
      e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    Lanjut Belanja
  </button>

  {/* Tombol Lacak Pesanan */}
  <button 
    onClick={() => alert('Fitur tracking akan segera hadir!')}
    style={{
      padding: '0.75rem 2rem',
      backgroundColor: '#ffffff',
      color: '#7a3e14',
      border: '1.5px solid #7a3e14',
      borderRadius: '8px',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      minWidth: '140px',
      width: isMobile ? '100%' : 'auto',
      transition: 'all 0.25s ease-in-out',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#7a3e14';
      e.target.style.color = '#ffffff';
      e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
      e.target.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#ffffff';
      e.target.style.color = '#7a3e14';
      e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    Lacak Pesanan
  </button>
</div>


        </div>
      </div>
    </>
  )
}

export default OrderSuccess