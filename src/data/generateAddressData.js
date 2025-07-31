// Script untuk menggabungkan data provinsi, kabupaten/kota, kecamatan, dan kelurahan_desa menjadi addressData.json
// Jalankan: node src/data/generateAddressData.js

const fs = require('fs');
const path = require('path');

const provinsiPath = path.join(__dirname, 'provinsi', 'provinsi.json');
const kabupatenDir = path.join(__dirname, 'kabupaten_kota');
const kecamatanDir = path.join(__dirname, 'kecamatan');
const kelurahanDir = path.join(__dirname, 'kelurahan_desa');
const outputPath = path.join(__dirname, 'addressData.json');

// Helper untuk load JSON file
function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// 1. Load provinsi
const provinsiData = loadJSON(provinsiPath); // {"11": "ACEH", ...}

// 2. Load kabupaten/kota
const kabupatenFiles = fs.readdirSync(kabupatenDir).filter(f => f.endsWith('.json'));
let kabupatenData = {};
kabupatenFiles.forEach(file => {
  const data = loadJSON(path.join(kabupatenDir, file));
  kabupatenData = { ...kabupatenData, ...data };
});
// kabupatenData: {"1101": "KAB. SIMEULUE", ...}

// 3. Load kecamatan
const kecamatanFiles = fs.readdirSync(kecamatanDir).filter(f => f.endsWith('.json'));
let kecamatanData = {};
kecamatanFiles.forEach(file => {
  const data = loadJSON(path.join(kecamatanDir, file));
  kecamatanData = { ...kecamatanData, ...data };
});
// kecamatanData: {"1101010": "TEUPAH SELATAN", ...}

// 4. Load kelurahan/desa
const kelurahanFiles = fs.readdirSync(kelurahanDir).filter(f => f.endsWith('.json'));
let kelurahanData = {};
kelurahanFiles.forEach(file => {
  const data = loadJSON(path.join(kelurahanDir, file));
  kelurahanData = { ...kelurahanData, ...data };
});
// kelurahanData: {"1101010001": "LATIUNG", ...}

// 5. Build nested structure
const provinces = {};
for (const provId in provinsiData) {
  provinces[provId] = {
    name: provinsiData[provId],
    cities: {}
  };
}
for (const kabId in kabupatenData) {
  const provId = kabId.slice(0, 2); // 2 digit kode provinsi
  if (!provinces[provId]) continue;
  provinces[provId].cities[kabId] = {
    name: kabupatenData[kabId],
    districts: {}
  };
}
for (const kecId in kecamatanData) {
  const kabId = kecId.slice(0, 4); // 4 digit kode kabupaten/kota
  const provId = kecId.slice(0, 2);
  if (!provinces[provId] || !provinces[provId].cities[kabId]) continue;
  provinces[provId].cities[kabId].districts[kecId] = {
    name: kecamatanData[kecId],
    subdistricts: []
  };
}
for (const kelId in kelurahanData) {
  const kecId = kelId.slice(0, 7); // 7 digit kode kecamatan
  const kabId = kelId.slice(0, 4);
  const provId = kelId.slice(0, 2);
  if (
    provinces[provId] &&
    provinces[provId].cities[kabId] &&
    provinces[provId].cities[kabId].districts[kecId]
  ) {
    provinces[provId].cities[kabId].districts[kecId].subdistricts.push(kelurahanData[kelId]);
  }
}

const result = { provinces };
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log('addressData.json berhasil dibuat!');
