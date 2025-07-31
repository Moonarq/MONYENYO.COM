import React from 'react';
import './ShareOverlay.css';
import { API_ENDPOINTS, getImageUrl } from '../../config/api'

const ShareOverlay = ({ visible, onClose, product }) => {
  if (!visible || !product) return null;

  const productUrl = `${window.location.origin}/menu/${product.id}`;
  const productTitle = `${product.name}`;
  const productPrice = product.discount_percentage && product.discount_percentage > 0 
    ? `Rp${Number(product.price - (product.price * product.discount_percentage / 100)).toLocaleString('id-ID')}`
    : `Rp${Number(product.price).toLocaleString('id-ID')}`;

  const shareData = {
    title: productTitle,
    text: `${productTitle} - ${productPrice}`,
    url: productUrl
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleLineShare = () => {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);
    window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(shareData.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
    window.location.href = `sms:?body=${text}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      // You might want to show a toast notification here
      alert('Link berhasil disalin!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link berhasil disalin!');
    }
  };

  const handleMoreOptions = () => {
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback - you can implement your own more options modal
      alert('Fitur berbagi lainnya tidak tersedia di browser ini');
    }
  };

  return (
    <div className="share-overlay-backdrop" onClick={onClose}>
      <div className="share-overlay-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="share-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {/* Header */}
        <div className="share-header">
          <h3>Belanja rame-rame pasti lebih seru!</h3>
        </div>

        {/* Product Preview */}
        <div className="share-product-preview">
          <div className="share-product-image">
            <img 
              src={
                product.images && product.images.length > 0 
                  ? getImageUrl(product.images[0]) 
                  : product.image
              } 
              alt={product.name}
              onError={(e) => {
                e.target.src = product.image || '/images/placeholder.jpg';
              }}
            />
          </div>
          <div className="share-product-info">
            <h4>{productTitle}</h4>
            <p>Monyenyo.com</p>
          </div>
        </div>

        {/* Affiliate Banner */}
    
        {/* Share Question */}
        <div className="share-question">
          <h4>Mau bagikan lewat mana?</h4>
        </div>

        {/* Share Options */}
        <div className="share-options">
          <button className="share-option" onClick={handleWhatsAppShare}>
            <div className="share-option-icon whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
              </svg>
            </div>
            <span>Whatsapp</span>
          </button>

          <button className="share-option" onClick={handleTelegramShare}>
            <div className="share-option-icon telegram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <span>Telegram</span>
          </button>

          <button className="share-option" onClick={handleLineShare}>
            <div className="share-option-icon line">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.631-.63.345 0 .629.285.629.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </div>
            <span>Line</span>
          </button>

          <button className="share-option" onClick={handleFacebookShare}>
            <div className="share-option-icon facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <span>Facebook</span>
          </button>

          <button className="share-option" onClick={handleTwitterShare}>
            <div className="share-option-icon twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span>X</span>
          </button>

          {/* SMS Button - hanya tampil di mobile */}
          <button className="share-option sms-mobile-only" onClick={handleSMSShare}>
            <div className="share-option-icon sms">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            </div>
            <span>SMS</span>
          </button>

          <button className="share-option" onClick={handleCopyLink}>
            <div className="share-option-icon copy-link">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </div>
            <span>Salin Link</span>
          </button>

          <button className="share-option" onClick={handleMoreOptions}>
            <div className="share-option-icon more">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <span>Lainnya</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareOverlay;