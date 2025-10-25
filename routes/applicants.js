// routes/applicants.js - Route untuk manajemen pendaftar

const express = require('express');
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

// Route untuk membuat pendaftaran baru
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { campus_id, school_id, tk_class } = req.body;

    // Validasi input
    if (!campus_id || !school_id) {
      return res.status(400).json({ error: 'Campus ID dan School ID wajib diisi' });
    }

    // Cek apakah kampus dan sekolah valid
    const [campuses] = await req.db.execute('SELECT id FROM campuses WHERE id = ?', [campus_id]);
    if (campuses.length === 0) {
      return res.status(404).json({ error: 'Kampus tidak ditemukan' });
    }

    const [schools] = await req.db.execute('SELECT id FROM schools WHERE id = ?', [school_id]);
    if (schools.length === 0) {
      return res.status(404).json({ error: 'Sekolah tidak ditemukan' });
    }

    // Cek kuota jika jenjang TK dan kelas dipilih
    if (school_id === 'tk' && tk_class) {
      // Dapatkan kuota untuk kelas yang dipilih
      const [quotas] = await req.db.execute(
        'SELECT max_capacity, current_count FROM quota WHERE campus_id = ? AND school_id = ? AND class_type = ?',
        [campus_id, school_id, tk_class]
      );

      if (quotas.length === 0) {
        return res.status(400).json({ error: 'Kelas tidak valid untuk kampus ini' });
      }

      const quota = quotas[0];
      if (quota.current_count >= quota.max_capacity) {
        return res.status(400).json({ error: 'Kuota untuk kelas ini sudah penuh' });
      }
    }

    // Cek apakah pengguna sudah mendaftar ke kampus yang sama
    const [existingApplicants] = await req.db.execute(
      'SELECT id FROM applicants WHERE user_id = ? AND campus_id = ?',
      [req.user.id, campus_id]
    );

    if (existingApplicants.length > 0) {
      return res.status(409).json({ error: 'Anda sudah mendaftar ke kampus ini' });
    }

    // Buat pendaftaran baru
    const [result] = await req.db.execute(
      'INSERT INTO applicants (user_id, campus_id, school_id, tk_class) VALUES (?, ?, ?, ?)',
      [req.user.id, campus_id, school_id, tk_class || null]
    );

    // Ambil informasi pendaftaran yang baru dibuat
    const [newApplicants] = await req.db.execute(
      'SELECT * FROM applicants WHERE id = ?',
      [result.insertId]
    );

    const newApplicant = newApplicants[0];

    // Jika berhasil mendaftar TK, perbarui kuota
    if (school_id === 'tk' && tk_class) {
      await req.db.execute(
        'UPDATE quota SET current_count = current_count + 1 WHERE campus_id = ? AND school_id = ? AND class_type = ?',
        [campus_id, school_id, tk_class]
      );
    }

    // Tambahkan riwayat status
    await req.db.execute(
      'INSERT INTO application_status_history (applicant_id, status, notes) VALUES (?, ?, ?)',
      [result.insertId, 'pending', 'Pendaftaran baru']
    );

    res.status(201).json({
      message: 'Pendaftaran berhasil dibuat',
      applicant: newApplicant
    });
  } catch (error) {
    console.error('Error saat membuat pendaftaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat pendaftaran' });
  }
});

// Route untuk mendapatkan semua pendaftaran pengguna
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Hanya admin atau school admin yang bisa melihat semua pendaftaran
    if (req.user.role === 'admin') {
      // Admin bisa melihat semua pendaftaran
      const [applicants] = await req.db.execute(`
        SELECT a.*, u.name, u.email, u.phone, c.name as campus_name, s.name as school_name
        FROM applicants a
        JOIN users u ON a.user_id = u.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        ORDER BY a.created_at DESC
      `);

      res.json({ applicants });
    } else if (req.user.role === 'school_admin') {
      // School admin hanya bisa melihat pendaftaran untuk kampus mereka
      const [schoolAdmins] = await req.db.execute(
        'SELECT campus_id FROM school_admins WHERE user_id = ?',
        [req.user.id]
      );

      if (schoolAdmins.length === 0) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki kampus.' });
      }

      const schoolAdmin = schoolAdmins[0];
      const [applicants] = await req.db.execute(`
        SELECT a.*, u.name, u.email, u.phone, c.name as campus_name, s.name as school_name
        FROM applicants a
        JOIN users u ON a.user_id = u.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE a.campus_id = ?
        ORDER BY a.created_at DESC
      `, [schoolAdmin.campus_id]);

      res.json({ applicants });
    } else {
      // Pengguna biasa hanya bisa melihat pendaftarannya sendiri
      const [applicants] = await req.db.execute(`
        SELECT a.*, c.name as campus_name, s.name as school_name
        FROM applicants a
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `, [req.user.id]);

      res.json({ applicants });
    }
  } catch (error) {
    console.error('Error saat mengambil pendaftaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil pendaftaran' });
  }
});

