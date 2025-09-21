import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../hooks/useLanguage'
import axios from 'axios'
import './Tracking.css'

const Tracking = () => {
  const { t } = useLanguage()
  const [awb, setAwb] = useState('')
  const [trackingResult, setTrackingResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Apply Tracking page styles to header/navbar
  useEffect(() => {
    document.body.classList.add('tracking-page')
    return () => {
      document.body.classList.remove('tracking-page')
    }
  }, [])

  const handleTrackPackage = async (e) => {
    e.preventDefault()
    
    if (!awb.trim()) {
      setError('Masukkan nomor resi untuk melacak paket')
      return
    }

    setLoading(true)
    setError('')
    setTrackingResult(null)

    try {
      const response = await axios.post('https://api.monyenyo.com/tracking-api.php', {
        awb: awb.trim()
      })

      setTrackingResult(response.data)
      
    } catch (err) {
      console.error('Tracking error:', err)
      
      if (err.response?.status === 404) {
        setError('Nomor resi tidak ditemukan. Pastikan nomor resi sudah benar.')
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || 'Format nomor resi tidak valid'
        if (errorMsg.includes('Sistem hanya mendukung tracking resi JNE')) {
          setError('❌ Format tidak didukung: Sistem tracking hanya mendukung nomor resi JNE (13-16 digit angka). Silakan gunakan kurir JNE untuk tracking otomatis.')
        } else {
          setError(errorMsg)
        }
      } else {
        setError('Gagal melacak paket. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <>
      <Helmet>
        <title>Tracking Paket - Monyenyo</title>
        <meta name="description" content="Lacak status pengiriman paket Monyenyo Anda dengan mudah" />
        <link rel="icon" href="/images/favicon_large.ico" type="image/x-icon" />
      </Helmet>
      
      <div className="tracking-page">
        {/* Hero Section */}
        <section className="tracking-hero">
          <div className="container">
            <div className="tracking-hero-content">
              <div className="hero-text-center">
                <h1 className="hero-main-title">Lacak Paket Anda</h1>
                <p className="hero-description">
                  Masukkan nomor resi untuk mengetahui status terkini pengiriman paket Monyenyo Anda
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking Form Section */}
        <section className="tracking-form-section">
          <div className="container">
            <div className="tracking-form-wrapper">
              <form onSubmit={handleTrackPackage} className="tracking-form">
                <div className="tracking-input-group">
                  <div className="input-wrapper">
                    <i className="fas fa-search input-icon"></i>
                    <input
                      type="text"
                      value={awb}
                      onChange={(e) => setAwb(e.target.value)}
                      placeholder="Masukkan nomor resi"
                      className="tracking-input"
                      disabled={loading}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="tracking-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Melacak...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search"></i>
                        Lacak Paket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <section className="tracking-error">
            <div className="container">
              <div className="error-card">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Oops! Ada Masalah</h3>
                <p>{error}</p>
                <button onClick={() => setError('')} className="error-close-btn">
                  Tutup
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tracking Results */}
        {trackingResult && (
          <section className="tracking-results">
            <div className="container">
              {trackingResult.success ? (
                <div className="tracking-success">
                  <div className="result-header">
                    <i className={`fas ${trackingResult.data.status === 'processing' ? 'fa-clock' : 'fa-check-circle'}`}></i>
                    <h2>{trackingResult.data.status === 'processing' ? 'Menunggu Pengambilan' : 'Paket Ditemukan!'}</h2>
                    <p>Nomor Resi: <strong>{trackingResult.data.awb}</strong></p>
                    
                    {trackingResult.data.status === 'processing' && (
                      <div className="processing-info" style={{display: 'none'}}>
                        <div className="processing-badge">
                          Menunggu Pengambilan
                        </div>
                      </div>
                    )}
                  </div>

                  {trackingResult.data.cnote && (
                    <div className="package-status">
                      <div className="status-card">
                        <h3>Status Paket</h3>
                        <div className="status-info">
                          <div className="status-item">
                            <span className="status-label">Status Terakhir:</span>
                            <span className="status-value">
                              {trackingResult.data.cnote.last_status || 'Tidak tersedia'}
                            </span>
                          </div>
                          <div className="status-item">
                            <span className="status-label">Status POD:</span>
                            <span className="status-value">
                              {trackingResult.data.cnote.pod_status || 'Belum tersedia'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {trackingResult.data.history && trackingResult.data.history.length > 0 && (
                    <div className="tracking-history">
                      <h3>Riwayat Pengiriman</h3>
                      <div className="history-timeline">
                        {trackingResult.data.history.map((item, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <div className="timeline-date">
                                {formatDate(item.date)}
                              </div>
                              <div className="timeline-desc">
                                {item.desc}
                              </div>
                              {item.city && (
                                <div className="timeline-location">
                                  <i className="fas fa-map-marker-alt"></i>
                                  {item.city}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="tracking-not-found">
                  <div className="not-found-card">
                    <i className="fas fa-search"></i>
                    <h3>Paket Tidak Ditemukan</h3>
                    <p>{trackingResult.message}</p>
                    <button onClick={() => {
                      setTrackingResult(null)
                      setAwb('')
                    }} className="track-again-btn">
                      Lacak Lagi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Info Section */}
      </div>
    </>
  )
}

export default Tracking