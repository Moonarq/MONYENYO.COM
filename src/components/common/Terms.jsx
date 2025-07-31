import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './Terms.css';

const TERMS_CONTENT = {
  shipping: (
    <div className="terms-section">
      <h3 className="terms-title">Cakupan Asuransi</h3>
      <p>Untuk barang rusak atau hilang akibat kesalahan pada proses pengiriman, biaya ganti rugi senilai harga invoice, hingga Rp100.000.000</p>
      <h3 className="terms-title">Harga Premi</h3>
      <p>0.60% dari harga Invoice dengan pembulatan ke atas ke nominal ratusan terdekat</p>
      <h3 className="terms-title">Syarat dan Ketentuan</h3>
      <ul>
        <li>Maksimum pengajuan klaim adalah 3 hari untuk kurir instan dan 7 hari untuk pengiriman reguler setelah delivered</li>
        <li>Asuransi berlaku untuk resi yang valid (dapat dilacak)</li>
        <li>Asuransi hanya dapat di klaim sekali untuk satu pengiriman</li>
      </ul>
      <h3 className="terms-title">Barang yang Tidak Dapat Diklaim</h3>
      <p>Makanan dan minuman yang dikirim selain dengan kurir instan</p>
      <h3 className="terms-title">Disclaimer</h3>
      <p>Asuransi hanya berlaku untuk barang yang dikirim sesuai ketentuan di atas.</p>
    </div>
  ),
  product: (
    <div className="terms-section">
      <h3 className="terms-title">Proteksi Produk</h3>
      <p>Proteksi produk berlaku untuk kerusakan fisik pada produk yang diterima, sesuai invoice dan ketentuan toko.</p>
      <h3 className="terms-title">Syarat dan Ketentuan</h3>
      <ul>
        <li>Pengajuan klaim maksimal 3 hari setelah barang diterima</li>
        <li>Proteksi tidak berlaku untuk produk digital atau non-fisik</li>
      </ul>
      <h3 className="terms-title">Disclaimer</h3>
      <p>Proteksi produk mengikuti kebijakan toko dan syarat yang berlaku.</p>
    </div>
  )
};

const Terms = ({ visible, onClose }) => {
  const [tab, setTab] = useState('shipping');
  if (!visible) return null;

  return createPortal(
    <div className="terms-overlay">
      <div className="terms-modal">
        <button className="terms-close" onClick={onClose} aria-label="Tutup">
          <span>&times;</span>
        </button>
        <h2 className="terms-modal-title">S&K Asuransi & Proteksi</h2>
        <div className="terms-tabs">
          <button
            className={`terms-tab${tab === 'shipping' ? ' active' : ''}`}
            onClick={() => setTab('shipping')}
          >
            Pengiriman
          </button>
          <button
            className={`terms-tab${tab === 'product' ? ' active' : ''}`}
            onClick={() => setTab('product')}
          >
            Proteksi Produk
          </button>
        </div>
        <div className="terms-content-scroll">
          {TERMS_CONTENT[tab]}
        </div>
        <button className="terms-modal-btn" onClick={onClose}>Tutup</button>
      </div>
    </div>,
    document.body
  );
};

export default Terms;
