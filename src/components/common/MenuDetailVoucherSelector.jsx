import React, { useState, useEffect } from 'react';
import { useLanguage } from "../../hooks/useLanguage";
import './MenuDetailVoucherSelector.css';
import { API_ENDPOINTS, getImageUrl } from '../../config/api'

const MenuDetailVoucherSelector = ({ 
  totalAmount, 
  onVoucherApplied, 
  onVoucherRemoved,
  appliedVoucher 
}) => {
  const { t } = useLanguage();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [validationStatus, setValidationStatus] = useState('');
  

  // Fetch available vouchers
  useEffect(() => {
    if (showModal) {
      fetchAvailableVouchers();
    }
  }, [showModal]);

  const fetchAvailableVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.VOUCHERS);
      const data = await response.json();
      
      // Filter vouchers that are not currently applied
      const availableVouchers = data.filter(voucher => {
        // Skip if voucher is already applied
        if (appliedVoucher && (voucher.id === appliedVoucher.id || 
            voucher.name?.toLowerCase() === appliedVoucher.name?.toLowerCase())) {
          return false;
        }
        
        // Show all voucher types
        return voucher.type === 'percent' || voucher.type === 'fixed' || voucher.type === 'free_shipping';
      });
      
      setVouchers(availableVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateVoucher = async (voucherName) => {
    setLoading(true);
    setValidationMessage('');
    
    try {
      const response = await fetch(`${API_ENDPOINTS.VOUCHERS}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucher_name: voucherName,
          total_amount: totalAmount
        })
      });

      const data = await response.json();
      
      if (data.valid) {
        // Check if this voucher is already applied
        if (appliedVoucher && (data.voucher.id === appliedVoucher.id ||
            data.voucher.name?.toLowerCase() === appliedVoucher.name?.toLowerCase())) {
          setValidationStatus('error');
          setValidationMessage('Voucher ini sudah diterapkan');
          return;
        }

        // Check if it's a valid voucher type
        if (!['percent', 'fixed', 'free_shipping'].includes(data.voucher.type)) {
          setValidationStatus('error');
          setValidationMessage('Tipe voucher tidak valid');
          return;
        }

        setValidationStatus('success');
        setValidationMessage(data.message);
        onVoucherApplied(data.voucher, data.discount);
        setShowModal(false);
        setVoucherCode('');
        setValidationMessage('');
        setValidationStatus('');
      } else {
        setValidationStatus('error');
        setValidationMessage(data.message);
      }
    } catch (error) {
      setValidationStatus('error');
      setValidationMessage('Terjadi kesalahan saat memvalidasi voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      setValidationStatus('error');
      setValidationMessage('Masukkan kode voucher');
      return;
    }
    validateVoucher(voucherCode.trim());
  };

  const handleSelectVoucher = (voucher) => {
    setVoucherCode(voucher.name);
    validateVoucher(voucher.name);
  };

  const handleRemoveVoucher = () => {
    onVoucherRemoved();
    setVoucherCode('');
    setValidationMessage('');
    setValidationStatus('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setVoucherCode('');
    setValidationMessage('');
    setValidationStatus('');
  };

  const formatVoucherValue = (voucher) => {
    switch (voucher.type) {
      case 'percent':
        return `${voucher.value}%`;
      case 'fixed':
        return `Rp ${Number(voucher.value).toLocaleString('id-ID')}`;
      case 'free_shipping':
        return 'Gratis Ongkir';
      default:
        return '';
    }
  };

  const getVoucherTypeLabel = (type) => {
    switch (type) {
      case 'percent':
        return 'DISKON';
      case 'fixed':
        return 'POTONGAN';
      case 'free_shipping':
        return 'ONGKIR';
      default:
        return '';
    }
  };

  const getVoucherBadgeClass = (type) => {
    switch (type) {
      case 'percent':
        return 'voucher-type-badge discount';
      case 'fixed':
        return 'voucher-type-badge fixed';
      case 'free_shipping':
        return 'voucher-type-badge shipping';
      default:
        return 'voucher-type-badge';
    }
  };

  return (
    <div className="menu-detail-voucher-container">
      {/* Trigger Button/Area */}
      <div 
        className={`menu-detail-voucher-trigger ${appliedVoucher ? 'has-applied-voucher' : ''}`}
        onClick={() => {
          if (appliedVoucher) {
            // If voucher is applied, clicking removes it
            handleRemoveVoucher();
          } else {
            // If no voucher, clicking shows dropdown
            setShowModal(true);
          }
        }}
      >
        {appliedVoucher ? (
          <div className="applied-menu-voucher">
            <div className="voucher-info">
              <span className="checkmark">✓</span>
              <div>
                <div className="voucher-name">{appliedVoucher.name}</div>
                <div className="voucher-value">
                  Diskon {formatVoucherValue(appliedVoucher)} diterapkan!
                </div>
              </div>
            </div>
            {/* Remove button */}
            <button 
              className="remove-menu-voucher"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveVoucher();
              }}
              title="Hapus voucher"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="add-menu-voucher-prompt">
            <span>Pilih Voucher Diskon</span>
            <span className="arrow-icon">›</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="menu-voucher-modal-overlay">
          <div className="menu-voucher-modal">
            <div className="menu-voucher-modal-header">
              <h3>Pilih Voucher Diskon</h3>
              <button 
                className="close-modal"
                onClick={handleCloseModal}
                title="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="menu-voucher-modal-content">
              {/* Manual Input */}
              <div className="manual-voucher-section">
                <h4>Masukkan Kode Voucher</h4>
                <div className="voucher-input-group">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Masukkan kode voucher"
                    className={`voucher-input ${validationStatus}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyVoucher();
                      }
                    }}
                  />
                  <button 
                    className="apply-voucher-btn"
                    onClick={handleApplyVoucher}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Terapkan'}
                  </button>
                </div>
                {validationMessage && (
                  <div className={`validation-message ${validationStatus}`}>
                    {validationMessage}
                  </div>
                )}
              </div>

              {/* Available Vouchers */}
              <div className="available-vouchers-section">
                <h4>Voucher Tersedia</h4>
                
                {loading ? (
                  <div className="loading-vouchers">
                    <p>Memuat voucher...</p>
                  </div>
                ) : vouchers.length > 0 ? (
                  <div className="vouchers-grid">
                    {vouchers.map((voucher) => (
                      <div 
                        key={voucher.id} 
                        className="voucher-card"
                        onClick={() => handleSelectVoucher(voucher)}
                      >
                        <div className="voucher-card-header">
                          <span className={getVoucherBadgeClass(voucher.type)}>
                            {getVoucherTypeLabel(voucher.type)}
                          </span>
                          <span className="voucher-value-display">
                            {formatVoucherValue(voucher)}
                          </span>
                        </div>
                        <div className="voucher-card-body">
                          <h6>{voucher.name}</h6>
                          {voucher.min_purchase && (
                            <p className="min-purchase">
                              Min. pembelian: Rp {Number(voucher.min_purchase).toLocaleString('id-ID')}
                            </p>
                          )}
                          {voucher.end_date && (
                            <p className="expiry">
                              Berlaku s/d: {new Date(voucher.end_date).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-vouchers">Tidak ada voucher yang tersedia</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuDetailVoucherSelector;