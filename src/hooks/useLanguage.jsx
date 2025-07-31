import { useState, useEffect, createContext, useContext } from 'react'

const LanguageContext = createContext()

// Translation data - Complete translations from original JavaScript
const translations = {
  en: {
    HOME: 'HOME',
    ABOUT: 'ABOUT', 
    MENU: 'MENU',
    BLOGS: 'BLOGS',
    OUTLETS: 'OUTLETS',
    CONTACT: 'CONTACT',
    'KABAR MONYENYO': 'MONYENYO NEWS',
    'KONTEN PROMO SEDANG KAMI SIAPKAN': 'PROMO CONTENT IS BEING PREPARED',
    'KOLEKSI LEZAT KAMI': 'OUR DELICIOUS COLLECTION',
    'MENU CAMILAN': 'SNACK MENU',
    'Nikmati kreasi kuliner khas kami dengan bahan terbaik dan rasa istimewa untuk pengalaman camilan tak terlupakan.': 'Enjoy our signature culinary creations with the finest ingredients and special flavors for an unforgettable snacking experience.',
    // 'KOLEKSI LEZAT KAMI': 'OUR DELICIOUS COLLECTION', // duplicate removed
    'Bolu abon sapi bertekstur lembut dengan taburan abon premium dan cita rasa gurih-manis yang seimbang. Satu box isi 6 potong.': 'Soft beef floss roll cake topped with premium beef floss and a balanced savory-sweet taste. One box contains 6 pieces.',
    'Brownies Pastry Original': 'Original Brownies Pastry',
    'Brownies fudgy dibalut dengan pastry olahan bertekstur kenyal menghadirkan rasa cokelat yang kaya dan manisnya pas di setiap gigitannya.': 'Fudgy brownies wrapped in chewy pastry, delivering rich chocolate flavor and perfect sweetness in every bite.',
    'Choco Roll Cocol': 'Choco Roll Dip',
    'Cokelat batang pilihan dibalut pastry olahan, dengan cocolan pilihan varian stroberi dan vanila yang manis. Satu box isi 6 potong.': 'Selected chocolate bars wrapped in pastry, with a choice of sweet strawberry and vanilla dips. One box contains 6 pieces.',
    'Brownies Pastry Tabur Keju': 'Brownies Pastry with Grated Cheese',
    'Brownies fudgy dengan keju serut berlimpah, dibalut pastry dengan rasa nyoklat, gurih, dan manis pas.': 'Fudgy brownies with abundant grated cheese, wrapped in pastry with chocolatey, savory, and perfectly sweet flavors.',
    'Cheese Roll Cocol': 'Cheese Roll Dip',
    // 'Brownies Pastry Tabur Keju': 'Brownies Pastry with Grated Cheese', // duplicate removed
    // 'Cheese Roll Cocol': 'Cheese Roll Cocol', // duplicate removed
    'Perpaduan pisang, cokelat, dan keju dalam pastry panggang yang renyah, dengan rasa manis dan gurih seimbang. Satu box isi 6 potong.': 'A blend of banana, chocolate, and cheese in crispy baked pastry, with a balanced sweet and savory taste. One box contains 6 pieces.',
    'Soft Cookies': 'Soft Cookies',
    'Cookies lembut dengan rasa cokelat dan sensasi susu yang nikmat. Satu box isi 6 potongan.': 'Soft cookies with chocolate flavor and a delicious milky sensation. One box contains 6 pieces.',
    'Brownies Fudgy Sekat': 'Fudgy Brownies with Toppings',
    'Brownies fudgy dengan 5 varian topping bikin nyemil banyak pilihan rasa.': 'Fudgy brownies with 5 topping variants for a variety of snacking flavors.',
    'Pastry': 'Pastry',
    'Bolu': 'Roll Cake',
    'Cookies': 'Cookies',
    'Lihat Semua Menu': 'View All Menu',
    'MONYENYO': 'MONYENYO',
    'CEMILAN<br>RASA TERBARU DARI<br>MONYENYO': 'THE LATEST<br>SNACK FLAVORS FROM<br>MONYENYO',
    'Banana Strudel Mini': 'Banana Strudel Mini',
    'Dengan isian pisang, keju, dan cokelat pilihan, dibalut dengan kulit pastry olahan terbaik. Bentuknya yang mini menjadikan cemilan ini lebih praktis.': 'Filled with banana, cheese, and selected chocolate, wrapped in the best pastry dough. Its mini shape makes this snack more practical.',
    'Tradisi Bertemu Inovasi': 'Tradition Meets Innovation',
    'Strudel berasal dari Eropa dan merupakan kue tradisional Austria serta Jerman dengan sejarah yang panjang. Di Indonesia, khususnya Banana Strudel, kue ini menjadi populer sebagai oleh-oleh khas dari Kota Malang.': 'Strudel originates from Europe and is a traditional cake from Austria and Germany with a long history. In Indonesia, especially Banana Strudel, this cake has become popular as a souvenir from Malang City.',
    'BEST SELLER': 'BEST SELLER',
    'FRESH FROM THE KITCHEN': 'FRESH FROM THE KITCHEN',
    'Nikmati perpaduan sempurna antara cita rasa tradisional Indonesia dan teknik kuliner modern, yang diolah setiap hari dari bahan-bahan terbaik.': 'Enjoy the perfect blend of traditional Indonesian flavors and modern culinary techniques, crafted daily from the finest ingredients.',
    // Duplicate removed
    'Rasakan sensasi baru camilan kesukaanmu dengan cocolan stroberi dan vanila yang bikin nagih. Ngemil jadi makin seru.': 'Experience a new sensation of your favorite snack with addictive strawberry and vanilla dips. Snacking just got more exciting.',
    // Duplicate removed
    'Brownies fudgy dengan keju serut yang dibalut pastry, terasa kenyal, nyoklat, dan manisnya pas. Kejunya melimpah di dalam.': 'Fudgy brownies with grated cheese wrapped in pastry, chewy, chocolatey, and perfectly sweet. Loaded with cheese inside.',
    'Berisi pisang, keju, dan cokelat pilihan, dibalut kulit pastry terbaik, camilan ini hadir dengan bentuk mini yang praktis.': 'Filled with banana, cheese, and selected chocolate, wrapped in the best pastry, this snack comes in a practical mini shape.',
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Duplicate removed
    // Outlets page translations
    'BROWNIES PASTRY': 'BROWNIES PASTRY',
    'BEST IN INDONESIA': 'BEST IN INDONESIA',
    'Soft. Crunchy. Irresistible.': 'Soft. Crunchy. Irresistible.'
  },
  id: {
    HOME: 'BERANDA',
    ABOUT: 'TENTANG',
    MENU: 'MENU',
    BLOGS: 'BLOG',
    OUTLETS: 'OUTLET',
    CONTACT: 'KONTAK',
    'Soft. Crispy. Irresistible.': 'Lembut. Renyah. Tak Tertahankan.',
    "INDONESIA'S BEST<br>BROWNIES PASTRY": "BROWNIES PASTRY<br>TERBAIK DI INDONESIA",
    'OUR COMPANY': 'TENTANG KAMI',
    'TRADITIONAL<br>INDONESIAN FOODS<br>AND HERITAGE': 'MAKANAN TRADISIONAL<br>INDONESIA & WARISAN',
    'The Heart of Every Kitchen': 'Jantung Setiap Dapur',
    'Restaurants are much more than just places where food is sold—they are hubs of tradition, culture, and creativity.': 'Restoran bukan sekadar tempat makan—mereka adalah pusat tradisi, budaya, dan kreativitas.',
    'Innovation Meets Tradition': 'Inovasi Bertemu Tradisi',
    "Restaurants will continue to evolve, balancing the rich traditions of cooking with the modern consumer's needs.": "Restoran akan terus berkembang, menyeimbangkan tradisi memasak dengan kebutuhan konsumen modern.",
    'Learn More About Us': 'Selengkapnya Tentang Kami',
    'SPECIALTY DISHES': 'MENU SPESIAL',
    'FRESH FROM THE KITCHEN': 'SEGAR DARI DAPUR',
    'Experience the perfect fusion of traditional Indonesian flavors with modern culinary techniques, crafted daily with the finest ingredients.': 'Rasakan perpaduan sempurna cita rasa tradisional Indonesia dengan teknik kuliner modern, dibuat setiap hari dengan bahan terbaik.',
    'Traditional Indonesian': 'Masakan Tradisional',
    'Authentic recipes passed down through generations with original spices and cooking methods': 'Resep otentik turun-temurun dengan rempah dan teknik asli',
    'Modern Presentation': 'Presentasi Modern',
    'Contemporary plating and presentation techniques while preserving authentic flavors': 'Teknik plating dan presentasi modern tanpa menghilangkan cita rasa asli',
    'Premium Quality': 'Kualitas Premium',
    'Only the finest local ingredients sourced directly from trusted Indonesian suppliers': 'Hanya bahan lokal terbaik langsung dari pemasok terpercaya',
    'OUR SPECIALTY': 'SPESIAL KAMI',
    'DELICIOUS MENU': 'MENU LEZAT',
    'Discover our signature collection of traditional Indonesian brownies and pastries.': 'Temukan koleksi signature brownies dan pastry tradisional Indonesia kami.',
    'Chocolate Brownies': 'Brownies Cokelat',
    'Rich and fudgy chocolate brownies made with premium cocoa and traditional Indonesian spices. Perfect balance of sweetness and texture.': 'Brownies cokelat legit dengan kakao premium dan rempah tradisional. Manis dan tekstur seimbang.',
    'Brownies': 'Brownies',
    'Traditional Pastry': 'Pastry Tradisional',
    'Authentic Indonesian pastry with crispy exterior and soft interior. Made with traditional recipes passed down through generations.': 'Pastry Indonesia otentik, luar renyah dalam lembut. Resep turun-temurun.',
    'Pastry': 'Pastry',
    'Premium Cake': 'Kue Premium',
    'Luxurious layered cake with premium ingredients and modern presentation. A perfect fusion of traditional taste and contemporary style.': 'Kue lapis mewah dengan bahan premium dan tampilan modern. Perpaduan tradisi dan gaya kontemporer.',
    'Cake': 'Kue',
    'View Full Menu': 'Lihat Menu Lengkap',
    'OUR STORIES': 'CERITA KAMI',
    'LATEST FROM BLOG': 'TERBARU DARI BLOG',
    'Discover the passion, tradition, and innovation behind every Monyenyo creation': 'Temukan semangat, tradisi, dan inovasi di balik setiap kreasi Monyenyo',
    'Heritage': 'Warisan',
    'The Art of Traditional Indonesian Brownies': 'Seni Brownies Tradisional Indonesia',
    'Journey through generations of baking traditions as we unveil the secrets behind our signature brownies': 'Jelajahi tradisi memanggang turun-temurun saat kami mengungkap rahasia di balik brownies andalan kami',
    'Recipes': 'Resep',
    'Secrets to Perfect Brownies': 'Rahasia Brownies Sempurna',
    'Behind Scenes': 'Di Balik Layar',
    'Morning at Monyenyo Kitchen': 'Pagi di Dapur Monyenyo',
    "Indonesia's Spice Heritage": "Warisan Rempah Indonesia",
    'Family Recipe Legacy': 'Warisan Resep Keluarga',
    'View All Stories': 'Lihat Semua Cerita',
    'A group of highly skilled professionals building a future of shared success.': 'Tim profesional membangun masa depan bersama.',
    'Contact Us': 'Hubungi Kami',
    'Social Media': 'Media Sosial',
    'All Rights Reserved.': 'Hak Cipta Dilindungi.',
    // Blogs page translations
    'STORIES & INSIGHTS': 'CERITA & WAWASAN',
    'Discover the passion, tradition, and innovation behind every Monyenyo creation through our collection of stories, recipes, and behind-the-scenes moments.': 'Temukan semangat, tradisi, dan inovasi di balik setiap kreasi Monyenyo melalui koleksi cerita, resep, dan momen di balik layar kami.',
    'Head Pastry Chef': 'Kepala Chef Pastry',
    'Read Full Story': 'Baca Cerita Lengkap',
    'EXPLORE BY CATEGORY': 'JELAJAHI BERDASARKAN KATEGORI',
    'Find stories that interest you most': 'Temukan cerita yang paling menarik bagi Anda',
    'All Stories': 'Semua Cerita',
    'Tips': 'Tips',
    'Behind-scenes': 'Di Balik Layar',
    'Load More Stories': 'Muat Lebih Banyak Cerita',
    'Stay in the Loop': 'Tetap Terhubung',
    'Get our latest stories, recipes, and exclusive offers delivered straight to your inbox.': 'Dapatkan cerita terbaru, resep, dan penawaran eksklusif langsung ke kotak masuk Anda.',
    'Enter your email address': 'Masukkan alamat email Anda',
    'Subscribe': 'Berlangganan',
    'We respect your privacy. Unsubscribe at any time.': 'Kami menghormati privasi Anda. Berhenti berlangganan kapan saja.',
    // Blog articles content
    'Master the art of creating the perfect brownie texture with our time-tested techniques and premium ingredient secrets.': 'Kuasai seni menciptakan tekstur brownies sempurna dengan teknik yang telah terbukti dan rahasia bahan premium kami.',
    'by Chef Budi': 'oleh Chef Budi',
    'Indonesian Spices in Modern Baking': 'Rempah Indonesia dalam Kue Modern',
    'Explore how traditional Indonesian spices like pandan, cinnamon, and nutmeg transform modern pastry creations.': 'Jelajahi bagaimana rempah tradisional Indonesia seperti pandan, kayu manis, dan pala mengubah kreasi pastry modern.',
    'by Chef Sari': 'oleh Chef Sari',
    'A Day in Monyenyo Kitchen': 'Sehari di Dapur Monyenyo',
    'Follow our bakers through their daily routine of creating fresh, delicious pastries from dawn to dusk.': 'Ikuti para baker kami melalui rutinitas harian mereka menciptakan pastry segar dan lezat dari fajar hingga senja.',
    'by Team Monyenyo': 'oleh Tim Monyenyo',
    'Home Baking Made Simple': 'Memanggang di Rumah Jadi Mudah',
    'Professional tips and tricks to elevate your home baking game and achieve bakery-quality results.': 'Tips dan trik profesional untuk meningkatkan kemampuan memanggang di rumah dan mencapai hasil berkualitas toko kue.',
    'by Chef Maria': 'oleh Chef Maria',
    'Traditional Pastry Recipes': 'Resep Pastry Tradisional',
    'Recreate classic Indonesian pastries at home with our authentic family recipes passed down through generations.': 'Buat ulang pastry Indonesia klasik di rumah dengan resep keluarga otentik kami yang diwariskan turun-temurun.',
    'by Chef Andi': 'oleh Chef Andi',
    'Preserving Culinary Heritage': 'Melestarikan Warisan Kuliner',
    'Our mission to preserve and celebrate Indonesia\'s rich baking traditions while embracing modern innovation.': 'Misi kami untuk melestarikan dan merayakan tradisi memanggang kaya Indonesia sambil merangkul inovasi modern.',
    'by Founder': 'oleh Pendiri',
    'Journey through generations of baking traditions as we unveil the secrets behind our signature brownies. From ancient spice blending techniques to modern presentation methods, discover how we honor Indonesia\'s rich culinary heritage.': 'Perjalanan melalui generasi tradisi memanggang saat kami mengungkap rahasia di balik brownies andalan kami. Dari teknik pencampuran rempah kuno hingga metode presentasi modern, temukan bagaimana kami menghormati warisan kuliner kaya Indonesia.',
    // Outlets page translations
    'OUR STORE LOCATION': 'LOKASI TOKO KAMI',
    'BROWNIES PASTRY': 'BROWNIES PASTRY',
    'BEST IN INDONESIA': 'TERBAIK DI INDONESIA',
    'Soft. Crunchy. Irresistible.': 'Lembut. Renyah. Tak Tertahankan.',
    // Duplicate removed
    'Our Store Location': 'Lokasi Toko Kami',
    'Visit Monyenyo Bandung': 'Kunjungi Monyenyo Bandung',
    'Experience authentic Indonesian brownies in our modern flagship store located in the heart of Bandung': 'Rasakan brownies Indonesia otentik di toko flagship modern kami yang terletak di jantung Bandung',
    'Find Our Location': 'Temukan Lokasi Kami',
    // Contact page translations
    'Get in Touch': 'Hubungi Kami',
    'Contact Us Today': 'Hubungi Kami Hari Ini',
    'We\'d love to hear from you. Reach out for inquiries, orders, or collaboration opportunities.': 'Kami ingin mendengar dari Anda. Hubungi kami untuk pertanyaan, pesanan, atau peluang kolaborasi.',
    'Send us a Message': 'Kirim Pesan',
    'Have a question or want to collaborate? We\'re here to help and excited to connect with you.': 'Punya pertanyaan atau ingin berkolaborasi? Kami di sini untuk membantu dan senang terhubung dengan Anda.',
    'Name': 'Nama',
    'Email': 'Email',
    'Message': 'Pesan',
    'Your Name': 'Nama Anda',
    'you@email.com': 'anda@email.com',
    'Type your message...': 'Ketik pesan Anda...',
    'Send Message': 'Kirim Pesan',
    'Call Us': 'Telepon Kami',
    'WhatsApp': 'WhatsApp',
    'Message sent successfully!': 'Pesan berhasil dikirim!',
    'Sorry, there was a problem sending your message. Please try again later.': 'Maaf, terjadi masalah saat mengirim pesan Anda. Silakan coba lagi nanti.',
    'Get in touch with Monyenyo. Contact us for inquiries, orders, or collaboration opportunities.': 'Hubungi Monyenyo. Kontak kami untuk pertanyaan, pesanan, atau peluang kolaborasi.',
    'Traditional Indonesian cuisine with authentic flavors and modern culinary techniques.': 'Masakan tradisional Indonesia dengan cita rasa otentik dan teknik kuliner modern.',
    // Home page translations
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('monyenyo_lang') || 'id'
  })

  useEffect(() => {
    localStorage.setItem('monyenyo_lang', language)
  }, [language])

  const t = (key) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}