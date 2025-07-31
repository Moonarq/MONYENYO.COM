import React, { useState, useEffect } from 'react';
import { useLanguage } from "../../hooks/useLanguage";
import './VoucherSelector.css'; // Assuming you have a CSS file for styling
import { API_ENDPOINTS, getImageUrl } from '../../config/api'

const VoucherSelector = ({ 
  totalAmount, 
  onVoucherApplied, 
  onVoucherRemoved, 
  appliedVoucher 
}) => {
  const { t } = useLanguage();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVouchers, setShowVouchers] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [validationStatus, setValidationStatus] = useState(''); // 'success' or 'error'

  // Fetch available vouchers
  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VOUCHERS);
      const data = await response.json();
      setVouchers(data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
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
        setValidationStatus('success');
        setValidationMessage(data.message);
        onVoucherApplied(data.voucher, data.discount);
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
    setShowVouchers(false);
    validateVoucher(voucher.name);
  };

  const handleRemoveVoucher = () => {
    setVoucherCode('');
    setValidationMessage('');
    setValidationStatus('');
    onVoucherRemoved();
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
        return 'Diskon';
      case 'fixed':
        return 'Potongan';
      case 'free_shipping':
        return 'Gratis Ongkir';
      default:
        return '';
    }
  };

  return (
    <div className="voucher-selector">
      <div className="voucher-header">
        <h4>{t('Voucher Discount')}</h4>
        <button 
          className="voucher-toggle"
          onClick={() => setShowVouchers(!showVouchers)}
        >
          {showVouchers ? 'Tutup' : 'Lihat Voucher'}
        </button>
      </div>

      {/* Applied Voucher Display */}
      {appliedVoucher && (
        <div className="applied-voucher">
          <div className="applied-voucher-info">
            <span className="voucher-name">{appliedVoucher.name}</span>
            <span className="voucher-value">
              {getVoucherTypeLabel(appliedVoucher.type)} {formatVoucherValue(appliedVoucher)}
            </span>
          </div>
          <button 
            className="remove-voucher"
            onClick={handleRemoveVoucher}
          >
            ✕
          </button>
        </div>
      )}

      {/* Voucher Input */}
      {!appliedVoucher && (
        <div className="voucher-input-section">
          <div className="voucher-input-group">
            <input
              type="text"
              placeholder="Masukkan kode voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="voucher-input"
            />
            <button 
              className="apply-voucher-btn"
              onClick={handleApplyVoucher}
              disabled={loading}
            >
              {loading ? 'Validasi...' : 'Gunakan'}
            </button>
          </div>
          
          {validationMessage && (
            <div className={`validation-message ${validationStatus}`}>
              {validationMessage}
            </div>
          )}
        </div>
      )}

      {/* Available Vouchers List */}
      {showVouchers && (
        <div className="vouchers-list">
          <h5>Voucher Tersedia:</h5>
          {vouchers.length > 0 ? (
            <div className="vouchers-grid">
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id} 
                  className="voucher-card"
                  onClick={() => handleSelectVoucher(voucher)}
                >
                  <div className="voucher-card-header">
                    <span className="voucher-type-badge">
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
            <p className="no-vouchers">Tidak ada voucher tersedia saat ini</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;