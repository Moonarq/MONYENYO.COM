import jneDestination from './jne_destination.json';
import kabupatenKota from './addressData.json'; // atau file kamu yang lama

// Map ID kabupaten lama → City_Code JNE
export const jneCityMap = {};

Object.entries(kabupatenKota).forEach(([id, nama]) => {
  // Cari di jne_destination berdasarkan nama kota
  const match = jneDestination.detail.find(dest =>
    dest.City_Name.toLowerCase().includes(nama.toLowerCase())
  );

  if (match) {
    jneCityMap[id] = match.City_Code;
  }
});
