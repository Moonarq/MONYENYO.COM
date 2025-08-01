import { useNavigate } from 'react-router-dom';
import './Terms.css'; // Import CSS file

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
    
      {/* Content */}
      <div className="terms-content">
        <div className="terms-card">
          
          {/* Introduction */}
          <div className="terms-section">
            <h2 className="section-title">
              Syarat dan Ketentuan, serta Garansi
            </h2>
            <p className="terms-text">
             Dengan membeli produk melalui website resmi MoNyeNyo, 
             Anda menyetujui syarat dan Ketentuan berikut ini. 
             Silahkan Baca dengan seksama sebelum melanjutkan pembelian.
            </p>
          </div>  

          {/* Coverage */}
          <div className="terms-section">
            <h3 className="subsection-title">
              1. Cakupan Perlindungan
            </h3>
            <ul className="terms-list">
              Kami memberikan GARANSI 100% uang Kembali terhadap produk yang Anda beli di website resmi MoNyeNYo sebagai upaya perlindungan
                 terhadap transaksi yang dilakukan dan kenyamanan dalam berbelanja.
            </ul>
          </div>

          {/* Terms */}
          <div className="terms-section">
            <h3 className="subsection-title">
              2. Ketentuan GARANSI
            </h3>
            <ul className="terms-list">
              <div style={{ marginBottom: '0.75em' }}>
                GARANSI 100% UANG KEMBALI kami berikan terhadap :
              </div>
              <li>Produk diterima sudah berjamur dan tidak layak dikonsumsi.</li>
              <li>Produk yang diterima tidak sesuai dengan yang dibeli konsumen.</li>
              <li>Produk pesanan hilang selama dalam perjalanan.</li>
              <li>Kerusakan Produk selama proses pengiriman</li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="terms-section">
            <h3 className="subsection-title">
             3. Syarat Klaim GARANSI
            </h3>
            <ul className="terms-list">
              <li>Klaim GARANSI harus disertakan video UNBOXING tanpa jeda terhadap paket produk yang diterima</li>
              <li>Memberikan FOTO bukti pembelian dan nomor resi pengiriman</li>
              <li>Pengajuan KLAIM harus dikirimkan maksimal 2 hari setelah produk diterima.</li>
              <li>Pengajuan klaim GARANSI hanya dapat dilakukan melalui customer service resmi MoNyeNyo</li>
            </ul>
          </div>

           <div className="terms-section">
            <h3 className="subsection-title">
              4. Pengecualian
            </h3>
            <ul className="terms-list">
              <div style={{ marginBottom: '0.75em' }}>
                GARANSI 100% UANG KEMBALI tidak belaku terhadap KLAIM sebagai berikut :
              </div>
              <li>Klaim dikarenakan konsumen salah memilih dan memesan produk</li>
              <li>Klaim dikarenakan kesalahan informasi dari pembeli berkenaan dengan 
                Alamat dan nomer kontak yang menyebabkan produk tidak diterima dan mengakibatkan kerusakan.</li>
              <li>Klaim dikarenakan produk tidak enak di lidah konsumen</li>
              <li>Klaim yang tidak memenuhi syarat KLAIM GARANSI</li>
               <li>Kerusakan atau kerugian akibat bencana alam atau force majeru</li>
            </ul>
          </div>

          {/* Process */}
          <div className="terms-section">
            <h3 className="subsection-title">
              5. Proses KLAIM
            </h3>
            <div>
              <p className="process-step">
                <span className="step-label">Langkah 1:</span> Hubungi Customer Care / Admin kami melalui chat
              </p>
              <p className="process-step">
                <span className="step-label">Langkah 2:</span> Kirimkan SYARAT KLAIM GARANSI
              </p>
              <p className="process-step">
                <span className="step-label">Langkah 3:</span> Proses pengembalian uang akan dilakukan (Maksimal 1-2 hari kerja)
              </p>
            </div>
          </div>

   
          {/* Contact */}
          <div className="terms-section">
            <h3 className="subsection-title">
              6. Kontak & Bantuan
            </h3>
            <div className="contact-box">
              <p className="contact-item">
                <span className="contact-label">Customer Service:</span> 0857 2496 0839
              </p>
              <p className="contact-item">
                <span className="contact-label">Email:</span> monyenyo.bdg@gmail.com
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="terms-footer">
            <p className="footer-text">
              Syarat dan ketentuan ini berlaku sejak tanggal pembelian dan dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.
                Dengan melanjutkan pembelian, Anda dianggap menyetujui semua ketentuan di atas.
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