// Route untuk mendapatkan detail pendaftaran tertentu
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const applicantId = req.params.id;

    // Admin bisa melihat semua pendaftaran
    if (req.user.role === 'admin') {
      const [applicants] = await req.db.execute(`
        SELECT a.*, u.name, u.email, u.phone, c.name as campus_name, s.name as school_name
        FROM applicants a
        JOIN users u ON a.user_id = u.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE a.id = ?
      `, [applicantId]);

      if (applicants.length === 0) {
        return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
      }

      const applicant = applicants[0];
      res.json({ applicant });
    } 
    // School admin hanya bisa melihat pendaftaran untuk kampus mereka
    else if (req.user.role === 'school_admin') {
      const [schoolAdmins] = await req.db.execute(
        'SELECT campus_id FROM school_admins WHERE user_id = ?',
        [req.user.id]
      );

      if (schoolAdmins.length === 0) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki kampus.' });
      }

      const schoolAdmin = schoolAdmins[0];
      const [applicants] = await req.db.execute(`
        SELECT a.*, u.name, u.email, u.phone, c.name as campus_name, s.name as school_name
        FROM applicants a
        JOIN users u ON a.user_id = u.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE a.id = ? AND a.campus_id = ?
      `, [applicantId, schoolAdmin.campus_id]);

      if (applicants.length === 0) {
        return res.status(404).json({ error: 'Pendaftaran tidak ditemukan atau bukan milik kampus Anda' });
      }

      const applicant = applicants[0];
      res.json({ applicant });
    } 
    // Pengguna biasa hanya bisa melihat pendaftaran mereka sendiri
    else {
      const [applicants] = await req.db.execute(`
        SELECT a.*, c.name as campus_name, s.name as school_name
        FROM applicants a
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE a.id = ? AND a.user_id = ?
      `, [applicantId, req.user.id]);

      if (applicants.length === 0) {
        return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
      }

      const applicant = applicants[0];
      res.json({ applicant });
    }
  } catch (error) {
    console.error('Error saat mengambil detail pendaftaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil detail pendaftaran' });
  }
});

// Route untuk memperbarui status pendaftaran (hanya untuk admin dan school admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const applicantId = req.params.id;
    const { status, notes } = req.body;

    // Validasi status
    const validStatuses = ['pending', 'approved', 'rejected', 'enrolled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }

    // Cek apakah pengguna adalah admin atau school admin
    if (req.user.role !== 'admin' && req.user.role !== 'school_admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengubah status.' });
    }

    // Jika school admin, pastikan hanya bisa mengubah pendaftaran di kampusnya sendiri
    if (req.user.role === 'school_admin') {
      const [schoolAdmins] = await req.db.execute(
        'SELECT campus_id FROM school_admins WHERE user_id = ?',
        [req.user.id]
      );

      if (schoolAdmins.length === 0) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki kampus.' });
      }

      const schoolAdmin = schoolAdmins[0];
      
      // Cek apakah pendaftaran ini milik kampus yang sama
      const [applicants] = await req.db.execute(
        'SELECT campus_id FROM applicants WHERE id = ?',
        [applicantId]
      );

      if (applicants.length === 0 || applicants[0].campus_id !== schoolAdmin.campus_id) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak berwenang mengubah status ini.' });
      }
    }

    // Perbarui status pendaftaran
    await req.db.execute(
      'UPDATE applicants SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, applicantId]
    );

    // Tambahkan ke riwayat status
    await req.db.execute(
      'INSERT INTO application_status_history (applicant_id, status, notes, changed_by) VALUES (?, ?, ?, ?)',
      [applicantId, status, notes || null, req.user.id]
    );

    res.json({ message: 'Status pendaftaran berhasil diperbarui' });
  } catch (error) {
    console.error('Error saat memperbarui status pendaftaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status pendaftaran' });
  }
});

module.exports = router;