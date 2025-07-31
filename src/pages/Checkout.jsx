import React, { useState, useEffect } from 'react'
import axios from 'axios'
import bcaLogo from '../assets/images/bca.png';
import mandiriLogo from '../assets/images/mandiri.png';
import gopayLogo from '../assets/images/gopay.png';
import alfamartLogo from '../assets/images/alfamart.png';
import briLogo from '../assets/images/bri.png';
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../hooks/useLanguage'
import { useCart } from '../contexts/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNavbarScroll } from '../hooks/useNavbarScroll'
import AdditionalVoucherSelector from '../components/common/AdditionalVoucherSelector'
import './Checkout.css'
import { API_ENDPOINTS, getImageUrl as getApiImageUrl } from '../config/api'

// Custom Enhanced Select Component
const EnhancedSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled, 
  label,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
  }, [searchTerm, options])

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span className="required">*</span>}
      </label>
      <div className={`enhanced-select ${disabled ? 'disabled' : ''}`}>
        <div 
          className={`select-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? 'selected' : 'placeholder'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg 
            className={`select-arrow ${isOpen ? 'rotated' : ''}`} 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
          >
            <path 
              d="M4 6L8 10L12 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        {isOpen && !disabled && (
          <>
            <div className="select-overlay" onClick={() => setIsOpen(false)} />
            <div className="select-dropdown">
              {options.length > 5 && (
                <div className="select-search">
                  <input
                    type="text"
                    placeholder={`Cari ${label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <div className="select-options">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`select-option ${value === option.value ? 'selected' : ''}`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {option.label}
                    </div>
                  ))
                ) : (
                  <div className="select-option no-options">
                    Tidak ada hasil ditemukan
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const Checkout = () => {
  // Gunakan hook untuk navbar scroll effect
  useNavbarScroll()

  // Address data state
  const [addressData, setAddressData] = useState({ provinces: {} });
  const [addressLoading, setAddressLoading] = useState(true);
  
  // ✅ NEW: Loading state untuk payment processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Load address data from JSON file on mount
  useEffect(() => {
    const loadAddressData = async () => {
      setAddressLoading(true);
      try {
        const data = await import('../data/addressData.json');
        setAddressData(data.default || data);
      } catch (err) {
        console.error('Failed to load address data:', err);
        setAddressData({ provinces: {} });
      } finally {
        setAddressLoading(false);
      }
    };
    loadAddressData();
  }, []);

  const { t } = useLanguage()
  const { 
    cart, 
    getCartTotals, 
    calculateItemTotal, 
    getImageUrl,
    cartVoucher,
    cartVoucherDiscount,
    applyCartVoucher,
    removeCartVoucher,
    clearCart // ✅ NEW: Tambahkan clearCart function
  } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if this is a "Buy Now" checkout (data passed from MenuDetail)
  const buyNowData = location.state?.buyNowItem
  const isBuyNow = !!buyNowData
  
  // Use either buy now data or cart data
  const checkoutItems = isBuyNow ? [buyNowData] : cart
  
  const [selectedPayment, setSelectedPayment] = useState('')
  const [selectedShipping, setSelectedShipping] = useState('reguler')
  const [useInsurance, setUseInsurance] = useState(true)
  const [notes, setNotes] = useState('')
  
  // Enhanced voucher system for Buy Now (max 2 vouchers)
  const [primaryVoucher, setPrimaryVoucher] = useState(null)
  const [primaryVoucherDiscount, setPrimaryVoucherDiscount] = useState(0)
  const [secondaryVoucher, setSecondaryVoucher] = useState(null)
  const [secondaryVoucherDiscount, setSecondaryVoucherDiscount] = useState(0)

  // Additional voucher for Cart checkout (in addition to existing cart voucher)
  const [additionalCartVoucher, setAdditionalCartVoucher] = useState(null)
  const [additionalCartVoucherDiscount, setAdditionalCartVoucherDiscount] = useState(0)

  // Shipping Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    email: '', // ✅ NEW: Tambah field email
    country: 'Indonesia',
    address: '',
    zipCode: '',
    province: '',
    regency: '',
    district: '',
    subdistrict: ''
  })

  // Available options for dropdowns based on selections
  const [availableCities, setAvailableCities] = useState({})
  const [availableDistricts, setAvailableDistricts] = useState({})
  const [availableSubdistricts, setAvailableSubdistricts] = useState([])

  // Shipping data
  const [shippingData] = useState({
    reguler: { name: 'Reguler', price: 0 },
    ninja: { name: 'Ninja Xpress', price: 6500, estimate: 'Estimasi tiba besok - 30 Jul' }
  })

  // ✅ NEW: Validation function yang lebih comprehensive
  const validateForm = () => {
    const errors = [];
    
    // Required fields validation
    const requiredFields = {
      name: 'Nama lengkap',
      phone: 'Nomor telepon',
      email: 'Email',
      address: 'Alamat',
      zipCode: 'Kode pos',
      province: 'Provinsi',
      regency: 'Kota',
      district: 'Kecamatan',
      subdistrict: 'Kelurahan'
    };
    
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!shippingAddress[field]) {
        errors.push(`${label} harus diisi`);
      }
    });
    
    // Email validation
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      errors.push('Format email tidak valid');
    }
    
    // Phone number validation
    if (shippingAddress.phone && !/^(\+62|62|0)[0-9]{9,13}$/.test(shippingAddress.phone)) {
      errors.push('Format nomor telepon tidak valid (contoh: 08123456789)');
    }
    
    // Zip code validation
    if (shippingAddress.zipCode && !/^[0-9]{5}$/.test(shippingAddress.zipCode)) {
      errors.push('Kode pos harus 5 digit angka');
    }
    
    if (!selectedPayment) {
      errors.push('Pilih metode pembayaran');
    }
    
    return errors;
  };

  // ✅ NEW: Function untuk save order ke localStorage
  const saveOrderToLocalStorage = (orderData) => {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('monyenyo_orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('monyenyo_orders', JSON.stringify(existingOrders));
      console.log('Order saved to localStorage:', orderData.order_number);
    } catch (error) {
      console.error('Error saving order to localStorage:', error);
    }
  };

  // ✅ TAMBAH function untuk navigasi ke halaman Terms
  const handleTermsClick = (e) => {
    e.preventDefault();
    // Simpan state checkout saat ini agar bisa kembali ke halaman yang sama
    const currentState = {
      checkoutData: {
        shippingAddress,
        selectedPayment,
        selectedShipping,
        useInsurance,
        notes,
        primaryVoucher,
        secondaryVoucher,
        additionalCartVoucher,
        isBuyNow,
        buyNowData
      },
      returnPath: '/checkout'
    };
    
    navigate('/terms', { state: currentState });
  };

  // Function to get proper image URL
  const getItemImageUrl = (item) => {
    return getImageUrl(item);
  }

  // Update available options when province/city/district changes
  useEffect(() => {
    if (shippingAddress.province) {
      const provinceData = addressData.provinces[shippingAddress.province]
      if (provinceData) {
        setAvailableCities(provinceData.cities)
        // Reset dependent fields when province changes
        if (shippingAddress.regency && !provinceData.cities[shippingAddress.regency]) {
          setShippingAddress(prev => ({
            ...prev,
            regency: '',
            district: '',
            subdistrict: ''
          }))
        }
      }
    } else {
      setAvailableCities({})
      setAvailableDistricts({})
      setAvailableSubdistricts([])
    }
  }, [shippingAddress.province, addressData.provinces])

  useEffect(() => {
    if (shippingAddress.province && shippingAddress.regency) {
      const provinceData = addressData.provinces[shippingAddress.province]
      if (provinceData && provinceData.cities[shippingAddress.regency]) {
        setAvailableDistricts(provinceData.cities[shippingAddress.regency].districts)
        // Reset dependent fields when city changes
        if (shippingAddress.district && !provinceData.cities[shippingAddress.regency].districts[shippingAddress.district]) {
          setShippingAddress(prev => ({
            ...prev,
            district: '',
            subdistrict: ''
          }))
        }
      }
    } else {
      setAvailableDistricts({})
      setAvailableSubdistricts([])
    }
  }, [shippingAddress.province, shippingAddress.regency, addressData.provinces])

  useEffect(() => {
    if (shippingAddress.province && shippingAddress.regency && shippingAddress.district) {
      const provinceData = addressData.provinces[shippingAddress.province]
      if (provinceData && 
          provinceData.cities[shippingAddress.regency] && 
          provinceData.cities[shippingAddress.regency].districts[shippingAddress.district]) {
        const districtData = provinceData.cities[shippingAddress.regency].districts[shippingAddress.district]
        setAvailableSubdistricts(districtData.subdistricts)
        // Reset subdistrict if it's not available in new district
        if (shippingAddress.subdistrict && !districtData.subdistricts.includes(shippingAddress.subdistrict)) {
          setShippingAddress(prev => ({
            ...prev,
            subdistrict: ''
          }))
        }
      }
    } else {
      setAvailableSubdistricts([])
    }
  }, [shippingAddress.province, shippingAddress.regency, shippingAddress.district, addressData.provinces])

  // ✅ TAMBAH useEffect untuk restore state jika kembali dari halaman Terms
  useEffect(() => {
    if (location.state?.checkoutData) {
      const { checkoutData } = location.state;
      
      // Restore semua state yang disimpan
      setShippingAddress(checkoutData.shippingAddress || shippingAddress);
      setSelectedPayment(checkoutData.selectedPayment || '');
      setSelectedShipping(checkoutData.selectedShipping || 'reguler');
      setUseInsurance(checkoutData.useInsurance ?? true);
      setNotes(checkoutData.notes || '');
      setPrimaryVoucher(checkoutData.primaryVoucher || null);
      setSecondaryVoucher(checkoutData.secondaryVoucher || null);
      setAdditionalCartVoucher(checkoutData.additionalCartVoucher || null);
      
      // Clear state setelah restore untuk menghindari restore berulang
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Generate dropdown options (moved inside Checkout to access addressData)
  const getProvinceOptions = () => {
    return Object.entries(addressData.provinces).map(([key, province]) => ({
      value: key,
      label: province.name
    }))
  }

  const getCityOptions = () => {
    return Object.entries(availableCities).map(([key, city]) => ({
      value: key,
      label: city.name
    }))
  }

  const getDistrictOptions = () => {
    return Object.entries(availableDistricts).map(([key, district]) => ({
      value: key,
      label: district.name
    }))
  }

  const getSubdistrictOptions = () => {
    return availableSubdistricts.map(subdistrict => ({
      value: subdistrict,
      label: subdistrict
    }))
  }

  // Calculate totals based on checkout type
  const calculateCheckoutTotals = () => {
    if (isBuyNow) {
      const item = buyNowData
      const subtotalBeforeVoucher = item.price * item.quantity
      
      // For buy now, use the new voucher system
      const totalVoucherDiscount = primaryVoucherDiscount + secondaryVoucherDiscount
      const finalTotal = Math.max(0, subtotalBeforeVoucher - totalVoucherDiscount)
      const totalItems = item.quantity
      
      return {
        subtotalBeforeVoucher,
        totalVoucherDiscount,
        finalTotal,
        totalItems
      }
    } else {
      // For cart checkout, include both cart voucher and additional voucher
      const cartTotals = getCartTotals()
      const additionalDiscount = additionalCartVoucherDiscount
      const totalVoucherDiscount = cartTotals.totalVoucherDiscount + additionalDiscount
      const finalTotal = Math.max(0, cartTotals.subtotalBeforeVoucher - totalVoucherDiscount)
      
      return {
        subtotalBeforeVoucher: cartTotals.subtotalBeforeVoucher,
        totalVoucherDiscount,
        finalTotal,
        totalItems: cartTotals.totalItems
      }
    }
  }

  // Get existing vouchers from cart (for cart checkout)
  const getExistingCartVouchers = () => {
    if (isBuyNow) return []
    
    const existingVouchers = []
    
    // Add cart-level voucher if exists
    if (cartVoucher) {
      existingVouchers.push(cartVoucher)
    }
    
    // Add additional cart voucher if exists
    if (additionalCartVoucher) {
      existingVouchers.push(additionalCartVoucher)
    }
    
    return existingVouchers
  }

  // Check if free shipping voucher is applied
  const hasFreeShippingVoucher = () => {
    if (isBuyNow) {
      return (primaryVoucher && primaryVoucher.type === 'free_shipping') ||
             (secondaryVoucher && secondaryVoucher.type === 'free_shipping')
    } else {
      return (cartVoucher && cartVoucher.type === 'free_shipping') ||
             (additionalCartVoucher && additionalCartVoucher.type === 'free_shipping')
    }
  }

  // Insurance cost (1% of subtotal, minimum Rp 1,100)
  const calculateInsuranceCost = () => {
    const { subtotalBeforeVoucher } = calculateCheckoutTotals()
    return Math.max(1100, Math.floor(subtotalBeforeVoucher * 0.01))
  }

  // Apply checkout page styles
  useEffect(() => {
    document.body.classList.add('checkout-page')
    return () => {
      document.body.classList.remove('checkout-page')
    }
  }, [])

  // Redirect if no items to checkout
  useEffect(() => {
    if (!isBuyNow && cart.length === 0) {
      navigate('/cart')
    }
  }, [cart, navigate, isBuyNow])

  const calculateTotal = () => {
    const { finalTotal } = calculateCheckoutTotals()
    const shippingCost = hasFreeShippingVoucher() ? 0 : (selectedShipping === 'ninja' ? shippingData.ninja.price : 0)
    const insurance = useInsurance ? calculateInsuranceCost() : 0
    
    return Math.max(0, finalTotal + shippingCost + insurance)
  }

  const handlePaymentSelect = (payment) => {
    setSelectedPayment(payment)
  }

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuantityChange = (itemId, delta) => {
    if (isBuyNow) {
      console.log('Quantity change not allowed in Buy Now mode')
      return
    }
    
    const { handleQuantity } = useCart()
    handleQuantity(itemId, delta)
  }

  const handleRemoveItem = (itemId) => {
    if (isBuyNow) {
      navigate(-1)
      return
    }
    
    const { removeItem } = useCart()
    removeItem(itemId)
  }

  // Primary voucher handlers (for Buy Now)
  const handlePrimaryVoucherApplied = (voucher, discount) => {
    setPrimaryVoucher(voucher)
    setPrimaryVoucherDiscount(discount)
  }

  const handlePrimaryVoucherRemoved = () => {
    setPrimaryVoucher(null)
    setPrimaryVoucherDiscount(0)
  }

  // Secondary voucher handlers (for Buy Now)
  const handleSecondaryVoucherApplied = (voucher, discount) => {
    setSecondaryVoucher(voucher)
    setSecondaryVoucherDiscount(discount)
  }

  const handleSecondaryVoucherRemoved = () => {
    setSecondaryVoucher(null)
    setSecondaryVoucherDiscount(0)
  }

  // Additional cart voucher handlers (for Cart checkout)
  const handleAdditionalCartVoucherApplied = (voucher, discount) => {
    setAdditionalCartVoucher(voucher)
    setAdditionalCartVoucherDiscount(discount)
  }

  const handleAdditionalCartVoucherRemoved = () => {
    setAdditionalCartVoucher(null)
    setAdditionalCartVoucherDiscount(0)
  }

  // ✅ ENHANCED: Midtrans Payment Handler dengan error handling yang lebih baik
  const handlePay = async () => {
    // Enhanced validation
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Set loading state
    setIsProcessing(true);

    try {
      // Get checkout data untuk dikirim ke backend
      const orderNumber = `ORD${Date.now()}`
      const currentDate = new Date().toISOString()

      // Get readable names for address fields
      const getReadableAddress = () => {
        const province = addressData.provinces[shippingAddress.province]?.name || shippingAddress.province
        const city = province ? addressData.provinces[shippingAddress.province]?.cities[shippingAddress.regency]?.name || shippingAddress.regency : shippingAddress.regency
        const district = city ? addressData.provinces[shippingAddress.province]?.cities[shippingAddress.regency]?.districts[shippingAddress.district]?.name || shippingAddress.district : shippingAddress.district
        const subdistrict = shippingAddress.subdistrict

        return {
          province,
          city,
          district,
          subdistrict
        }
      }

      const readableAddress = getReadableAddress()
      const grossAmount = calculateTotal()

      // ✅ ENHANCED: Prepare data dalam format yang sesuai dengan Midtrans
      const checkoutData = {
        // ✅ Customer details untuk Midtrans (REQUIRED)
        customer_details: {
          first_name: shippingAddress.name.split(' ')[0],
          last_name: shippingAddress.name.split(' ').slice(1).join(' ') || '',
          email: shippingAddress.email,
          phone: shippingAddress.phone
        },
        
        // ✅ Shipping address untuk Midtrans
        shipping_address: {
          first_name: shippingAddress.name.split(' ')[0],
          last_name: shippingAddress.name.split(' ').slice(1).join(' ') || '',
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: readableAddress.city,
          postal_code: shippingAddress.zipCode,
          country_code: 'IDN'
        },
        
        // ✅ Transaction details untuk Midtrans (REQUIRED)
        transaction_details: {
          order_id: orderNumber,
          gross_amount: grossAmount
        },
        
        // ✅ Item details untuk Midtrans (REQUIRED)
        item_details: [
          // Products
          ...checkoutItems.map(item => ({
            id: item.id.toString(),
            price: item.price,
            quantity: item.quantity,
            name: item.name.substring(0, 50) // Midtrans has character limit
          })),
          // Shipping sebagai item terpisah jika ada biaya
          ...(selectedShipping === 'ninja' && !hasFreeShippingVoucher() ? [{
            id: 'shipping_ninja',
            price: shippingData.ninja.price,
            quantity: 1,
            name: 'Ongkos Kirim - Ninja Xpress'
          }] : []),
          // Insurance sebagai item terpisah jika dipilih
          ...(useInsurance ? [{
            id: 'insurance',
            price: calculateInsuranceCost(),
            quantity: 1,
            name: 'Asuransi Pengiriman'
          }] : [])
        ],
        
        // ✅ Data internal untuk keperluan sistem (tidak dikirim ke Midtrans)
        internal_data: {
          // Order Info
          order_number: orderNumber,
          created_at: currentDate,
          
          // Original Shipping Address dengan kode
          original_shipping_address: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            email: shippingAddress.email,
            country: shippingAddress.country,
            address: shippingAddress.address,
            zipCode: shippingAddress.zipCode,
            province: shippingAddress.province,
            regency: shippingAddress.regency,
            district: shippingAddress.district,
            subdistrict: shippingAddress.subdistrict
          },
          
          // Readable address
          readable_address: readableAddress,
          
          // Payment Method
          paymentMethod: selectedPayment,
          
          // Shipping Info
          shipping: {
            method: selectedShipping,
            cost: hasFreeShippingVoucher() ? 0 : (selectedShipping === 'ninja' ? shippingData.ninja.price : 0),
            isFree: hasFreeShippingVoucher()
          },
          
          // Insurance
          insurance: {
            selected: useInsurance,
            cost: useInsurance ? calculateInsuranceCost() : 0
          },
          
          // Vouchers
          vouchers: isBuyNow ? {
            primary: primaryVoucher,
            secondary: secondaryVoucher
          } : {
            cart: cartVoucher,
            additional: additionalCartVoucher
          },
          
          // Totals breakdown
          totals: {
            subtotalBeforeVoucher: calculateCheckoutTotals().subtotalBeforeVoucher,
            totalVoucherDiscount: calculateCheckoutTotals().totalVoucherDiscount,
            finalTotal: calculateCheckoutTotals().finalTotal,
            shippingCost: hasFreeShippingVoucher() ? 0 : (selectedShipping === 'ninja' ? shippingData.ninja.price : 0),
            insuranceCost: useInsurance ? calculateInsuranceCost() : 0,
            grandTotal: grossAmount
          },
          
          // Additional Info
          notes: notes || '',
          isBuyNow: isBuyNow,
          
          // Items detail untuk internal
          original_items: checkoutItems
        }
      }

      console.log('Sending checkout data to Midtrans:', checkoutData)

      // ✅ ENHANCED: Request Midtrans token dengan error handling yang lebih baik
      const res = await fetch('https://api.monyenyo.com/api/midtrans/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      // ✅ Check response status
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.token) {
        // ✅ ENHANCED: Pastikan Midtrans Snap SDK sudah dimuat
        if (!window.snap) {
          throw new Error('Midtrans payment system not loaded. Please refresh the page.');
        }

        // ✅ ENHANCED: Snap payment dengan callback yang lebih comprehensive
        window.snap.pay(data.token, {
          onSuccess: function(result) {
            console.log('Pembayaran sukses:', result);
            
            // ✅ Prepare order data untuk disimpan
            const orderData = {
              order_number: orderNumber,
              ...checkoutData.internal_data,
              status: 'paid',
              payment_result: result,
              completed_at: new Date().toISOString(),
              midtrans_transaction_id: result.transaction_id,
              payment_type: result.payment_type
            };
            
            // ✅ Save order ke localStorage
            saveOrderToLocalStorage(orderData);
            
            // ✅ Clear cart jika bukan buy now
            if (!isBuyNow && clearCart) {
              clearCart();
            }
            
            // ✅ Redirect ke success page
            navigate('/order-success', { 
              state: { 
                orderData: {
                  order_number: orderNumber,
                  grand_total: grossAmount,
                  status: 'paid',
                  created_at: currentDate,
                  payment_result: result
                },
                checkoutData: checkoutData.internal_data 
              } 
            });
          },
          
          onPending: function(result) {
            console.log('Menunggu pembayaran:', result);
            
            // ✅ Prepare order data untuk status pending
            const orderData = {
              order_number: orderNumber,
              ...checkoutData.internal_data,
              status: 'pending_payment',
              payment_result: result,
              created_at: currentDate,
              midtrans_transaction_id: result.transaction_id,
              payment_type: result.payment_type
            };
            
            // ✅ Save order ke localStorage dengan status pending
            saveOrderToLocalStorage(orderData);
            
            // Redirect ke success page dengan status pending
            navigate('/order-success', { 
              state: { 
                orderData: {
                  order_number: orderNumber,
                  grand_total: grossAmount,
                  status: 'pending_payment',
                  created_at: currentDate,
                  payment_result: result
                },
                checkoutData: checkoutData.internal_data 
              } 
            });
          },
          
          onError: function(result) {
            console.error('Pembayaran error:', result);
            
            // ✅ Log error untuk debugging
            const errorData = {
              order_number: orderNumber,
              error_result: result,
              timestamp: new Date().toISOString()
            };
            
            // ✅ Save error log ke localStorage untuk debugging
            const errorLogs = JSON.parse(localStorage.getItem('monyenyo_payment_errors') || '[]');
            errorLogs.push(errorData);
            localStorage.setItem('monyenyo_payment_errors', JSON.stringify(errorLogs));
            
            alert('Terjadi kesalahan saat proses pembayaran. Silakan coba lagi atau hubungi customer service.');
          },
          
          onClose: function() {
            console.log('User menutup popup pembayaran');
            // User menutup popup, tidak perlu action khusus
            // Payment tetap bisa dilanjutkan nanti jika pending
          }
        });
        
      } else {
        throw new Error(data.message || 'Gagal mendapatkan token pembayaran dari server')
      }

    } catch (error) {
      console.error('Error saat proses pembayaran:', error);
      
      // ✅ ENHANCED: Better error handling dengan pesan yang lebih user-friendly
      let errorMessage = 'Terjadi kesalahan saat proses pembayaran. Silakan coba lagi.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Koneksi timeout. Silakan coba lagi.';
      } else if (error.message.includes('HTTP error! status: 422')) {
        errorMessage = 'Data yang dikirim tidak valid. Periksa kembali form Anda.';
      } else if (error.message.includes('HTTP error! status: 500')) {
        errorMessage = 'Terjadi kesalahan server. Silakan coba beberapa saat lagi.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
      // ✅ Log error untuk debugging
      const errorLog = {
        timestamp: new Date().toISOString(),
        error_message: error.message,
        error_stack: error.stack,
        checkout_data: checkoutData?.internal_data || 'No data'
      };
      
      const errorLogs = JSON.parse(localStorage.getItem('monyenyo_checkout_errors') || '[]');
      errorLogs.push(errorLog);
      localStorage.setItem('monyenyo_checkout_errors', JSON.stringify(errorLogs));
      
    } finally {
      // ✅ Reset loading state
      setIsProcessing(false);
    }
  }

  // ✅ DEPRECATED: Keep old handleCheckout for reference but replace with handlePay
  const handleCheckout = async () => {
    // This function is now replaced by handlePay
    // Keeping it for reference in case you need the old logic
    console.warn('handleCheckout is deprecated, use handlePay instead')
    await handlePay()
  }

  // Get checkout totals
  const { subtotalBeforeVoucher, totalVoucherDiscount, finalTotal, totalItems } = calculateCheckoutTotals()

  if (!isBuyNow && cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/menu')}>Continue Shopping</button>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Monyenyo</title>
        <meta name="description" content="Complete your purchase at Monyenyo" />
        <link rel="icon" href="/images/favicon_large.ico" type="image/x-icon" />
        {/* ✅ FIXED: Load Midtrans Snap SDK dengan client key yang benar */}
        <script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key="SB-Mid-client-5P2SiGIqGXzKSACK"
        ></script>
      </Helmet>
      
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-header">
            <h1>Checkout {isBuyNow && <span style={{fontSize: '16px', color: '#666'}}>- Buy Now</span>}</h1>
          </div>

          <div className="checkout-content">
            {/* Left Column */}
            <div className="checkout-left">
              {/* Shipping Address Form */}
              <div className="section-card">
                <div className="section-header">
                  <h3>ALAMAT PENGIRIMAN</h3>
                </div>
                
                <div className="shipping-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Name<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={shippingAddress.name}
                        onChange={(e) => handleAddressChange('name', e.target.value)}
                        placeholder="Nama Lengkap"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        Nomor Telepon<span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        placeholder="08123456789"
                      />
                    </div>
                  </div>

                  {/* ✅ NEW: Email field untuk Midtrans requirement */}
                  <div className="form-group">
                    <label className="form-label">
                      Email<span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      placeholder="nama@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Alamat<span className="required">*</span>
                    </label>
                    <textarea
                      className="form-textarea"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      placeholder="Alamat lengkap"
                      rows={3}
                    />
                  </div>

                  <div className="form-row form-row-three">
                    <div className="form-group">
                      <label className="form-label">
                        Kode Pos<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        placeholder="12345"
                        maxLength={5}
                      />
                    </div>
                    
                    <EnhancedSelect
                      value={shippingAddress.province}
                      onChange={(value) => handleAddressChange('province', value)}
                      options={getProvinceOptions()}
                      placeholder="Pilih Provinsi"
                      label="Provinsi"
                      required={true}
                    />
                    
                    <EnhancedSelect
                      value={shippingAddress.regency}
                      onChange={(value) => handleAddressChange('regency', value)}
                      options={getCityOptions()}
                      placeholder="Pilih Kota"
                      label="Kota"
                      disabled={!shippingAddress.province}
                      required={true}
                    />
                  </div>

                  <div className="form-row">
                    <EnhancedSelect
                      value={shippingAddress.district}
                      onChange={(value) => handleAddressChange('district', value)}
                      options={getDistrictOptions()}
                      placeholder="Pilih Kecamatan"
                      label="Kecamatan"
                      disabled={!shippingAddress.regency}
                      required={true}
                    />
                    
                    <EnhancedSelect
                      value={shippingAddress.subdistrict}
                      onChange={(value) => handleAddressChange('subdistrict', value)}
                      options={getSubdistrictOptions()}
                      placeholder="Pilih Kelurahan"
                      label="Kelurahan"
                      disabled={!shippingAddress.district}
                      required={true}
                    />
                  </div>
                </div>
              </div>

              {/* Single Product Section - All items grouped together */}
              <div className="section-card">
                <div className="section-header">
                  <input type="checkbox" checked readOnly />
                  <span className="store-name">Brownies Pastry Monyenyo</span>
                </div>
                
                {/* All Products Listed Here */}
                {checkoutItems.map((item) => (
                  <div key={item.id} className="product-item">
                    <div className="product-image">
                      <img 
                        src={getItemImageUrl(item)} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <h4>{item.name}</h4>
                      {item.sku && <p className="product-variant">SKU: {item.sku}</p>}
                    </div>
                    <div className="product-price">
                      <div className="price-section">
                        <span className="price">Rp{item.price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1 || isBuyNow}
                          style={isBuyNow ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, 1)}
                          disabled={isBuyNow}
                          style={isBuyNow ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Shipping Options - Only show once for all products */}
                <div className="shipping-section">
                  <div className="shipping-option">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="reguler"
                      checked={selectedShipping === 'reguler'}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                    />
                    <label>Reguler (Free)</label>
                  </div>
                  
                  <div className="shipping-option">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="ninja"
                      checked={selectedShipping === 'ninja'}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                      disabled={hasFreeShippingVoucher()}
                    />
                    <div className="shipping-details">
                      <label>
                        Ninja Xpress {hasFreeShippingVoucher() ? '(Gratis dengan voucher)' : `(Rp${shippingData.ninja.price.toLocaleString('id-ID')})`}
                      </label>
                      <p className="shipping-estimate">{shippingData.ninja.estimate}</p>
                    </div>
                  </div>
                </div>

                {/* Insurance Option */}
                <div className="insurance-section">
                  <input 
                    type="checkbox" 
                    checked={useInsurance}
                    onChange={(e) => setUseInsurance(e.target.checked)}
                  />
                  <label>Pakai Asuransi Pengiriman (Rp{calculateInsuranceCost().toLocaleString('id-ID')})</label>
                </div>

                {/* Notes */}
                <div className="notes-section">
                  <div className="notes-header">
                    <span>Kasih Catatan</span>
                    <span className="char-count">{notes.length}/200</span>
                  </div>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={200}
                    placeholder="Tulis catatan untuk penjual..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="checkout-right">
              {/* Payment Methods */}
              <div className="payment-section">
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>Pilih Metode Pembayaran</h4>
                
                <div className="payment-option" onClick={() => handlePaymentSelect('bca')}>
                  <div className="payment-info">
                    <div className="bank-logo bca-logo">
                      <img src={bcaLogo} alt="BCA" style={{height: 30, width: 'auto', objectFit: 'contain'}} />
                    </div>
                    <span>BCA Virtual Account</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={selectedPayment === 'bca'}
                    readOnly
                  />
                </div>

                <div className="payment-option" onClick={() => handlePaymentSelect('mandiri')}>
                  <div className="payment-info">
                    <div className="bank-logo mandiri-logo">
                      <img src={mandiriLogo} alt="Mandiri" style={{height: 30, width: 'auto', objectFit: 'contain'}} />
                    </div>
                    <span>Mandiri Virtual Account</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={selectedPayment === 'mandiri'}
                    readOnly
                  />
                </div>

                <div className="payment-option" onClick={() => handlePaymentSelect('bri')}>
                  <div className="payment-info">
                    <div className="bank-logo bri-logo">
                        <img src={briLogo} alt="BRI" style={{height: 35, width: 'auto', objectFit: 'contain'}} />
                    </div>
                    <span>BRI Virtual Account</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={selectedPayment === 'bri'}
                    readOnly
                  />
                </div>

                <div className="payment-option" onClick={() => handlePaymentSelect('alfamart')}>
                  <div className="payment-info">
                    <div className="bank-logo alfamart-logo">
                      <img src={alfamartLogo} alt="Alfamart" style={{height: 35, width: 'auto', objectFit: 'contain'}} />
                    </div>
                    <span>Alfamart / Alfamidi / Lawson</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={selectedPayment === 'alfamart'}
                    readOnly
                  />
                </div>

                <div className="payment-option" onClick={() => handlePaymentSelect('gopay')}>
                  <div className="payment-info">
                    <div className="bank-logo gopay-logo">
                      <img src={gopayLogo} alt="GoPay" style={{height: 44, width: 'auto', objectFit: 'contain'}} />
                    </div>
                    <span>GoPay</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={selectedPayment === 'gopay'}
                    readOnly
                  />
                </div>
              </div>

              {/* Enhanced Voucher Section for Buy Now */}
              {isBuyNow && (
                <div className="buy-now-voucher-section">
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>Pilih Voucher Diskon (Max 2)</h4>
                  
                  {/* Primary Voucher Selector */}
                  <div className="voucher-selector-wrapper">
                    <h5>Voucher Pertama</h5>
                    <AdditionalVoucherSelector
                      totalAmount={subtotalBeforeVoucher}
                      existingVouchers={secondaryVoucher ? [secondaryVoucher] : []}
                      onVoucherApplied={handlePrimaryVoucherApplied}
                      onVoucherRemoved={handlePrimaryVoucherRemoved}
                      appliedAdditionalVoucher={primaryVoucher}
                    />
                  </div>

                  {/* Secondary Voucher Selector - Only show if primary voucher is selected */}
                  {primaryVoucher && (
                    <div className="voucher-selector-wrapper">
                      <h5>Voucher Kedua</h5>
                      <AdditionalVoucherSelector
                        totalAmount={subtotalBeforeVoucher}
                        existingVouchers={[primaryVoucher]}
                        onVoucherApplied={handleSecondaryVoucherApplied}
                        onVoucherRemoved={handleSecondaryVoucherRemoved}
                        appliedAdditionalVoucher={secondaryVoucher}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Voucher Section for Cart Checkout */}
              {!isBuyNow && (
                <div className="cart-voucher-section">
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>Voucher Diskon</h4>
                  
                  {/* Show existing cart voucher if applied */}
                  {cartVoucher && (
                    <div className="voucher-applied-info">
                      <div className="voucher-success">
                        <span className="checkmark">✓</span>
                        <div>
                          <strong>Voucher Cart: {cartVoucher.name}</strong>
                          <p>Diskon: Rp{cartVoucherDiscount.toLocaleString('id-ID')} 🎉</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional voucher selector for cart checkout */}
                  <div className="voucher-selector-wrapper" style={{ marginTop: '16px' }}>
                    <h5>Tambah Voucher Lagi</h5>
                    <AdditionalVoucherSelector
                      totalAmount={subtotalBeforeVoucher}
                      existingVouchers={cartVoucher ? [cartVoucher] : []}
                      onVoucherApplied={handleAdditionalCartVoucherApplied}
                      onVoucherRemoved={handleAdditionalCartVoucherRemoved}
                      appliedAdditionalVoucher={additionalCartVoucher}
                    />
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="price-summary">
                <h4>Cek ringkasan transaksimu, yuk</h4>
                
                {/* Buy Now Voucher Discounts */}
                {isBuyNow && primaryVoucherDiscount > 0 && (
                  <div className="price-row">
                    <span>
                      Diskon Voucher 1
                      {primaryVoucher && (
                        <small style={{display: 'block', color: '#666', fontSize: '12px'}}>
                          {primaryVoucher.name}
                        </small>
                      )}
                    </span>
                    <span className="discount-price">-Rp{primaryVoucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {isBuyNow && secondaryVoucherDiscount > 0 && (
                  <div className="price-row">
                    <span>
                      Diskon Voucher 2
                      {secondaryVoucher && (
                        <small style={{display: 'block', color: '#666', fontSize: '12px'}}>
                          {secondaryVoucher.name}
                        </small>
                      )}
                    </span>
                    <span className="discount-price">-Rp{secondaryVoucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {/* Cart Voucher Discounts */}
                {!isBuyNow && cartVoucherDiscount > 0 && (
                  <div className="price-row">
                    <span>
                      Diskon Voucher Cart
                      {cartVoucher && (
                        <small style={{display: 'block', color: '#666', fontSize: '12px'}}>
                          {cartVoucher.name}
                        </small>
                      )}
                    </span>
                    <span className="discount-price">-Rp{cartVoucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}

                {!isBuyNow && additionalCartVoucherDiscount > 0 && (
                  <div className="price-row">
                    <span>
                      Diskon Voucher Tambahan
                      {additionalCartVoucher && (
                        <small style={{display: 'block', color: '#666', fontSize: '12px'}}>
                          {additionalCartVoucher.name}
                        </small>
                      )}
                    </span>
                    <span className="discount-price">-Rp{additionalCartVoucherDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                
                <div className="price-row">
                  <span>Total Harga ({totalItems} Barang)</span>
                  <div className="price-breakdown">
                    {totalVoucherDiscount > 0 ? (
                      <>
                        <span className="original-price">Rp{subtotalBeforeVoucher.toLocaleString('id-ID')}</span>
                        <span className="final-price">Rp{finalTotal.toLocaleString('id-ID')}</span>
                      </>
                    ) : (
                      <span className="final-price">Rp{finalTotal.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                </div>
                
                <div className="price-row">
                  <span>Total Ongkos Kirim</span>
                  <span>
                    {hasFreeShippingVoucher() ? (
                      <>
                        <span className="original-price" style={{textDecoration: 'line-through', marginRight: '8px'}}>
                          Rp{(selectedShipping === 'ninja' ? shippingData.ninja.price : 0).toLocaleString('id-ID')}
                        </span>
                        <span style={{color: '#28a745'}}>Gratis</span>
                      </>
                    ) : (
                      `Rp${(selectedShipping === 'ninja' ? shippingData.ninja.price : 0).toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
                
                <div className="price-row">
                  <span>Total Asuransi Pengiriman</span>
                  <span>Rp{(useInsurance ? calculateInsuranceCost() : 0).toLocaleString('id-ID')}</span>
                </div>
                
                <div className="price-row expandable">
                  <span>Total Lainnya ˅</span>
                  <span></span>
                </div>
                
                <div className="total-row">
                  <strong>Total Tagihan</strong>
                  <strong>Rp{calculateTotal().toLocaleString('id-ID')}</strong>
                </div>
                
                {/* ✅ ENHANCED: Button dengan loading state dan disabled state */}
                <button 
                  className="pay-button" 
                  onClick={handlePay}
                  disabled={isProcessing}
                  style={{
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Memproses Pembayaran...' : 'Bayar Sekarang'}
                </button>
                
                <p className="payment-note">
                  Dengan melanjutkan pembayaran, kamu menyetujui S&K
                  <br />
                  <a 
                    href="#" 
                    onClick={handleTermsClick}
                  >
                    Asuransi Pengiriman & Proteksi
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Checkout