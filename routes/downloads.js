// routes/downloads.js - Route untuk download data dalam format Excel dan PDF

const express = require('express');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createObjectCsvWriter } = require('csv-writer');
const router = express.Router();

// Middleware untuk autentikasi
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Tidak ada token.' });
  }

  try {
    const decoded = req.jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'spm-batam',
      audience: 'spmb-users'
    });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token tidak valid.' });
  }
};

// Fungsi untuk membuat direktori jika belum ada
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Route untuk download data dalam format Excel atau PDF
router.get('/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params; // applicants, students, payments, quotas
    const { format = 'excel', campus_id } = req.query; // format: excel atau pdf

    // Validasi tipe data
    const validTypes = ['applicants', 'students', 'payments', 'quotas'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipe data tidak valid' });
    }

    // Validasi format
    const validFormats = ['excel', 'pdf'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: 'Format tidak valid. Gunakan excel atau pdf' });
    }

    // Cek peran pengguna
    if (req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengunduh data.' });
    }

    // Jika school admin, pastikan hanya bisa mengunduh data untuk kampusnya sendiri
    let userCampusId = null;
    if (req.user.role === 'school_admin') {
      const [schoolAdmins] = await req.db.execute(
        'SELECT campus_id FROM school_admins WHERE user_id = ?',
        [req.user.id]
      );

      if (schoolAdmins.length === 0) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki kampus.' });
      }

      userCampusId = schoolAdmins[0].campus_id;
      
      // Jika campus_id dari query params, pastikan cocok dengan kampus pengguna
      if (campus_id && campus_id !== userCampusId) {
        return res.status(403).json({ error: 'Akses ditolak. Anda hanya bisa mengunduh data dari kampus Anda.' });
      }
    }

    // Tentukan kampus yang akan diunduh
    const targetCampusId = campus_id || userCampusId;

    // Ambil data sesuai tipe
    let data = [];
    let fileName = '';
    let fileTitle = '';

    switch (type) {
      case 'applicants':
        fileTitle = 'Data Pendaftar';
        fileName = `data_pendaftar_${new Date().toISOString().slice(0, 10)}`;
        
        if (req.user.role === 'admin' && !targetCampusId) {
          // Admin bisa mengunduh semua pendaftar
          const [applicants] = await req.db.execute(`
            SELECT a.id, a.user_id, a.campus_id, a.school_id, a.tk_class, 
                   a.verification_status, a.created_at, 
                   u.name as applicant_name, u.email, u.phone,
                   c.name as campus_name, s.name as school_name
            FROM applicants a
            JOIN users u ON a.user_id = u.id
            JOIN campuses c ON a.campus_id = c.id
            JOIN schools s ON a.school_id = s.id
            ORDER BY a.created_at DESC
          `);
          data = applicants;
        } else {
          // School admin atau filter kampus tertentu
          const [applicants] = await req.db.execute(`
            SELECT a.id, a.user_id, a.campus_id, a.school_id, a.tk_class, 
                   a.verification_status, a.created_at, 
                   u.name as applicant_name, u.email, u.phone,
                   c.name as campus_name, s.name as school_name
            FROM applicants a
            JOIN users u ON a.user_id = u.id
            JOIN campuses c ON a.campus_id = c.id
            JOIN schools s ON a.school_id = s.id
            WHERE a.campus_id = ?
            ORDER BY a.created_at DESC
          `, [targetCampusId]);
          data = applicants;
        }
        break;

      case 'students':
        fileTitle = 'Data Murid';
        fileName = `data_murid_${new Date().toISOString().slice(0, 10)}`;
        
        if (req.user.role === 'admin' && !targetCampusId) {
          // Admin bisa mengunduh semua murid
          const [students] = await req.db.execute(`
            SELECT sd.*, a.id as applicant_id, u.name as applicant_name,
                   c.name as campus_name, s.name as school_name
            FROM student_data sd
            JOIN applicants a ON sd.applicant_id = a.id
            JOIN users u ON a.user_id = u.id
            JOIN campuses c ON a.campus_id = c.id
            JOIN schools s ON a.school_id = s.id
            ORDER BY sd.created_at DESC
          `);
          data = students;
        } else {
          // School admin atau filter kampus tertentu
          const [students] = await req.db.execute(`
            SELECT sd.*, a.id as applicant_id, u.name as applicant_name,
                   c.name as campus_name, s.name as school_name
            FROM student_data sd
            JOIN applicants a ON sd.applicant_id = a.id
            JOIN users u ON a.user_id = u.id
            JOIN campuses c ON a.campus_id = c.id
            JOIN schools s ON a.school_id = s.id
            WHERE a.campus_id = ?
            ORDER BY sd.created_at DESC
          `, [targetCampusId]);
          data = students;
        }
        break;

      case 'payments':
        fileTitle = 'Data Pembayaran';
        fileName = `data_pembayaran_${new Date().toISOString().slice(0, 10)}`;
        
        if (req.user.role === 'admin' && !targetCampusId) {
          // Admin bisa mengunduh semua pembayaran
          const [payments] = await req.db.execute(`
            SELECT p.*, a.id as applicant_id, u.name as applicant_name,
                   c.name as campus_name, s.name as school_name
            FROM payments p
            JOIN applicants a ON p.applicant_id = a.id
            JOIN users u ON a.user_id = u.id
            JOIN campuses c ON a.campus_id = c.id
            JOIN schools s ON a.school_id = s.id
            ORDER BY p.created_at DESC
          `);
          data = payments;
        } else {
          // School admin atau filter kampus tertentu
          const [payments] = await req.db.execute(`
            SELECT p.*, a.id as applicant_id, u.name as applicant_name,
                   c.name as campus_name, s.name as school_name
            FROM payments p
            JOIN applicants a ON p.applicant_id = a.id
            JOIN users u ON a.user_id = u.id
            JOIN campuses c ON a.campus_id = c.id
            JOIN schools s ON a.school_id = s.id
            WHERE a.campus_id = ?
            ORDER BY p.created_at DESC
          `, [targetCampusId]);
          data = payments;
        }
        break;

      case 'quotas':
        fileTitle = 'Data Kuota';
        fileName = `data_kuota_${new Date().toISOString().slice(0, 10)}`;
        
        if (req.user.role === 'admin' && !targetCampusId) {
          // Admin bisa mengunduh semua kuota
          const [quotas] = await req.db.execute(`
            SELECT q.*, c.name as campus_name, s.name as school_name,
                   (q.max_capacity - q.current_count) as available_slots
            FROM quota q
            JOIN campuses c ON q.campus_id = c.id
            JOIN schools s ON q.school_id = s.id
            ORDER BY c.name, s.name, q.class_type
          `);
          data = quotas;
        } else {
          // School admin atau filter kampus tertentu
          const [quotas] = await req.db.execute(`
            SELECT q.*, c.name as campus_name, s.name as school_name,
                   (q.max_capacity - q.current_count) as available_slots
            FROM quota q
            JOIN campuses c ON q.campus_id = c.id
            JOIN schools s ON q.school_id = s.id
            WHERE q.campus_id = ?
            ORDER BY s.name, q.class_type
          `, [targetCampusId]);
          data = quotas;
        }
        break;

      default:
        return res.status(400).json({ error: 'Tipe data tidak didukung untuk download' });
    }

    // Buat nama file sesuai format
    const fileExtension = format === 'excel' ? '.xlsx' : '.csv'; // Sementara gunakan CSV untuk simulasi PDF
    const filePath = path.join(__dirname, '..', 'downloads', fileName + fileExtension);

    // Pastikan direktori downloads ada
    ensureDirectoryExists(path.join(__dirname, '..', 'downloads'));

    if (format === 'excel') {
      // Buat file Excel
      const ws = xlsx.utils.json_to_sheet(data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, fileTitle);
      xlsx.writeFile(wb, filePath);

      // Tambahkan log download
      await req.db.execute(
        'INSERT INTO download_logs (user_id, download_type, file_format, report_type, download_params) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'excel', 'xlsx', type, JSON.stringify({ campus_id: targetCampusId })]
      );

      // Kirim file ke client
      res.download(filePath, fileName + fileExtension, (err) => {
        if (err) {
          console.error('Error saat mengirim file:', err);
        }
        // Hapus file setelah dikirim
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 10000); // Hapus setelah 10 detik
      });
    } else {
      // Untuk versi sederhana, kita akan membuat file CSV yang dapat dibuka di Excel
      // Di implementasi sebenarnya, Anda mungkin ingin menggunakan library PDF seperti pdfkit
      
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: Object.keys(data[0] || {}).map(key => ({ id: key, title: key.toUpperCase() }))
      });

      await csvWriter.writeRecords(data);

      // Tambahkan log download
      await req.db.execute(
        'INSERT INTO download_logs (user_id, download_type, file_format, report_type, download_params) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'excel', 'csv', type, JSON.stringify({ campus_id: targetCampusId })]
      );

      // Kirim file ke client
      res.download(filePath, fileName + '.csv', (err) => {
        if (err) {
          console.error('Error saat mengirim file:', err);
        }
        // Hapus file setelah dikirim
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 10000); // Hapus setelah 10 detik
      });
    }
  } catch (error) {
    console.error('Error saat download data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengunduh data' });
  }
});

// Route untuk mendapatkan statistik download
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Hanya admin yang bisa melihat statistik
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat melihat statistik.' });
    }

    // Ambil statistik download terbaru
    const [stats] = await req.db.execute(`
      SELECT 
        dl.report_type,
        dl.download_type,
        dl.file_format,
        COUNT(*) as download_count,
        MAX(dl.created_at) as last_download
      FROM download_logs dl
      GROUP BY dl.report_type, dl.download_type, dl.file_format
      ORDER BY dl.report_type, dl.download_type, dl.file_format
    `);

    res.json({ stats });
  } catch (error) {
    console.error('Error saat mengambil statistik download:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil statistik download' });
  }
});

module.exports = router;