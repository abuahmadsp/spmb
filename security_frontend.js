/**
 * Panduan Keamanan Frontend untuk Website SPMB Al Kahfi Batam
 * 
 * File ini berisi panduan keamanan untuk komponen-komponen React
 */

// 1. Cross-Site Scripting (XSS) Prevention
// Pastikan untuk tidak menggunakan dangerouslySetInnerHTML kecuali benar-benar diperlukan
// Gunakan sanitasi konten sebelum menampilkannya

// Contoh aman untuk menampilkan konten dari pengguna:
const SafeDisplay = ({ content }) => {
  // Tidak menggunakan dangerouslySetInnerHTML
  return <div>{content}</div>;
};

// Jika harus menggunakan HTML dari pengguna, gunakan library sanitasi
import DOMPurify from 'dompurify';

const SanitizedDisplay = ({ htmlContent }) => {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};

// 2. Input Validation di Frontend
// Validasi input sebelum dikirim ke backend
const validateFormInput = (formData) => {
  const errors = {};
  
  // Validasi email
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Format email tidak valid';
  }
  
  // Validasi password
  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password minimal 8 karakter';
  }
  
  // Validasi nomor telepon
  if (!formData.phone || !/^\d{10,14}$/.test(formData.phone.replace(/\D/g, ''))) {
    errors.phone = 'Nomor telepon tidak valid';
  }
  
  return errors;
};

// 3. Secure API Calls
// Gunakan HTTPS dan set header yang aman
const makeSecureAPICall = async (url, options = {}) => {
  // Pastikan URL menggunakan HTTPS di production
  const isSecureUrl = url.startsWith('https://') || 
                     process.env.NODE_ENV === 'development';
  
  if (!isSecureUrl) {
    throw new Error('Tidak dapat melakukan permintaan ke URL yang tidak aman');
  }
  
  // Tambahkan header keamanan
  const secureOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      // Jika menggunakan JWT, tambahkan di sini
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      // Anti-CSRF token jika diperlukan
      'X-CSRF-Token': localStorage.getItem('csrfToken')
    }
  };
  
  return fetch(url, secureOptions);
};

// 4. Secure Local Storage
// Jangan menyimpan data sensitif di localStorage
// Gunakan httpOnly cookies untuk token autentikasi jika memungkinkan

// Fungsi aman untuk menyimpan data di localStorage
const secureLocalStorage = {
  setItem: (key, value) => {
    try {
      // Tambahkan enkripsi sederhana jika perlu
      const encryptedValue = btoa(encodeURIComponent(JSON.stringify(value)));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Gagal menyimpan ke localStorage:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(decodeURIComponent(atob(item)));
      }
      return null;
    } catch (error) {
      console.error('Gagal membaca dari localStorage:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Gagal menghapus dari localStorage:', error);
    }
  }
};

// 5. Secure Form Handling
// Gunakan CSRF protection jika menggunakan form tradisional
const handleSecureFormSubmit = async (formData, endpoint) => {
  // Validasi input
  const validationErrors = validateFormInput(formData);
  if (Object.keys(validationErrors).length > 0) {
    throw new Error('Validasi input gagal');
  }
  
  // Sanitasi data sebelum dikirim
  const sanitizedData = {
    ...formData,
    // Hapus atau sanitasi field yang tidak diinginkan
    description: DOMPurify.sanitize(formData.description || '')
  };
  
  return makeSecureAPICall(endpoint, {
    method: 'POST',
    body: JSON.stringify(sanitizedData)
  });
};

// 6. Secure Routing
// Pastikan routing tidak mengizinkan akses tidak sah
const SecureRoute = ({ component: Component, isAuthenticated, ...rest }) => {
  return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
};

// 7. Image Upload Security
// Validasi file sebelum upload (hanya frontend validation, backend validation tetap diperlukan)
const validateImageUpload = (file) => {
  // Cek tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipe file tidak diizinkan' };
  }
  
  // Cek ukuran file (misalnya max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'File terlalu besar (maksimal 5MB)' };
  }
  
  return { valid: true };
};

// 8. Error Handling
// Jangan tampilkan error detail ke pengguna
const handleSecureError = (error, context = '') => {
  // Log error secara internal
  console.error(`[${context}] Error:`, error);
  
  // Return pesan umum ke pengguna
  if (error.response?.status >= 500) {
    return 'Terjadi kesalahan server. Silakan coba lagi nanti.';
  } else if (error.response?.status >= 400) {
    return 'Permintaan tidak valid. Silakan periksa kembali data yang dimasukkan.';
  } else {
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }
};

// 9. Content Security Policy (CSP)
// Definisikan kebijakan CSP di HTML atau server
// Contoh CSP meta tag di index.html:
/*
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com; font-src 'self' https://fonts.gstatic.com;">
*/

// 10. Dependency Security
// Gunakan lock files (package-lock.json) dan periksa kerentanan
// npm audit untuk memeriksa dependensi bermasalah

export {
  validateFormInput,
  makeSecureAPICall,
  secureLocalStorage,
  handleSecureFormSubmit,
  validateImageUpload,
  handleSecureError,
  SafeDisplay,
  SanitizedDisplay
};