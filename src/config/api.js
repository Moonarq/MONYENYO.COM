// src/config/api.js
const API_CONFIG = {
  BASE_URL: 'https://api.monyenyo.com',
  STORAGE_URL: 'https://api.monyenyo.com/storage',
};

export const API_ENDPOINTS = {
  PRODUCTS: `${API_CONFIG.BASE_URL}/api/products`,
  VOUCHERS: `${API_CONFIG.BASE_URL}/api/vouchers`,
  CHECKOUT: `${API_CONFIG.BASE_URL}/api/checkout`,
};

export const getImageUrl = (imagePath) => {
  return `${API_CONFIG.STORAGE_URL}/${imagePath}`;
};

export default API_CONFIG;