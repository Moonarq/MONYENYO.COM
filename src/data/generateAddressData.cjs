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
  const match = file.match(/kab-(\d{2,})\.json/);
  if (!match) return;
  const provId = match[1];
  const data = loadJSON(path.join(kabupatenDir, file));
  for (const kabKey in data) {
    // Gabungkan kode provinsi + kode kabupaten/kota, pad dengan 2 digit
    const kabId = provId + kabKey.padStart(2, '0');
    kabupatenData[kabId] = data[kabKey];
  }
});
// kabupatenData: {"1101": "KAB. SIMEULUE", ...}

// 3. Load kecamatan
const kecamatanFiles = fs.readdirSync(kecamatanDir).filter(f => f.endsWith('.json'));
let kecamatanData = {};
kecamatanFiles.forEach(file => {
  // Format file: kec-32-01.json
  const match = file.match(/kec-(\d{2,})-(\d{2,})\.json/);
  if (!match) return;
  const provId = match[1];
  const kabId = match[2].padStart(2, '0');
  const data = loadJSON(path.join(kecamatanDir, file));
  for (const kecKey in data) {
    // Gabungkan kode provinsi + kabupaten + kecamatan, pad kecamatan 3 digit
    const kecId = provId + kabId + kecKey.padStart(3, '0');
    kecamatanData[kecId] = data[kecKey];
  }
});
// kecamatanData: {"3201010": "NANGGUNG", ...}

// 4. Load kelurahan/desa
const kelurahanFiles = fs.readdirSync(kelurahanDir).filter(f => f.endsWith('.json'));
let kelurahanData = {};
kelurahanFiles.forEach(file => {
  // Format file: keldesa-32-01-010.json
  const match = file.match(/keldesa-(\d{2,})-(\d{2,})-(\d{3,})\.json/);
  if (!match) return;
  const provId = match[1];
  const kabId = match[2].padStart(2, '0');
  const kecId = match[3].padStart(3, '0');
  const data = loadJSON(path.join(kelurahanDir, file));
  for (const kelKey in data) {
    // Gabungkan kode provinsi + kabupaten + kecamatan + kelurahan, pad kelurahan 3 digit
    const kelId = provId + kabId + kecId + kelKey.padStart(3, '0');
    kelurahanData[kelId] = data[kelKey];
  }
});
// kelurahanData: {"3201010001": "MALASARI", ...}

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

// Debug: tampilkan jumlah kabupaten/kota per provinsi
console.log('Ringkasan hasil build:');
for (const provId in provinces) {
  const prov = provinces[provId];
  const kabCount = Object.keys(prov.cities).length;
  if (kabCount === 0) {
    console.warn(`Provinsi ${prov.name} (${provId}) TIDAK ADA kabupaten/kota!`);
  } else {
    console.log(`Provinsi ${prov.name} (${provId}): ${kabCount} kabupaten/kota`);
  }
}

const result = { provinces };
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log('addressData.json berhasil dibuat!');
