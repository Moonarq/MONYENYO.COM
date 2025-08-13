import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const OrderSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  
  // ✅ FIXED: Better data extraction with safer fallbacks
  const orderData = location.state?.orderData
  const checkoutData = location.state?.checkoutData

  // ✅ Enhanced debug logging
  useEffect(() => {
    console.log('OrderSuccess - Full location.state:', location.state)
    console.log('OrderSuccess - orderData:', orderData)
    console.log('OrderSuccess - checkoutData:', checkoutData)
    
    // Log specific fields that might be missing
    if (orderData) {
      console.log('OrderSuccess - orderData.va_number:', orderData.va_number)
      console.log('OrderSuccess - orderData.grand_total:', orderData.grand_total)
    }
    
    if (checkoutData) {
      console.log('OrderSuccess - checkoutData.items:', checkoutData.items)
      console.log('OrderSuccess - checkoutData.totals:', checkoutData.totals)
    }
  }, [orderData, checkoutData, location.state])

  // ✅ FIXED: More lenient validation - only redirect if absolutely no data
  useEffect(() => {
    // Give some time for state to settle before checking
    const timeoutId = setTimeout(() => {
      if (!location.state || (!orderData && !checkoutData)) {
        console.warn('Missing all order and checkout data, redirecting to home')
        navigate('/', { replace: true })
      } else if (!orderData) {
        console.warn('Missing orderData but checkoutData exists, continuing...')
      } else if (!checkoutData) {
        console.warn('Missing checkoutData but orderData exists, continuing...')
      }
    }, 100) // Small delay to allow state to settle

    return () => clearTimeout(timeoutId)
  }, [orderData, checkoutData, navigate, location.state])

  // ✅ FIXED: Better loading state - show loading for longer while we have partial data
  if (!location.state) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Memuat data pesanan...</div>
        </div>
      </div>
    )
  }

  // ✅ ENHANCED: Much safer data access with comprehensive fallbacks
  const safeOrderData = {
    order_number: orderData?.order_number || 'N/A',
    grand_total: orderData?.grand_total || checkoutData?.totals?.grandTotal || 0,
    status: orderData?.status || 'pending',
    created_at: orderData?.created_at || new Date().toISOString(),
    va_number: orderData?.va_number || null,
    name: orderData?.name || checkoutData?.shippingAddress?.name || 'N/A',
    phone: orderData?.phone || checkoutData?.shippingAddress?.phone || 'N/A',
    address: orderData?.address || checkoutData?.shippingAddress?.address || 'N/A',
    district: orderData?.district || checkoutData?.shippingAddress?.district || 'N/A',
    regency: orderData?.regency || checkoutData?.shippingAddress?.regency || 'N/A',
    province: orderData?.province || checkoutData?.shippingAddress?.province || 'N/A',
    zip_code: orderData?.zip_code || checkoutData?.shippingAddress?.zipCode || 'N/A',
    jne_service: orderData?.jne_service || null
  }

  const safeCheckoutData = {
    items: checkoutData?.items || [],
    totals: {
      subtotalBeforeVoucher: checkoutData?.totals?.subtotalBeforeVoucher || 0,
      totalVoucherDiscount: checkoutData?.totals?.totalVoucherDiscount || 0,
      shippingCost: checkoutData?.totals?.shippingCost || 0,
      finalTotal: checkoutData?.totals?.finalTotal || 0,
      grandTotal: checkoutData?.totals?.grandTotal || safeOrderData.grand_total || 0
    },
    shippingAddress: {
      name: checkoutData?.shippingAddress?.name || safeOrderData.name || 'N/A',
      email: checkoutData?.shippingAddress?.email || 'N/A',
      phone: checkoutData?.shippingAddress?.phone || safeOrderData.phone || 'N/A',
      address: checkoutData?.shippingAddress?.address || safeOrderData.address || 'N/A',
      district: checkoutData?.shippingAddress?.district || safeOrderData.district || 'N/A',
      regency: checkoutData?.shippingAddress?.regency || safeOrderData.regency || 'N/A',
      province: checkoutData?.shippingAddress?.province || safeOrderData.province || 'N/A',
      zipCode: checkoutData?.shippingAddress?.zipCode || safeOrderData.zip_code || 'N/A'
    },
    paymentMethod: checkoutData?.paymentMethod || orderData?.payment_method || 'Unknown',
    useInsurance: checkoutData?.useInsurance ?? false,
    insuranceCost: checkoutData?.insuranceCost || 0,
    selectedShipping: checkoutData?.selectedShipping || 'reguler',
    selectedService: checkoutData?.selectedService || safeOrderData.jne_service || null,
    notes: checkoutData?.notes || null,
    vouchers: checkoutData?.vouchers || {}
  }

  // ✅ Enhanced debug logging for processed data
  useEffect(() => {
    console.log('OrderSuccess - Processed safeOrderData:', safeOrderData)
    console.log('OrderSuccess - Processed safeCheckoutData:', safeCheckoutData)
    console.log('OrderSuccess - Payment Method Debug:', {
      checkoutDataPaymentMethod: checkoutData?.paymentMethod,
      orderDataPaymentMethod: orderData?.payment_method,
      finalPaymentMethod: safeCheckoutData.paymentMethod
    })
  }, [])

  // Payment method names mapping
  const paymentMethodNames = {
    // Virtual Accounts
    bca: 'BCA Virtual Account',
    mandiri: 'Mandiri Virtual Account', 
    bri: 'BRI Virtual Account',
    bni: 'BNI Virtual Account',
    permata: 'Permata Virtual Account',
    'CIMB NIAGA': 'CIMB Niaga Virtual Account',
    
    // E-Wallets
    gopay: 'GoPay',
    ovo: 'OVO',
    dana: 'DANA',
    shopeepay: 'ShopeePay',
    linkaja: 'LinkAja',
    
    // Retail Outlets
    alfamart: 'Alfamart / Alfamidi / Lawson',
    indomaret: 'Indomaret',
    
    // Cash on Delivery
    COD: 'Cash on Delivery (COD)',
    cod: 'Cash on Delivery (COD)'
  }

  // Copy VA number to clipboard
  const copyVANumber = async () => {
    try {
      if (!safeOrderData.va_number) {
        console.warn('No VA number to copy')
        return
      }
      await navigator.clipboard.writeText(safeOrderData.va_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback untuk browser yang tidak support clipboard API
      try {
        const textArea = document.createElement('textarea')
        textArea.value = safeOrderData.va_number
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr)
        // Show manual copy instruction
        alert(`Silakan salin nomor VA secara manual: ${safeOrderData.va_number}`)
      }
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
      case 'bni':
        return [
          'Buka aplikasi BNI Mobile Banking',
          'Pilih menu "Transfer" → "Virtual Account Billing"',
          'Masukkan nomor Virtual Account',
          'Masukkan nominal pembayaran yang tepat',
          'Konfirmasi dan selesaikan pembayaran'
        ]
      case 'permata':
        return [
          'Buka aplikasi PermataMobile X',
          'Pilih menu "Pembayaran" → "Virtual Account"',
          'Masukkan nomor Virtual Account',
          'Masukkan nominal pembayaran yang tepat',
          'Konfirmasi dan selesaikan pembayaran'
        ]
      case 'CIMB NIAGA':
        return [
          'Buka aplikasi OCTO Mobile',
          'Pilih menu "Pay Bills" → "Virtual Account"',
          'Masukkan nomor Virtual Account',
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
      case 'ovo':
        return [
          'Buka aplikasi OVO',
          'Pilih "Pay" dan scan QR code',
          'Atau masukkan kode pembayaran manual',
          'Konfirmasi dengan PIN OVO Anda',
          'Simpan bukti pembayaran'
        ]
      case 'dana':
        return [
          'Buka aplikasi DANA',
          'Pilih "Bayar" dan scan QR code',
          'Atau masukkan kode pembayaran manual',
          'Konfirmasi dengan PIN DANA Anda',
          'Simpan bukti pembayaran'
        ]
      case 'shopeepay':
        return [
          'Buka aplikasi ShopeePay',
          'Pilih "Bayar" dan scan QR code',
          'Atau masukkan kode pembayaran manual',
          'Konfirmasi dengan PIN ShopeePay Anda',
          'Simpan bukti pembayaran'
        ]
      case 'linkaja':
        return [
          'Buka aplikasi LinkAja',
          'Pilih "Bayar" dan scan QR code',
          'Atau masukkan kode pembayaran manual',
          'Konfirmasi dengan PIN LinkAja Anda',
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
      case 'indomaret':
        return [
          'Kunjungi Indomaret terdekat',
          'Berikan kode pembayaran ke kasir',
          'Bayar sesuai nominal yang tertera',
          'Simpan struk sebagai bukti pembayaran',
          'Pembayaran akan diproses otomatis'
        ]
      case 'COD':
      case 'cod':
        return [
          'Pesanan akan dikirim ke alamat tujuan',
          'Siapkan uang pas sesuai total pembayaran',
          'Bayar langsung ke kurir saat barang tiba',
          'Periksa kondisi barang sebelum pembayaran',
          'Simpan struk pembayaran dari kurir'
        ]
      default:
        return ['Ikuti instruksi pembayaran yang dikirim via email/SMS']
    }
  }

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0)
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount)
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

  // ✅ ENHANCED: Better responsive styling
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
              {['COD', 'cod'].includes(safeCheckoutData.paymentMethod) 
                ? 'Pesanan akan diproses dan dikirim ke alamat tujuan'
                : 'Silakan selesaikan pembayaran dalam 24 jam'
              }
            </p>
            {/* ✅ Show order number prominently */}
            <p style={{ 
              margin: '0.5rem 0 0', 
              color: '#333', 
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              fontWeight: '600',
              backgroundColor: '#f8f9fa',
              padding: '0.5rem',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              Order: {safeOrderData.order_number}
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
                  {paymentMethodNames[safeCheckoutData.paymentMethod] || 'Unknown Payment Method'}
                </div>
              </div>

              {/* ✅ FIXED: Better VA number handling - Hide for COD */}
              {safeOrderData.va_number && !['COD', 'cod'].includes(safeCheckoutData.paymentMethod) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>
                    {safeCheckoutData.paymentMethod === 'alfamart' || safeCheckoutData.paymentMethod === 'indomaret' ? 'Kode Pembayaran' : 'Nomor Virtual Account'}
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
                      {safeOrderData.va_number}
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
              )}

              {/* ✅ Show message if no VA number yet (except for COD) */}
              {!safeOrderData.va_number && !['COD', 'cod'].includes(safeCheckoutData.paymentMethod) && (
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  backgroundColor: '#fff3cd',
                  borderRadius: '6px',
                  border: '1px solid #ffeaa7'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#856404' }}>
                    Nomor pembayaran sedang diproses dan akan dikirim via email/SMS dalam beberapa menit.
                  </div>
                </div>
              )}

              {/* ✅ Special message for COD */}
              {['COD', 'cod'].includes(safeCheckoutData.paymentMethod) && (
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '1rem',
                  backgroundColor: '#d1ecf1',
                  borderRadius: '6px',
                  border: '1px solid #bee5eb'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#0c5460', fontWeight: '500' }}>
                    ✅ Pesanan COD berhasil dibuat! Pembayaran dilakukan saat barang diterima.
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>
                  Total Pembayaran
                </div>
                <div style={{ fontSize: isMobile ? '1.25rem' : '1.4rem', fontWeight: '700', color: '#28a745' }}>
                  {formatCurrency(safeOrderData.grand_total)}
                </div>
              </div>

              {/* ✅ Show expiration time only for non-COD payments */}
              {!['COD', 'cod'].includes(safeCheckoutData.paymentMethod) && (
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
              )}

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
                  {getPaymentInstructions(safeCheckoutData.paymentMethod).map((instruction, index) => (
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
                    {safeOrderData.order_number}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>Jumlah Item</span>
                  <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                    {safeCheckoutData.items.length} produk
                  </span>
                </div>
              </div>

              {/* ✅ FIXED: Better item display with fallback */}
              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem' }}>
                {safeCheckoutData.items.length > 0 ? (
                  safeCheckoutData.items.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: isMobile ? 'flex-start' : 'flex-start',
                      padding: '0.75rem 0',
                      borderBottom: index < safeCheckoutData.items.length - 1 ? '1px solid #f8f9fa' : 'none',
                      ...(isMobile && {
                        flexDirection: 'column',
                        gap: '0.5rem'
                      })
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                          {item.name || 'Produk'}
                        </div>
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
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>×{item.quantity || 1}</div>
                        <div style={{ fontWeight: '600', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#666', 
                    fontSize: '0.9rem',
                    padding: '1rem'
                  }}>
                    Detail item sedang dimuat...
                  </div>
                )}
              </div>

              {/* ✅ ENHANCED: Better totals display */}
              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>Subtotal</span>
                  <span style={{ fontSize: '0.9rem' }}>
                    {formatCurrency(safeCheckoutData.totals.subtotalBeforeVoucher)}
                  </span>
                </div>
                
                {safeCheckoutData.totals.totalVoucherDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#28a745' }}>
                    <span style={{ fontSize: '0.9rem' }}>Diskon Voucher</span>
                    <span style={{ fontSize: '0.9rem' }}>
                      -{formatCurrency(safeCheckoutData.totals.totalVoucherDiscount)}
                    </span>
                  </div>
                )}

                {safeCheckoutData.totals.shippingCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      Ongkos Kirim
                      {safeCheckoutData.selectedService && (
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          {safeCheckoutData.selectedService.service_display}
                        </div>
                      )}
                    </span>
                    <span style={{ fontSize: '0.9rem' }}>
                      {formatCurrency(safeCheckoutData.totals.shippingCost)}
                    </span>
                  </div>
                )}

                {safeCheckoutData.useInsurance && safeCheckoutData.insuranceCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>Asuransi</span>
                    <span style={{ fontSize: '0.9rem' }}>
                      {formatCurrency(safeCheckoutData.insuranceCost)}
                    </span>
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
                  <span>{formatCurrency(safeOrderData.grand_total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#333' }}>
                  Alamat Pengiriman
                </h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.4', color: '#555' }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {safeCheckoutData.shippingAddress.name}
                  </div>
                  {safeCheckoutData.shippingAddress.phone && (
                    <div style={{ marginBottom: '0.25rem' }}>
                      {safeCheckoutData.shippingAddress.phone}
                    </div>
                  )}
                  <div>
                    {safeCheckoutData.shippingAddress.address}<br />
                    {safeCheckoutData.shippingAddress.district}, {safeCheckoutData.shippingAddress.regency}<br />
                    {safeCheckoutData.shippingAddress.province} {safeCheckoutData.shippingAddress.zipCode}
                  </div>
                </div>
              </div>

              {/* ✅ Show notes if any */}
              {safeCheckoutData.notes && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#333' }}>
                    Catatan
                  </h4>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    lineHeight: '1.4', 
                    color: '#555',
                    backgroundColor: '#f8f9fa',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontStyle: 'italic'
                  }}>
                    "{safeCheckoutData.notes}"
                  </div>
                </div>
              )}
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