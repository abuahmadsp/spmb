// routes/payments.js - Route untuk manajemen pembayaran

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

// Route untuk membuat pembayaran baru
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Gunakan upload dari req
    await new Promise((resolve, reject) => {
      req.upload.single('proof_of_payment')(req, res, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    const { applicant_id, payment_type, amount, payment_method, transaction_id } = req.body;

    // Validasi input
    if (!applicant_id || !payment_type || !amount || !payment_method) {
      return res.status(400).json({ error: 'Semua field wajib diisi: applicant_id, payment_type, amount, payment_method' });
    }

    // Validasi tipe pembayaran
    const validPaymentTypes = ['registration_fee', 'tuition_fee'];
    if (!validPaymentTypes.includes(payment_type)) {
      return res.status(400).json({ error: 'Tipe pembayaran tidak valid' });
    }

    // Validasi metode pembayaran
    const validPaymentMethods = ['bank_transfer', 'cash'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ error: 'Metode pembayaran tidak valid' });
    }

    // Cek apakah pendaftar ada dan milik pengguna ini
    const [applicants] = await req.db.execute(
      'SELECT id, user_id FROM applicants WHERE id = ?',
      [applicant_id]
    );

    if (applicants.length === 0) {
      return res.status(404).json({ error: 'Pendaftaran tidak ditemukan' });
    }

    const applicant = applicants[0];

    // Hanya pemilik pendaftaran atau admin yang bisa membuat pembayaran
    if (applicant.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    // Siapkan path untuk bukti pembayaran jika ada
    let proofOfPaymentPath = null;
    if (req.file) {
      proofOfPaymentPath = `/uploads/${req.file.filename}`;
    }

    // Buat pembayaran baru
    const [result] = await req.db.execute(
      `INSERT INTO payments (
        applicant_id, payment_type, amount, payment_method, transaction_id, 
        proof_of_payment_path
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [applicant_id, payment_type, amount, payment_method, transaction_id || null, proofOfPaymentPath]
    );

    // Ambil data pembayaran yang baru dibuat
    const [newPayments] = await req.db.execute(
      'SELECT * FROM payments WHERE id = ?',
      [result.insertId]
    );

    const newPayment = newPayments[0];

    res.status(201).json({
      message: 'Pembayaran berhasil dibuat',
      payment: newPayment
    });
  } catch (error) {
    console.error('Error saat membuat pembayaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat membuat pembayaran' });
  }
});

// Route untuk mendapatkan semua pembayaran
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Hanya admin yang bisa melihat semua pembayaran
    if (req.user.role === 'admin') {
      const [payments] = await req.db.execute(`
        SELECT p.*, a.id as applicant_id, a.user_id, u.name as applicant_name, 
               c.name as campus_name, s.name as school_name
        FROM payments p
        JOIN applicants a ON p.applicant_id = a.id
        JOIN users u ON a.user_id = u.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        ORDER BY p.created_at DESC
      `);

      res.json({ payments });
    } 
    // School admin hanya bisa melihat pembayaran untuk kampus mereka
    else if (req.user.role === 'school_admin') {
      const [schoolAdmins] = await req.db.execute(
        'SELECT campus_id FROM school_admins WHERE user_id = ?',
        [req.user.id]
      );

      if (schoolAdmins.length === 0) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki kampus.' });
      }

      const schoolAdmin = schoolAdmins[0];
      const [payments] = await req.db.execute(`
        SELECT p.*, a.id as applicant_id, a.user_id, u.name as applicant_name
        FROM payments p
        JOIN applicants a ON p.applicant_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE a.campus_id = ?
        ORDER BY p.created_at DESC
      `, [schoolAdmin.campus_id]);

      res.json({ payments });
    } 
    // Pengguna biasa hanya bisa melihat pembayarannya sendiri
    else {
      const [payments] = await req.db.execute(`
        SELECT p.*, a.id as applicant_id, c.name as campus_name, s.name as school_name
        FROM payments p
        JOIN applicants a ON p.applicant_id = a.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE a.user_id = ?
        ORDER BY p.created_at DESC
      `, [req.user.id]);

      res.json({ payments });
    }
  } catch (error) {
    console.error('Error saat mengambil pembayaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil pembayaran' });
  }
});

// Route untuk mendapatkan pembayaran berdasarkan ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id;

    // Hanya admin yang bisa melihat semua pembayaran
    if (req.user.role === 'admin') {
      const [payments] = await req.db.execute(`
        SELECT p.*, a.id as applicant_id, a.user_id, u.name as applicant_name, 
               c.name as campus_name, s.name as school_name
        FROM payments p
        JOIN applicants a ON p.applicant_id = a.id
        JOIN users u ON a.user_id = u.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE p.id = ?
      `, [paymentId]);

      if (payments.length === 0) {
        return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
      }

      const payment = payments[0];
      res.json({ payment });
    } 
    // School admin hanya bisa melihat pembayaran untuk kampus mereka
    else if (req.user.role === 'school_admin') {
      const [schoolAdmins] = await req.db.execute(
        'SELECT campus_id FROM school_admins WHERE user_id = ?',
        [req.user.id]
      );

      if (schoolAdmins.length === 0) {
        return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki kampus.' });
      }

      const schoolAdmin = schoolAdmins[0];
      const [payments] = await req.db.execute(`
        SELECT p.*, a.id as applicant_id, a.user_id, u.name as applicant_name
        FROM payments p
        JOIN applicants a ON p.applicant_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE p.id = ? AND a.campus_id = ?
      `, [paymentId, schoolAdmin.campus_id]);

      if (payments.length === 0) {
        return res.status(404).json({ error: 'Pembayaran tidak ditemukan atau bukan milik kampus Anda' });
      }

      const payment = payments[0];
      res.json({ payment });
    } 
    // Pengguna biasa hanya bisa melihat pembayarannya sendiri
    else {
      const [payments] = await req.db.execute(`
        SELECT p.*, a.id as applicant_id, c.name as campus_name, s.name as school_name
        FROM payments p
        JOIN applicants a ON p.applicant_id = a.id
        JOIN campuses c ON a.campus_id = c.id
        JOIN schools s ON a.school_id = s.id
        WHERE p.id = ? AND a.user_id = ?
      `, [paymentId, req.user.id]);

      if (payments.length === 0) {
        return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
      }

      const payment = payments[0];
      res.json({ payment });
    }
  } catch (error) {
    console.error('Error saat mengambil detail pembayaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil detail pembayaran' });
  }
});

// Route untuk memperbarui status pembayaran (hanya untuk admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { payment_status } = req.body;

    // Validasi status pembayaran
    const validStatuses = ['pending', 'paid', 'cancelled'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Status pembayaran tidak valid' });
    }

    // Hanya admin yang bisa mengubah status pembayaran
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengubah status pembayaran.' });
    }

    // Perbarui status pembayaran
    await req.db.execute(
      'UPDATE payments SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [payment_status, paymentId]
    );

    res.json({ message: 'Status pembayaran berhasil diperbarui' });
  } catch (error) {
    console.error('Error saat memperbarui status pembayaran:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui status pembayaran' });
  }
});

// Route untuk mendapatkan informasi rekening sekolah
router.get('/accounts/:campus_id', authenticateToken, async (req, res) => {
  try {
    const campusId = req.params.campus_id;

    // Ambil informasi rekening berdasarkan kampus
    const [accounts] = await req.db.execute(
      'SELECT bank_name, account_number, account_name FROM school_accounts WHERE campus_id = ? AND is_active = 1',
      [campusId]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Informasi rekening tidak ditemukan untuk kampus ini' });
    }

    const account = accounts[0];
    res.json({ account });
  } catch (error) {
    console.error('Error saat mengambil informasi rekening:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil informasi rekening' });
  }
});

module.exports = router;