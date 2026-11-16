// ==============================================================
// KONFIGURASI APLIKASI SAS
// ==============================================================

// 1. MASUKKAN URL WEB APP GOOGLE APPS SCRIPT ANDA DI SINI
// Pastikan diakhiri dengan /exec
window.API_URL = 'https://script.google.com/macros/s/AKfycb.../exec'; 

// 2. DETEKSI OTOMATIS URL GITHUB PAGES
// Jika di-host di github.io/nama-repo/, BASE_URL akan menjadi /nama-repo/
// Jika di-host di domain utama (Netlify/Vercel), BASE_URL akan menjadi /
window.BASE_URL = window.location.hostname.includes('github.io') 
  ? '/' + window.location.pathname.split('/')[1] + '/'
  : '/';

// 3. HELPER UNTUK REQUEST GET (Ambil Data)
window.api = async function (action, params = {}) {
  const token = localStorage.getItem('sas_token') || '';
  
  // Susun URL Parameter
  const q = new URLSearchParams();
  q.set('action', action);
  if (token) q.set('token', token);
  
  // Tambahkan parameter lain jika ada
  Object.keys(params).forEach(k => {
    if (typeof params[k] === 'object') {
      q.set(k, JSON.stringify(params[k]));
    } else {
      q.set(k, params[k]);
    }
  });

  const url = window.API_URL + '?' + q.toString();
  
  try {
    // Gunakan mode cors dan redirect follow untuk Google Apps Script
    const r = await fetch(url, { 
      method: 'GET', 
      redirect: 'follow' 
    });
    
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { error: 'Respon bukan JSON. Cek URL Apps Script.', raw: text.substring(0, 100) };
    }
  } catch (e) {
    return { error: 'Gagal terhubung ke server: ' + e.message };
  }
};

// 4. HELPER UNTUK REQUEST POST (Kirim Data Besar / Login)
window.apiPost = async function (action, body = {}) {
  const token = localStorage.getItem('sas_token') || '';
  
  try {
    const r = await fetch(window.API_URL, {
      method: 'POST',
      redirect: 'follow',
      // PENTING: Google Apps Script tidak mendukung application/json, 
      // harus menggunakan text/plain agar tidak terkena blokir CORS
      headers: { 
        'Content-Type': 'text/plain;charset=utf-8' 
      },
      body: JSON.stringify({ action, token, ...body })
    });
    
    const text = await r.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { error: 'Respon bukan JSON. Cek URL Apps Script.', raw: text.substring(0, 100) };
    }
  } catch (e) {
    return { error: 'Gagal terhubung ke server: ' + e.message };
  }
};

// 5. HELPER UNTUK LOGOUT
window.doLogout = async function() {
  await api('logout');
  localStorage.removeItem('sas_token');
  localStorage.removeItem('sas_user');
  window.location.href = window.BASE_URL;
};

// 6. HELPER UNTUK CEK LOGIN DI SETIAP HALAMAN
window.cekLogin = async function(roleYangDiizinkan = []) {
  const user = JSON.parse(localStorage.getItem('sas_user') || 'null');
  if (!user) {
    window.location.href = window.BASE_URL;
    return null;
  }
  if (roleYangDiizinkan.length > 0 && !roleYangDiizinkan.includes(user.role)) {
    alert('Anda tidak memiliki akses ke halaman ini.');
    window.location.href = window.BASE_URL;
    return null;
  }
  return user;
};
