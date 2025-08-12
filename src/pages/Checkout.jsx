import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import codLogo from '../assets/images/cod.png';
import mandiriLogo from '../assets/images/mandiri.png';
import gopayLogo from '../assets/images/gopay.png';
import briLogo from '../assets/images/bri.png';
import bniLogo from '../assets/images/bni.png';
import permataLogo from '../assets/images/permata.png';
import niagaLogo from '../assets/images/niaga.png';
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../hooks/useLanguage'
import { useCart } from '../contexts/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useNavbarScroll } from '../hooks/useNavbarScroll'
import AdditionalVoucherSelector from '../components/common/AdditionalVoucherSelector'
import './Checkout.css'
import { API_ENDPOINTS, getImageUrl as getApiImageUrl } from '../config/api'
import jneCityMap from '../data/jneCityMap.json';

// ✅ Helper functions untuk mengelola menuVoucher di localStorage
const getMenuVoucher = () => {
  try {
    const menuVoucher = localStorage.getItem('menuVoucher');
    return menuVoucher ? JSON.parse(menuVoucher) : null;
  } catch {
    return null;
  }
};

const clearMenuVoucher = () => {
  localStorage.removeItem('menuVoucher');
};

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

  // ✅ JNE Services State with better naming and refs for preventing infinite loops
  const [jneServices, setJneServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [jneShippingCost, setJneShippingCost] = useState(0);
  const [isLoadingJne, setIsLoadingJne] = useState(false);
  const [jneError, setJneError] = useState('');
  
  // ✅ Refs to prevent infinite loops
  const currentRequestRef = useRef(null);
  const lastRequestParamsRef = useRef(null);

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
    removeCartVoucher
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

  // ✅ Shipping Address Form State - Added email field
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
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

  // ✅ Enhanced shipping data with JNE integration
  const [shippingData] = useState({
    reguler: { name: 'Reguler', price: 0 },
    ninja: { name: 'Ninja Xpress', price: 6500, estimate: 'Estimasi tiba besok - 30 Jul' }
  })

  // ✅ Get destination code from selected city with multiple fallbacks
  const getDestinationCode = (provinceKey, cityKey) => {
    try {
      console.log('🔍 Getting destination code for:', { provinceKey, cityKey });

      if (!addressData || !addressData.provinces) {
        console.log('❌ addressData belum siap');
        return null;
      }

      if (!provinceKey || !cityKey) {
        console.log('❌ Missing province or city key');
        return null;
      }

      const province = addressData.provinces[provinceKey];
      if (!province) {
        console.log('❌ Province not found:', provinceKey);
        return null;
      }

      const city = province.cities[cityKey];
      if (!city) {
        console.log('❌ City not found:', cityKey);
        return null;
      }

      if (!city.jne_code) {
        console.log('⚠️ JNE code not found for city:', city.name);
        return null;
      }

      console.log('✅ Destination code found:', city.jne_code);
      return city.jne_code;
    } catch (error) {
      console.error('💥 Error getting destination code:', error);
      return null;
    }
  };

  // ✅ Calculate total weight from items dengan logic yang lebih aman
  const calculateTotalWeight = () => {
    if (!checkoutItems || !Array.isArray(checkoutItems)) {
      console.log('⚠️ checkoutItems belum ada, pakai default 1kg');
      return 1;
    }

    const totalQuantity = checkoutItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const weight = Math.max(1, totalQuantity);
    console.log('📦 Calculated total weight:', weight, 'kg from', totalQuantity, 'items');
    return weight;
  };

  // ✅ FIXED: Enhanced fetchJneServices dengan CORS solution dan multiple endpoints
  const fetchJneServices = async (destinationCode, weight = 1) => {
    const requestParams = `${destinationCode}-${weight}`;
    
    if (lastRequestParamsRef.current === requestParams) {
      console.log('🚫 Skipping duplicate JNE request:', requestParams);
      return;
    }
    
    if (currentRequestRef.current) {
      currentRequestRef.current.cancelled = true;
      console.log('🚫 Cancelling previous JNE request');
    }

    if (!destinationCode) {
      console.log('⚠️ No destination code provided, clearing JNE services');
      setJneServices([]);
      setSelectedService(null);
      setJneShippingCost(0);
      setIsLoadingJne(false);
      lastRequestParamsRef.current = null;
      return;
    }

    console.log('🚀 Fetching JNE services for:', { destinationCode, weight });
    
    const currentRequest = { cancelled: false };
    currentRequestRef.current = currentRequest;
    lastRequestParamsRef.current = requestParams;
    
    setIsLoadingJne(true);
    setJneError('');
    
    const timeoutId = setTimeout(() => {
      if (!currentRequest.cancelled) {
        console.log('⏰ JNE fetch timeout, stopping loading...');
        setIsLoadingJne(false);
        setJneError('Request timeout. Silakan coba lagi.');
        currentRequestRef.current = null;
      }
    }, 20000);
    
    try {
      // ✅ SOLUTION: Multiple approaches to handle CORS and API issues
      const apiEndpoints = [
        // Primary endpoint dengan mode no-cors sebagai fallback
        {
          url: `https://api.monyenyo.com/jne.php?thru=${destinationCode}&weight=${weight}`,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        },
        // Backup dengan JSONP approach jika diperlukan
        {
          url: `https://api.monyenyo.com/jne.php?thru=${destinationCode}&weight=${weight}&callback=jneCallback`,
          method: 'GET',
          headers: {
            'Accept': 'application/javascript',
          }
        }
      ];
      
      let lastError = null;
      let success = false;
      
      // Try primary endpoint with proper CORS headers
      const primaryUrl = apiEndpoints[0].url;
      console.log('📡 Trying primary API:', primaryUrl);
      
      const controller = new AbortController();
      const requestTimeout = setTimeout(() => controller.abort(), 15000);
      
      try {
        // ✅ FIXED: Proper fetch with all necessary options
        const response = await fetch(primaryUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Try CORS first
          credentials: 'omit', // Don't send credentials
          signal: controller.signal,
          // Add cache control to prevent caching issues
          cache: 'no-cache'
        });
        
        clearTimeout(requestTimeout);
        clearTimeout(timeoutId);
        
        if (currentRequest.cancelled) {
          console.log('🚫 JNE request was cancelled');
          return;
        }
        
        console.log('📊 JNE API Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        console.log('📄 Response content type:', contentType);
        
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Try to parse as JSON anyway
          const textData = await response.text();
          console.log('📄 Raw response:', textData.substring(0, 500));
          data = JSON.parse(textData);
        }
        
        console.log('📊 JNE API Response data:', data);
        
        if (currentRequest.cancelled) {
          console.log('🚫 JNE request was cancelled during processing');
          return;
        }
        
        // Handle successful response dengan null ETD handling
        if (data && data.price && Array.isArray(data.price) && data.price.length > 0) {
          const processedServices = data.price.map(service => {
            const etdFrom = service.etd_from ?? '?';
            const etdThru = service.etd_thru ?? '?';
            
            return {
              ...service,
              etd_from: etdFrom,
              etd_thru: etdThru,
              estimateText: (etdFrom !== '?' && etdThru !== '?' && etdFrom !== null && etdThru !== null) 
                ? `${etdFrom} - ${etdThru} hari kerja`
                : 'Estimasi tidak tersedia'
            };
          });
          
          setJneServices(processedServices);
          setJneError('');
          success = true;
          console.log('✅ JNE Services loaded successfully:', processedServices.length, 'services');
          
        } else if (data && data.error) {
          console.log('❌ JNE API Error:', data.error);
          setJneError(`API Error: ${data.error}`);
          setJneServices([]);
        } else {
          console.warn('⚠️ No JNE services available or unexpected response format:', data);
          setJneServices([]);
          setJneError('Tidak ada layanan JNE tersedia untuk lokasi ini.');
        }
        
      } catch (fetchError) {
        clearTimeout(requestTimeout);
        lastError = fetchError;
        
        if (currentRequest.cancelled) {
          console.log('🚫 JNE request was cancelled during fetch error');
          return;
        }
        
        console.error("💥 Primary fetch failed:", fetchError);
        
        // ✅ FALLBACK: Try with no-cors mode untuk handle CORS issue
        if (fetchError.name === 'TypeError' && fetchError.message.includes('CORS')) {
          console.log('🔄 Trying no-cors fallback...');
          
          try {
            const fallbackResponse = await fetch(primaryUrl, {
              method: 'GET',
              mode: 'no-cors',
              credentials: 'omit',
              cache: 'no-cache'
            });
            
            // no-cors mode doesn't allow reading response, so we'll show a user-friendly message
            console.log('📡 no-cors request sent, but cannot read response due to CORS policy');
            setJneError('JNE services tersedia tapi terkendala CORS policy. Silakan refresh halaman atau coba lagi.');
            setJneServices([]);
            
          } catch (noCorsError) {
            console.error("💥 No-CORS fallback also failed:", noCorsError);
          }
        }
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (currentRequest.cancelled) {
        console.log('🚫 JNE request was cancelled during error handling');
        return;
      }
      
      console.error("💥 Error fetching JNE services:", error);
      
      // Handle specific error types dengan detailed logging
      if (error.name === 'AbortError') {
        console.error('🚨 JNE API Timeout - Request took too long');
        setJneError('Request timeout. Koneksi terlalu lambat, silakan coba lagi.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚨 JNE API Network Error - Cannot connect to server');
        setJneError('Masalah CORS atau koneksi. API berfungsi tapi browser memblokir akses. Coba refresh halaman.');
      } else if (error.message.includes('JSON')) {
        console.error('🚨 JNE API JSON Parse Error - Invalid response format');
        setJneError('Server JNE mengirim respons yang tidak valid. Silakan coba lagi.');
      } else {
        console.error('🚨 JNE API Unknown Error:', error.message);
        setJneError('Gagal memuat layanan pengiriman JNE. Silakan coba lagi.');
      }
      
      setJneServices([]);
      
    } finally {
      if (!currentRequest.cancelled) {
        setIsLoadingJne(false);
        console.log('🏁 JNE fetch completed, loading state cleared');
      }
      
      if (currentRequestRef.current === currentRequest) {
        currentRequestRef.current = null;
      }
    }
  };

  // ✅ Handle JNE service selection
  const handleJneServiceSelect = (service) => {
    console.log('🎯 JNE Service selected:', service);
    setSelectedService(service);
    setJneShippingCost(parseInt(service.price) || 0);
    setSelectedShipping('jne');
  };

  // ✅ Load menu voucher on component mount for Buy Now mode
  useEffect(() => {
    if (isBuyNow) {
      const savedMenuVoucher = getMenuVoucher();
      console.log('Loading menu voucher from localStorage:', savedMenuVoucher);
      if (savedMenuVoucher && savedMenuVoucher.voucher) {
        setPrimaryVoucher(savedMenuVoucher.voucher);
        setPrimaryVoucherDiscount(Number(savedMenuVoucher.discount) || 0);
        console.log('Applied menu voucher as primary:', savedMenuVoucher.voucher.name, 'with discount:', savedMenuVoucher.discount);
      }
    }
  }, [isBuyNow]);

  // ✅ Main useEffect untuk fetch JNE services dengan anti infinite loop
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (shippingAddress.province && shippingAddress.regency && !addressLoading && addressData.provinces) {
        const destinationCode = getDestinationCode(shippingAddress.province, shippingAddress.regency);
        
        if (destinationCode) {
          const weight = calculateTotalWeight();
          console.log('🚀 Triggering JNE fetch with:', { destinationCode, weight });
          fetchJneServices(destinationCode, weight);
        } else {
          console.log('⚠️ No valid destination code, clearing JNE services');
          setJneServices([]);
          setSelectedService(null);
          setJneShippingCost(0);
          setIsLoadingJne(false);
          lastRequestParamsRef.current = null;
        }
      } else {
        console.log('⏳ Waiting for complete address or address data loading...');
        setJneServices([]);
        setSelectedService(null);
        setJneShippingCost(0);
        setIsLoadingJne(false);
        lastRequestParamsRef.current = null;
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [shippingAddress.province, shippingAddress.regency, addressLoading]);

  // ✅ Fungsi untuk menghitung discount voucher dengan struktur data yang benar
  const calculateVoucherDiscount = (voucher, subtotal) => {
    if (!voucher) return 0;
    
    console.log('Calculating discount for voucher:', voucher);
    console.log('Subtotal:', subtotal);
    
    switch (voucher.type) {
      case 'fixed':
        const fixedAmount = Number(voucher.value || 0);
        const discount = Math.min(fixedAmount, subtotal);
        console.log('Fixed discount calculated:', discount);
        return discount;
      
      case 'percent':
        const percentValue = Number(voucher.value || 0);
        const percentageDiscount = Math.floor((subtotal * percentValue) / 100);
        const finalPercentDiscount = voucher.max_discount ? 
          Math.min(percentageDiscount, Number(voucher.max_discount)) : 
          percentageDiscount;
        console.log('Percent discount calculated:', finalPercentDiscount);
        return finalPercentDiscount;
      
      case 'free_shipping':
        console.log('Free shipping voucher, no subtotal discount');
        return 0;
      
      default:
        console.log('Unknown voucher type:', voucher.type);
        return 0;
    }
  };

  // ✅ Function untuk navigasi ke halaman Terms
  const handleTermsClick = (e) => {
    e.preventDefault();
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
        buyNowData,
        selectedService,
        jneShippingCost
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

  // ✅ useEffect untuk restore state jika kembali dari halaman Terms
  useEffect(() => {
    if (location.state?.checkoutData) {
      const { checkoutData } = location.state;
      
      setShippingAddress(checkoutData.shippingAddress || shippingAddress);
      setSelectedPayment(checkoutData.selectedPayment || '');
      setSelectedShipping(checkoutData.selectedShipping || 'reguler');
      setUseInsurance(checkoutData.useInsurance ?? true);
      setNotes(checkoutData.notes || '');
      setPrimaryVoucher(checkoutData.primaryVoucher || null);
      setSecondaryVoucher(checkoutData.secondaryVoucher || null);
      setAdditionalCartVoucher(checkoutData.additionalCartVoucher || null);
      
      if (checkoutData.selectedService) {
        setSelectedService(checkoutData.selectedService);
        setJneShippingCost(checkoutData.jneShippingCost || 0);
      }
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ✅ Update discount calculation dengan debounce untuk performa yang lebih baik
  useEffect(() => {
    if (isBuyNow && buyNowData) {
      const item = buyNowData;
      const subtotal = item.price * item.quantity;
      
      if (primaryVoucher) {
        const discount = calculateVoucherDiscount(primaryVoucher, subtotal);
        setPrimaryVoucherDiscount(discount);
      } else {
        setPrimaryVoucherDiscount(0);
      }
    }
  }, [primaryVoucher, buyNowData, isBuyNow]);

  useEffect(() => {
    if (isBuyNow && buyNowData) {
      const item = buyNowData;
      const subtotal = item.price * item.quantity;
      
      if (secondaryVoucher) {
        const remainingSubtotal = Math.max(0, subtotal - primaryVoucherDiscount);
        const discount = calculateVoucherDiscount(secondaryVoucher, remainingSubtotal);
        setSecondaryVoucherDiscount(discount);
      } else {
        setSecondaryVoucherDiscount(0);
      }
    }
  }, [secondaryVoucher, buyNowData, isBuyNow, primaryVoucherDiscount]);

  useEffect(() => {
    if (!isBuyNow) {
      const cartTotals = getCartTotals();
      
      if (additionalCartVoucher) {
        const remainingSubtotal = Math.max(0, cartTotals.subtotalBeforeVoucher - cartTotals.totalVoucherDiscount);
        const discount = calculateVoucherDiscount(additionalCartVoucher, remainingSubtotal);
        setAdditionalCartVoucherDiscount(discount);
      } else {
        setAdditionalCartVoucherDiscount(0);
      }
    }
  }, [additionalCartVoucher, cart, isBuyNow, cartVoucherDiscount]);

  // Generate dropdown options
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

  // ✅ Calculate totals based on checkout type
  const calculateCheckoutTotals = () => {
    if (isBuyNow) {
      const item = buyNowData
      const subtotalBeforeVoucher = item.price * item.quantity
      
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

  // ✅ Get existing vouchers
  const getExistingVouchers = () => {
    if (isBuyNow) {
      const existingVouchers = []
      
      if (primaryVoucher) {
        existingVouchers.push(primaryVoucher)
      }
      
      if (secondaryVoucher) {
        existingVouchers.push(secondaryVoucher)
      }
      
      return existingVouchers
    }
    
    const existingVouchers = []
    
    if (cartVoucher) {
      existingVouchers.push(cartVoucher)
    }
    
    if (additionalCartVoucher) {
      existingVouchers.push(additionalCartVoucher)
    }
    
    return existingVouchers
  }

  // ✅ Check if free shipping voucher is applied
  const hasFreeShippingVoucher = () => {
    if (isBuyNow) {
      return (primaryVoucher && primaryVoucher.type === 'free_shipping') ||
             (secondaryVoucher && secondaryVoucher.type === 'free_shipping')
    } else {
      return (cartVoucher && cartVoucher.type === 'free_shipping') ||
             (additionalCartVoucher && additionalCartVoucher.type === 'free_shipping')
    }
  }

  // ✅ Get shipping cost based on selected method
  const getShippingCost = () => {
    if (hasFreeShippingVoucher()) return 0;
    
    switch (selectedShipping) {
      case 'reguler':
        return 0;
      case 'ninja':
        return shippingData.ninja.price;
      case 'jne':
        return jneShippingCost;
      default:
        return 0;
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

  // ✅ Calculate total with JNE shipping cost
  const calculateTotal = () => {
    const { finalTotal } = calculateCheckoutTotals()
    const shippingCost = getShippingCost()
    const insurance = useInsurance ? calculateInsuranceCost() : 0
    
    return Math.max(0, finalTotal + shippingCost + insurance)
  }

  const handlePaymentSelect = (payment) => {
    setSelectedPayment(payment)
  }

  const handleAddressChange = (field, value) => {
    console.log(`📝 Address field changed: ${field} = ${value}`);
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

  // ✅ Primary voucher handlers
  const handlePrimaryVoucherApplied = (voucher, calculatedDiscount) => {
    console.log('Primary voucher applied:', voucher, 'with discount:', calculatedDiscount);
    setPrimaryVoucher(voucher);
    
    if (calculatedDiscount !== undefined && calculatedDiscount !== null) {
      setPrimaryVoucherDiscount(Number(calculatedDiscount));
    } else {
      const item = buyNowData;
      const subtotal = item.price * item.quantity;
      const correctDiscount = calculateVoucherDiscount(voucher, subtotal);
      setPrimaryVoucherDiscount(correctDiscount);
    }
  }

  const handlePrimaryVoucherRemoved = () => {
    setPrimaryVoucher(null)
    setPrimaryVoucherDiscount(0)
  }

  // ✅ Secondary voucher handlers
  const handleSecondaryVoucherApplied = (voucher, calculatedDiscount) => {
    console.log('Secondary voucher applied:', voucher, 'with discount:', calculatedDiscount);
    setSecondaryVoucher(voucher);
    
    if (calculatedDiscount !== undefined && calculatedDiscount !== null) {
      setSecondaryVoucherDiscount(Number(calculatedDiscount));
    } else {
      const item = buyNowData;
      const subtotal = item.price * item.quantity;
      const remainingSubtotal = Math.max(0, subtotal - primaryVoucherDiscount);
      const correctDiscount = calculateVoucherDiscount(voucher, remainingSubtotal);
      setSecondaryVoucherDiscount(correctDiscount);
    }
  }

  const handleSecondaryVoucherRemoved = () => {
    setSecondaryVoucher(null)
    setSecondaryVoucherDiscount(0)
  }

  // ✅ Additional cart voucher handlers
  const handleAdditionalCartVoucherApplied = (voucher, calculatedDiscount) => {
    console.log('Additional cart voucher applied:', voucher, 'with discount:', calculatedDiscount);
    setAdditionalCartVoucher(voucher);
    
    if (calculatedDiscount !== undefined && calculatedDiscount !== null) {
      setAdditionalCartVoucherDiscount(Number(calculatedDiscount));
    } else {
      const cartTotals = getCartTotals();
      const remainingSubtotal = Math.max(0, cartTotals.subtotalBeforeVoucher - cartTotals.totalVoucherDiscount);
      const correctDiscount = calculateVoucherDiscount(voucher, remainingSubtotal);
      setAdditionalCartVoucherDiscount(correctDiscount);
    }
  }

  const handleAdditionalCartVoucherRemoved = () => {
    setAdditionalCartVoucher(null)
    setAdditionalCartVoucherDiscount(0)
  }

  // ✅ Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ✅ Enhanced validation function with shipping validation
  const validateCheckoutData = () => {
    // Basic field validation
    const requiredFields = ['name', 'email', 'phone', 'address', 'zipCode', 'province', 'regency', 'district', 'subdistrict']
    const missingFields = requiredFields.filter(field => !shippingAddress[field])
    
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(field => {
        switch(field) {
          case 'name': return 'Nama'
          case 'email': return 'Email'
          case 'phone': return 'Nomor Telepon'
          case 'address': return 'Alamat'
          case 'zipCode': return 'Kode Pos'
          case 'province': return 'Provinsi'
          case 'regency': return 'Kota'
          case 'district': return 'Kecamatan'
          case 'subdistrict': return 'Kelurahan'
          default: return field
        }
      })
      alert(`Harap lengkapi field berikut: ${missingFieldNames.join(', ')}`)
      return false
    }

    // Email validation
    if (!validateEmail(shippingAddress.email)) {
      alert('Format email tidak valid')
      return false
    }
    
    // Payment method validation
    if (!selectedPayment) {
      alert('Silakan pilih metode pembayaran')
      return false
    }

    // ✅ ENHANCED SHIPPING VALIDATION - Skip for COD
    if (selectedPayment !== 'cod') {
      // Check if JNE services are available and loaded
      if (jneServices.length === 0 && !isLoadingJne && !jneError) {
        alert('Layanan pengiriman JNE tidak tersedia untuk lokasi ini. Silakan pilih lokasi lain atau refresh halaman.')
        return false
      }

      // Check if JNE is still loading
      if (isLoadingJne) {
        alert('Sedang memuat layanan pengiriman JNE. Mohon tunggu sebentar.')
        return false
      }

      // Check if there's JNE error
      if (jneError && jneServices.length === 0) {
        alert(`Gagal memuat layanan pengiriman: ${jneError}. Silakan refresh halaman atau coba lagi.`)
        return false
      }

      // Check if user has selected a JNE service when JNE services are available
      if (jneServices.length > 0 && (!selectedService || selectedShipping !== 'jne')) {
        alert('Silakan pilih salah satu layanan pengiriman JNE yang tersedia.')
        return false
      }

      // Check if selected service is still valid
      if (selectedService && selectedShipping === 'jne') {
        const isServiceValid = jneServices.some(service => 
          service.service_code === selectedService.service_code
        )
        
        if (!isServiceValid) {
          alert('Layanan pengiriman yang dipilih sudah tidak valid. Silakan pilih ulang.')
          return false
        }
      }
    }

    return true
  }

  // ✅ Helper function untuk mengkonversi nama kunci menjadi nama lengkap
  const getReadableLocationNames = () => {
    const province = addressData.provinces[shippingAddress.province]?.name || shippingAddress.province
    const city = province && addressData.provinces[shippingAddress.province]?.cities[shippingAddress.regency]?.name || shippingAddress.regency
    const district = city && addressData.provinces[shippingAddress.province]?.cities[shippingAddress.regency]?.districts[shippingAddress.district]?.name || shippingAddress.district
    const subdistrict = shippingAddress.subdistrict

    return {
      province,
      city,
      district,
      subdistrict
    }
  }

  // ✅ COMPLETE FIXED handlePay function with COD support
  const handlePay = async () => {
    // ✅ Enhanced validation with shipping check
    if (!validateCheckoutData()) {
      return
    }

    // Loading state
    const payButton = document.querySelector('.pay-button')
    const originalButtonText = payButton.textContent
    payButton.textContent = 'Processing...'
    payButton.disabled = true

    try {
      // ✅ CLEAR menu voucher after successful payment initiation
      if (isBuyNow) {
        clearMenuVoucher();
      }

      // Get checkout data untuk dikirim ke backend
      const orderNumber = `ORD${Date.now()}`
      const currentDate = new Date().toISOString()

      // Get readable names for address fields
      const readableAddress = getReadableLocationNames()

      // ✅ Check if payment method is COD
      const isCOD = selectedPayment === 'cod'

      // ✅ PREPARE COMPLETE ORDER DATA sesuai dengan backend expectations
      const completeOrderData = {
        // Order Info
        order_number: orderNumber,
        created_at: currentDate,
        
        // ✅ Customer Information (sesuai dengan fillable fields)
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zip_code: shippingAddress.zipCode,
        
        // ✅ Location dengan nama yang readable
        province: readableAddress.province,
        regency: readableAddress.city,
        district: readableAddress.district,
        subdistrict: readableAddress.subdistrict,
        
        // ✅ Payment & Shipping Methods
        payment_method: selectedPayment,
        shipping_method: selectedShipping,
        shipping_cost: getShippingCost(),
        is_shipping_free: hasFreeShippingVoucher(),
        
        // ✅ JNE Service Details (akan null jika bukan JNE)
        jne_service_code: selectedService?.service_code || null,
        jne_service_display: selectedService?.service_display || null,
        jne_price: selectedService ? parseInt(selectedService.price) : null,
        jne_etd_from: selectedService?.etd_from || null,
        jne_etd_thru: selectedService?.etd_thru || null,
        
        // ✅ Insurance
        use_insurance: useInsurance,
        insurance_cost: useInsurance ? calculateInsuranceCost() : 0,
        
        // ✅ Notes
        notes: notes || null,
        
        // ✅ Items (as JSON array sesuai dengan cast di model)
        items: checkoutItems.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          sku: item.sku || null
        })),
        
        // ✅ Vouchers (as JSON object sesuai dengan cast di model)
        vouchers: isBuyNow ? {
          type: 'buy_now',
          primary: primaryVoucher ? {
            id: primaryVoucher.id,
            name: primaryVoucher.name,
            type: primaryVoucher.type,
            value: primaryVoucher.value,
            discount_amount: primaryVoucherDiscount
          } : null,
          secondary: secondaryVoucher ? {
            id: secondaryVoucher.id,
            name: secondaryVoucher.name,
            type: secondaryVoucher.type,
            value: secondaryVoucher.value,
            discount_amount: secondaryVoucherDiscount
          } : null
        } : {
          type: 'cart',
          cart_voucher: cartVoucher ? {
            id: cartVoucher.id,
            name: cartVoucher.name,
            type: cartVoucher.type,
            value: cartVoucher.value,
            discount_amount: cartVoucherDiscount
          } : null,
          additional_voucher: additionalCartVoucher ? {
            id: additionalCartVoucher.id,
            name: additionalCartVoucher.name,
            type: additionalCartVoucher.type,
            value: additionalCartVoucher.value,
            discount_amount: additionalCartVoucherDiscount
          } : null
        },
        
        // ✅ Financial Totals (sesuai dengan cast decimal di model)
        subtotal_before_voucher: parseFloat(calculateCheckoutTotals().subtotalBeforeVoucher),
        total_voucher_discount: parseFloat(calculateCheckoutTotals().totalVoucherDiscount),
        final_total: parseFloat(calculateCheckoutTotals().finalTotal),
        total_items: parseInt(calculateCheckoutTotals().totalItems),
        grand_total: parseFloat(calculateTotal()),
        
        // ✅ Order Status & Type
        status: isCOD ? 'paid' : 'pending', // COD langsung paid
        is_buy_now: isBuyNow,
        
        // ✅ Admin notes (null by default, bisa diisi admin nanti)
        admin_notes: null
      }

      console.log('📦 Sending comprehensive order data to backend:', completeOrderData)

      // ✅ COD Logic - Skip Midtrans and go directly to checkout API
      if (isCOD) {
        console.log('💰 COD Payment - Processing directly without Midtrans')
        
        const checkoutPayload = {
          shippingAddress: shippingAddress,
          paymentMethod: selectedPayment,
          shipping: {
            method: selectedShipping,
            cost: getShippingCost(),
            isFree: hasFreeShippingVoucher(),
            jneService: selectedService ? {
              service_code: selectedService.service_code,
              service_display: selectedService.service_display,
              price: parseInt(selectedService.price),
              etd_from: selectedService.etd_from,
              etd_thru: selectedService.etd_thru
            } : null
          },
          insurance: {
            selected: useInsurance,
            cost: useInsurance ? calculateInsuranceCost() : 0
          },
          items: checkoutItems,
          vouchers: isBuyNow ? {
            type: 'buy_now',
            primary: primaryVoucher,
            secondary: secondaryVoucher
          } : {
            type: 'cart',
            cart_voucher: cartVoucher,
            additional_voucher: additionalCartVoucher
          },
          totals: {
            subtotalBeforeVoucher: calculateCheckoutTotals().subtotalBeforeVoucher,
            totalVoucherDiscount: calculateCheckoutTotals().totalVoucherDiscount,
            finalTotal: calculateCheckoutTotals().finalTotal,
            grandTotal: calculateTotal()
          },
          isBuyNow: isBuyNow,
          notes: notes
        }

        // Send COD order directly to checkout endpoint
        const codResponse = await fetch('https://api.monyenyo.com/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Request-Source': 'checkout-frontend-cod',
            'X-Order-Type': isCOD ? 'cod' : (isBuyNow ? 'buy-now' : 'cart')
          },
          body: JSON.stringify(checkoutPayload)
        })

        const codData = await codResponse.json()

        if (!codResponse.ok) {
          throw new Error(codData.message || `COD Checkout Error: ${codResponse.status}`)
        }

        if (codData.success) {
          console.log('✅ COD Order berhasil disimpan:', codData.data)
          
          // Clear cart jika bukan buy now
          if (!isBuyNow) {
            console.log('COD Cart checkout completed successfully')
          }
          
          // Navigate langsung ke order success untuk COD
          navigate('/order-success', { 
            state: { 
              orderData: {
                order_number: codData.data.order_number,
                grand_total: codData.data.grand_total,
                status: 'paid', // COD langsung paid
                payment_method: 'cod',
                created_at: currentDate,
                no_resi: codData.data.no_resi,
                is_cod: true,
                jne_service: codData.data.jne_service
              },
              checkoutData: completeOrderData 
            } 
          })
          return // Exit function untuk COD
        } else {
          throw new Error(codData.message || 'COD order gagal disimpan')
        }
      }

      // ✅ NON-COD Logic - Continue with Midtrans
      console.log('💳 Non-COD Payment - Processing with Midtrans')

      // ✅ ENHANCED: Request Midtrans token dengan complete order data
      const res = await fetch('https://api.monyenyo.com/api/midtrans/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Tambahkan header untuk debugging jika diperlukan
          'X-Request-Source': 'checkout-frontend',
          'X-Order-Type': isBuyNow ? 'buy-now' : 'cart'
        },
        body: JSON.stringify({
          // ✅ CRITICAL: Include order_number for proper backend processing
          order_number: orderNumber,
          order_id: orderNumber,
          
          // Data untuk Midtrans payment
          gross_amount: calculateTotal(),
          
          customer_details: {
            first_name: shippingAddress.name,
            last_name: '',
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            billing_address: {
              first_name: shippingAddress.name,
              last_name: '',
              email: shippingAddress.email,
              phone: shippingAddress.phone,
              address: shippingAddress.address,
              city: readableAddress.city,
              postal_code: shippingAddress.zipCode,
              country_code: 'IDN'
            },
            shipping_address: {
              first_name: shippingAddress.name,
              last_name: '',
              email: shippingAddress.email,
              phone: shippingAddress.phone,
              address: shippingAddress.address,
              city: readableAddress.city,
              postal_code: shippingAddress.zipCode,
              country_code: 'IDN'
            }
          },
          
          item_details: [
            // Items
            ...checkoutItems.map((item, index) => ({
              id: `item-${item.id}`,
              price: parseInt(item.price),
              quantity: parseInt(item.quantity),
              name: item.name,
              category: 'food'
            })),
            // Shipping cost sebagai item jika ada
            ...(getShippingCost() > 0 ? [{
              id: 'shipping-cost',
              price: parseInt(getShippingCost()),
              quantity: 1,
              name: selectedShipping === 'jne' && selectedService ? 
                `JNE ${selectedService.service_display}` : 
                `Ongkos Kirim ${selectedShipping}`,
              category: 'shipping'
            }] : []),
            // Insurance sebagai item jika ada
            ...(useInsurance ? [{
              id: 'insurance-cost',
              price: parseInt(calculateInsuranceCost()),
              quantity: 1,
              name: 'Asuransi Pengiriman',
              category: 'insurance'
            }] : [])
          ],
          
          // ✅ CRITICAL: Sertakan complete order data untuk disimpan ke DataPembeli
          order_data: completeOrderData
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP Error: ${res.status}`)
      }

      if (data.token) {
        // Pastikan Midtrans Snap SDK sudah dimuat
        if (!window.snap) {
          alert('Midtrans payment system not loaded. Please refresh the page.');
          return;
        }

        window.snap.pay(data.token, {
          onSuccess: function(result) {
            console.log('✅ Pembayaran sukses:', result);
            
            // Clear cart jika bukan buy now
            if (!isBuyNow) {
              // Cart clearing logic bisa ditambahkan disini jika diperlukan
              console.log('Cart checkout completed successfully');
            }
            
            navigate('/order-success', { 
              state: { 
                orderData: {
                  order_number: orderNumber,
                  grand_total: calculateTotal(),
                  status: 'paid',
                  created_at: currentDate,
                  payment_result: result,
                  jne_service: selectedService ? {
                    service_code: selectedService.service_code,
                    service_display: selectedService.service_display,
                    price: selectedService.price,
                    etd_from: selectedService.etd_from,
                    etd_thru: selectedService.etd_thru
                  } : null
                },
                checkoutData: completeOrderData 
              } 
            });
          },
          onPending: function(result) {
            console.log('⏳ Menunggu pembayaran:', result);
            
            navigate('/order-success', { 
              state: { 
                orderData: {
                  order_number: orderNumber,
                  grand_total: calculateTotal(),
                  status: 'pending_payment',
                  created_at: currentDate,
                  payment_result: result,
                  jne_service: selectedService ? {
                    service_code: selectedService.service_code,
                    service_display: selectedService.service_display,
                    price: selectedService.price,
                    etd_from: selectedService.etd_from,
                    etd_thru: selectedService.etd_thru
                  } : null
                },
                checkoutData: completeOrderData 
              } 
            });
          },
          onError: function(result) {
            console.error('❌ Pembayaran error:', result);
            alert('Terjadi kesalahan saat proses pembayaran. Silakan coba lagi.');
          },
          onClose: function() {
            console.log('👤 User menutup popup tanpa menyelesaikan pembayaran');
          }
        });
      } else {
        throw new Error(data.message || 'Gagal mendapatkan token pembayaran')
      }

    } catch (error) {
      console.error('💥 Error saat proses pembayaran:', error);
      
      let errorMessage = 'Terjadi kesalahan saat proses pembayaran. Silakan coba lagi.'
      
      if (error.response) {
        if (error.response.status === 422) {
          const errors = error.response.data.errors
          if (errors) {
            const errorMessages = Object.values(errors).flat()
            errorMessage = errorMessages.join('\n')
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
      
    } finally {
      // Reset button state
      payButton.textContent = originalButtonText
      payButton.disabled = false
    }
  }

  // Deprecated function untuk backward compatibility
  const handleCheckout = async () => {
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
        {/* ✅ Load Midtrans Snap SDK only for non-COD */}
        {selectedPayment !== 'cod' && (
          <script src="https://app.midtrans.com/snap/snap.js" data-client-key="Mid-client-_PAqBcXrjHacb7gg"></script>
        )}
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
                    
                    {/* ✅ Email field */}
                    <div className="form-group">
                      <label className="form-label">
                        Email<span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange('email', e.target.value)}
                        placeholder="alamat@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Nomor Telepon<span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        placeholder="Nomor Telepon"
                      />
                    </div>
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
                        placeholder="Kode pos"
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

                {/* ✅ Enhanced Shipping Options with JNE services - Skip validation for COD */}
                <div className="shipping-section">
                  <h4 style={{ margin: '16px 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                    Pilih Metode Pengiriman:
                    {selectedPayment === 'cod' && (
                      <small style={{ display: 'block', color: '#28a745', fontSize: '12px', fontWeight: 'normal' }}>
                        ✨ COD: Validasi pengiriman otomatis dilewati
                      </small>
                    )}
                  </h4>
                  
                  {/* ✅ Enhanced JNE Services Section with COD bypass */}
                  <div className="jne-services-section">
                    <h5 style={{ 
                      margin: '12px 0 8px 0', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      JNE Services:
                      {selectedPayment !== 'cod' && isLoadingJne && (
                        <div className="jne-loading-spinner" style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid #f3f3f3',
                          borderTop: '2px solid #3498db',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      )}
                    </h5>
                    
                    {/* Debug Info - Remove in production */}
                    {process.env.NODE_ENV === 'development' && selectedPayment !== 'cod' && (
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        Debug: Province: {shippingAddress.province}, City: {shippingAddress.regency}, 
                        Address Loading: {addressLoading.toString()}, 
                        JNE Services: {jneServices.length}
                      </div>
                    )}
                    
                    {selectedPayment !== 'cod' && isLoadingJne && (
                      <div className="jne-loading" style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '4px',
                        margin: '8px 0',
                        textAlign: 'center'
                      }}>
                        <span>🔄 Memuat layanan JNE...</span>
                      </div>
                    )}
                    
                    {selectedPayment !== 'cod' && jneError && (
                      <div className="jne-error" style={{ 
                        color: '#dc3545', 
                        fontSize: '14px', 
                        margin: '8px 0',
                        padding: '8px 12px',
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '4px'
                      }}>
                        ⚠️ {jneError}
                        {jneError.includes('CORS') && (
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            💡 Tips: Coba refresh halaman atau gunakan browser yang berbeda
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* COD Bypass Message */}
                    {selectedPayment === 'cod' && (
                      <div className="cod-bypass-message" style={{
                        padding: '12px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px',
                        margin: '8px 0',
                        textAlign: 'center',
                        color: '#155724'
                      }}>
                        💰 <strong>Cash On Delivery</strong> - Pengiriman akan diatur secara manual
                      </div>
                    )}
                    
                    {selectedPayment !== 'cod' && !isLoadingJne && !jneError && jneServices.length > 0 && (
                      <>
                        <div className="jne-services-list">
                          {jneServices.map((service, idx) => (
                            <div key={idx} className="shipping-option jne-option" style={{
                              border: selectedShipping === 'jne' && selectedService === service ? '2px solid #b6b6b6ff' : '1px solid #e9ecef',
                              borderRadius: '6px',
                              padding: '12px',
                              margin: '8px 0',
                              backgroundColor: selectedShipping === 'jne' && selectedService === service ? '#f8f9ff' : 'white',
                              cursor: 'pointer'
                            }}>
                              <input 
                                type="radio" 
                                name="shipping" 
                                value="jne"
                                checked={selectedShipping === 'jne' && selectedService === service}
                                onChange={() => handleJneServiceSelect(service)}
                                disabled={hasFreeShippingVoucher()}
                              />
                              <div className="shipping-details">
                                <label style={{ fontWeight: '500', cursor: 'pointer' }}>
                                  {service.service_display} - {hasFreeShippingVoucher() ? 
                                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>Gratis dengan voucher ✨</span> : 
                                    <span style={{ color: '#000000ff', fontWeight: 'bold' }}>Rp{parseInt(service.price).toLocaleString('id-ID')}</span>
                                  }
                                </label>
                                <p className="shipping-estimate" style={{ 
                                  margin: '4px 0 0 20px', 
                                  fontSize: '13px', 
                                  color: '#6c757d' 
                                }}>
                                 Estimasi: {service.estimateText}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Show message when no JNE services available (non-COD only) */}
                    {selectedPayment !== 'cod' && !isLoadingJne && !jneError && jneServices.length === 0 && shippingAddress.regency && (
                      <div className="jne-unavailable" style={{ 
                        color: '#6c757d', 
                        fontSize: '14px', 
                        margin: '8px 0',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        📦 JNE services belum tersedia untuk kota ini
                      </div>
                    )}

                    {/* Show message when address is not complete (non-COD only) */}
                    {selectedPayment !== 'cod' && !shippingAddress.regency && (
                      <div className="jne-waiting" style={{ 
                        color: '#6c757d', 
                        fontSize: '14px', 
                        margin: '8px 0',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}>
                        📍 Pilih kota terlebih dahulu untuk melihat layanan JNE
                      </div>
                    )}
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

                <div className="payment-option" onClick={() => handlePaymentSelect('cod')}>
                  <div className="payment-info">
                    <div className="bank-logo cod-logo">
                      <img src={codLogo} alt="COD" style={{height: 45, width: 'auto', objectFit: 'contain'}} />
                    </div>
                    <span>Cash On Delivery</span>
                  </div>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={selectedPayment === 'gopay'}
                    readOnly
                  />
                </div>
              </div>

              {/* ✅ Enhanced Voucher Section for Buy Now */}
              {isBuyNow && (
                <div className="buy-now-voucher-section">
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#333' }}>Voucher Diskon (Max 2)</h4>
                  
                  {/* Show menu voucher info if applied as primary */}
                  {primaryVoucher && (
                    <div className="voucher-applied-info">
                      <div className="voucher-success">
                        <span className="checkmark">✓</span>
                        <div>
                          <strong>Voucher 1: {primaryVoucher.name}</strong>
                          <p>Diskon: Rp{primaryVoucherDiscount.toLocaleString('id-ID')} 🎉</p>
                          <small style={{color: '#666', fontSize: '12px'}}>
                            {getMenuVoucher() ? '' : ''}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Primary Voucher Selector - Only show if no primary voucher */}
                  {!primaryVoucher && (
                    <div className="voucher-selector-wrapper">
                      <h5>Voucher Pertama</h5>
                      <AdditionalVoucherSelector
                        totalAmount={subtotalBeforeVoucher}
                        existingVouchers={getExistingVouchers().filter(v => v !== primaryVoucher)}
                        onVoucherApplied={handlePrimaryVoucherApplied}
                        onVoucherRemoved={handlePrimaryVoucherRemoved}
                        appliedAdditionalVoucher={primaryVoucher}
                      />
                    </div>
                  )}

                  {/* Secondary Voucher Selector - Only show if primary voucher is selected */}
                  {primaryVoucher && (
                    <div className="voucher-selector-wrapper">
                      <h5>Voucher Kedua</h5>
                      <AdditionalVoucherSelector
                        totalAmount={Math.max(0, subtotalBeforeVoucher - primaryVoucherDiscount)}
                        existingVouchers={getExistingVouchers()}
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
                      totalAmount={Math.max(0, subtotalBeforeVoucher - (cartVoucherDiscount || 0))}
                      existingVouchers={getExistingVouchers()}
                      onVoucherApplied={handleAdditionalCartVoucherApplied}
                      onVoucherRemoved={handleAdditionalCartVoucherRemoved}
                      appliedAdditionalVoucher={additionalCartVoucher}
                    />
                  </div>
                </div>
              )}

              {/* ✅ Price Summary with COD support and JNE shipping cost validation status */}
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
                  <span>
                    Total Ongkos Kirim
                    {selectedShipping === 'jne' && selectedService && (
                      <small style={{display: 'block', color: '#666', fontSize: '12px'}}>
                        {selectedService.service_display}
                      </small>
                    )}
                    {selectedPayment === 'cod' && (
                      <small style={{display: 'block', color: '#28a745', fontSize: '12px'}}>
                        COD - Diatur manual
                      </small>
                    )}
                    {selectedPayment !== 'cod' && isLoadingJne && (
                      <small style={{display: 'block', color: '#6c757d', fontSize: '11px'}}>
                        🔄 Memuat...
                      </small>
                    )}
                  </span>
                  <span>
                    {hasFreeShippingVoucher() ? (
                      <>
                        <span className="original-price" style={{textDecoration: 'line-through', marginRight: '8px'}}>
                          Rp{getShippingCost().toLocaleString('id-ID')}
                        </span>
                        <span style={{color: '#28a745'}}>Gratis</span>
                      </>
                    ) : (
                      `Rp${getShippingCost().toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
                
                <div className="price-row">
                  <span>Total Asuransi Pengiriman</span>
                  <span>Rp{(useInsurance ? calculateInsuranceCost() : 0).toLocaleString('id-ID')}</span>
                </div>

                <div className="total-row">
                  <strong>Total Tagihan</strong>
                  <strong>Rp{calculateTotal().toLocaleString('id-ID')}</strong>
                </div>
                
                {/* ✅ Enhanced Pay Button with COD support and validation status */}
                <button 
                  className="pay-button" 
                  onClick={handlePay}
                  style={{
                    opacity: (selectedPayment !== 'cod' && ((jneServices.length > 0 && !selectedService) || isLoadingJne)) ? 0.7 : 1,
                    cursor: (selectedPayment !== 'cod' && ((jneServices.length > 0 && !selectedService) || isLoadingJne)) ? 'not-allowed' : 'pointer',
                    backgroundColor: selectedPayment === 'cod' ? '#28a745' : undefined
                  }}
                >
                  {selectedPayment === 'cod' ? 'Konfirmasi Pesanan COD' :
                   isLoadingJne ? 'Memuat Ongkir...' : 
                   (jneServices.length > 0 && !selectedService) ? 'Pilih Ongkir Dulu' : 
                   'Bayar Sekarang'}
                </button>
                
                {selectedPayment !== 'cod' && isLoadingJne && (
                  <div style={{ 
                    color: '#6c757d', 
                    fontSize: '12px', 
                    textAlign: 'center',
                    marginTop: '8px'
                  }}>
                    Sedang memuat layanan pengiriman...
                  </div>
                )}
                
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
      
      {/* ✅ CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .jne-option {
          transition: all 0.2s ease;
        }
        
        .jne-option:hover {
          background-color: #f8f9fa !important;
        }
        
        .pay-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .payment-option {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .payment-option:hover {
          background-color: #f8f9fa;
        }
        
        .cod-bypass-message {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

export default Checkout;