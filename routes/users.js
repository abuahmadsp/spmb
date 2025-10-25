// routes/users.js - Route untuk manajemen pengguna

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

// Route untuk mendapatkan profil pengguna
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await req.db.execute(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    const user = users[0];
    res.json({ user });
  } catch (error) {
    console.error('Error saat mengambil profil:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil profil' });
  }
});

// Route untuk memperbarui profil pengguna
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validasi input
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nama dan nomor telepon wajib diisi' });
    }

    // Perbarui profil pengguna
    await req.db.execute(
      'UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, phone, req.user.id]
    );

    // Ambil data pengguna yang diperbarui
    const [updatedUsers] = await req.db.execute(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const updatedUser = updatedUsers[0];
    res.json({
      message: 'Profil berhasil diperbarui',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error saat memperbarui profil:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil' });
  }
});

// Route untuk mendapatkan semua pengguna (hanya untuk admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Hanya admin yang bisa mengakses
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat mengakses.' });
    }

    const [users] = await req.db.execute(
      'SELECT id, email, name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users });
  } catch (error) {
    console.error('Error saat mengambil daftar pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil daftar pengguna' });
  }
});

// Route untuk menghapus pengguna (hanya untuk admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Hanya admin yang bisa menghapus pengguna
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang dapat menghapus pengguna.' });
    }

    const userId = req.params.id;

    // Hapus dari tabel users
    const [result] = await req.db.execute('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Error saat menghapus pengguna:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus pengguna' });
  }
});

module.exports = router;