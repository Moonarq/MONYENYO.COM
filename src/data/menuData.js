import desktop1 from '../assets/images/desktop1.jpg';
import desktop2 from '../assets/images/desktop2.jpg';
import desktop3 from '../assets/images/desktop3.jpg';
import desktop4 from '../assets/images/desktop4.jpg';
import desktop5 from '../assets/images/desktop5.jpg';
import desktop6 from '../assets/images/desktop6.jpg';

export const promoHTML = '<br/><span class="promo-badge promo-pulse">Click promo spesial!</span>';

export const menuData = [
  {
    id: 1,
    image: desktop1,
    images: [desktop1, desktop2, desktop3],
    name: 'Bolu Abon Sapi',
    description: "Bolu abon sapi bertekstur lembut dengan taburan abon premium dan cita rasa gurih-manis yang seimbang. Satu box isi 6 potong." + promoHTML,
    price: 'Rp 45,000',
    category: 'Bolu',
    rating: '4.9',
    link: 'https://setoko.co/monyenyo-bakery/bolu-gulung-abon-sapi-isi-8-pcs-544268'
  },
  {
    id: 2,
    image: desktop2,
    name: 'Brownies Pastry Original',
    description: 'Brownies fudgy dibalut dengan pastry olahan bertekstur kenyal menghadirkan rasa cokelat yang kaya dan manisnya pas di setiap gigitannya.' + promoHTML,
    price: 'Rp 62,000',
    category: 'Pastry',
    rating: '4.8',
    link: 'https://setoko.co/monyenyo-bakery/brownies-pastry-original-544152'
  },
  {
    id: 3,
    image: desktop3,
    name: 'Choco Roll Cocol',
    description: 'Cokelat batang pilihan dibalut pastry olahan, dengan cocolan pilihan varian stroberi dan vanila yang manis. Satu box isi 6 potong.' + promoHTML,
    price: 'Rp 55,000',
    category: 'Pastry',
    rating: '5.0',
    link: 'https://setoko.co/monyenyo-bakery/chocoroll-monyenyo-cocol-isi-10-pcs-544267'
  },
  {
    id: 4,
    image: desktop4,
    name: 'Brownies Pastry Tabur Keju',
    description: 'Brownies fudgy dengan keju serut berlimpah, dibalut pastry dengan rasa nyoklat, gurih, dan manis pas.' + promoHTML,
    price: 'Rp 65,000',
    category: 'Pastry',
    rating: '5.0',
    link: 'https://setoko.co/monyenyo-bakery/brownies-pastry-insert-tabur-keju-544137'
  },
  {
    id: 5,
    image: desktop5,
    name: 'Cheese Roll Cocol',
    description: 'Perpaduan keju batang pilihan dan pastry lembut dengan varian cocolan stroberi atau vanila. Satu box isi 10 potong.' + promoHTML,
    price: 'Rp 55,000',
    category: 'Pastry',
    rating: '5.0',
    link: 'https://setoko.co/monyenyo-bakery/cheese-roll-monyenyo-cocol-isi-10-pcs-544204'
  },
  {
    id: 6,
    image:desktop6,
    images: [desktop6, desktop4, desktop1],
    name: 'Banana Strudel Mini',
    description: 'Perpaduan pisang, cokelat, dan keju dalam pastry panggang yang renyah, dengan rasa manis dan gurih seimbang. Satu box isi 6 potong.' + promoHTML,
    price: 'Rp 55,000',
    category: 'Pastry',
    rating: '5.0',
    link: 'https://setoko.co/monyenyo-bakery/banana-strudel-mini-544138'
  },
];
