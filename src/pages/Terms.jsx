import { useNavigate } from 'react-router-dom';
import './Terms.css'; // Import CSS file

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      {/* Header */}
      <div className="terms-header">
        <div className="terms-header-content">
          <div className="terms-header-flex">
            <button 
              onClick={() => navigate(-1)}
              className="back-button"
            >
              <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="terms-title">
              Syarat & Ketentuan Asuransi Pengiriman & Proteksi
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="terms-content">
        <div className="terms-card">
          
          {/* Introduction */}
          <div className="terms-section">
            <h2 className="section-title">
              Asuransi Pengiriman & Proteksi
            </h2>
            <p className="terms-text">
              Dengan menggunakan layanan Asuransi Pengiriman & Proteksi, Anda menyetujui 
              syarat dan ketentuan berikut ini. Silakan baca dengan seksama sebelum melanjutkan 
              pembelian.
            </p>
          </div>

          {/* Coverage */}
          <div className="terms-section">
            <h3 className="subsection-title">
              1. Cakupan Perlindungan
            </h3>
            <ul className="terms-list">
              <li>Kerusakan barang selama proses pengiriman</li>
              <li>Kehilangan paket selama dalam perjalanan</li>
              <li>Keterlambatan pengiriman yang menyebabkan kerugian</li>
              <li>Barang tidak sesuai dengan deskripsi (dengan bukti yang memadai)</li>
            </ul>
          </div>

          {/* Terms */}
          <div className="terms-section">
            <h3 className="subsection-title">
              2. Syarat Klaim
            </h3>
            <ul className="terms-list">
              <li>Laporan klaim harus dibuat maksimal 7 hari setelah barang diterima</li>
              <li>Menyertakan foto/video unboxing sebagai bukti kondisi barang</li>
              <li>Menyimpan kemasan asli untuk keperluan investigasi</li>
              <li>Memberikan bukti pembelian dan nomor resi pengiriman</li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="terms-section">
            <h3 className="subsection-title">
              3. Pengecualian
            </h3>
            <ul className="terms-list">
              <li>Kerusakan akibat kelalaian penerima</li>
              <li>Barang pecah belah tanpa tambahan asuransi khusus</li>
              <li>Kerusakan akibat bencana alam atau force majeure</li>
              <li>Barang dengan nilai di atas Rp 10.000.000 tanpa konfirmasi khusus</li>
            </ul>
          </div>

          {/* Process */}
          <div className="terms-section">
            <h3 className="subsection-title">
              4. Proses Klaim
            </h3>
            <div>
              <p className="process-step">
                <span className="step-label">Langkah 1:</span> Hubungi customer service melalui chat atau email
              </p>
              <p className="process-step">
                <span className="step-label">Langkah 2:</span> Kirimkan dokumen pendukung yang diperlukan
              </p>
              <p className="process-step">
                <span className="step-label">Langkah 3:</span> Tim akan melakukan investigasi (maksimal 14 hari kerja)
              </p>
              <p className="process-step">
                <span className="step-label">Langkah 4:</span> Penggantian akan diproses jika klaim disetujui
              </p>
            </div>
          </div>

          {/* Compensation */}
          <div className="terms-section">
            <h3 className="subsection-title">
              5. Kompensasi
            </h3>
            <ul className="terms-list">
              <li>Penggantian berupa refund atau pengiriman ulang barang</li>
              <li>Kompensasi maksimal sesuai dengan nilai barang yang diasuransikan</li>
              <li>Proses refund akan dilakukan dalam 7-14 hari kerja setelah persetujuan</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="terms-section">
            <h3 className="subsection-title">
              6. Kontak & Bantuan
            </h3>
            <div className="contact-box">
              <p className="contact-item">
                <span className="contact-label">Customer Service:</span> 24/7 melalui chat atau email
              </p>
              <p className="contact-item">
                <span className="contact-label">Email:</span> support@yourstore.com
              </p>
              <p className="contact-item">
                <span className="contact-label">Hotline:</span> 1500-xxx (24 jam)
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="terms-footer">
            <p className="footer-text">
              Syarat dan ketentuan ini berlaku sejak tanggal pembelian dan dapat berubah 
              sewaktu-waktu tanpa pemberitahuan sebelumnya. Dengan melanjutkan pembelian, 
              Anda dianggap menyetujui semua ketentuan di atas.
            </p>
            <p className="footer-text">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>

        </div>

        {/* Back Button */}
        <div className="back-to-checkout">
          <button 
            onClick={() => navigate(-1)}
            className="checkout-button"
          >
            Kembali ke Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;