// routes/auth.js - Route untuk autentikasi

const express = require('express');
const router = express.Router();

// Route registrasi
router.post('/register', async (req, res) => {
  try {
    const { body, validationResult } = req.bodyValidator;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, phone, password } = req.body;

    // Cek apakah email sudah terdaftar
    const [existingUser] = await req.db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await req.bcrypt.hash(password, 12);

    // Simpan pengguna baru
    const [result] = await req.db.execute(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone, 'applicant']
    );

    // Ambil data pengguna yang baru dibuat (tanpa password)
    const [newUsers] = await req.db.execute(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    const newUser = newUsers[0];

    // Buat token
    const token = req.jwt.sign({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      issuer: 'spm-batam',
      audience: 'spmb-users'
    });

    res.status(201).json({
      message: 'Akun berhasil dibuat',
      user: newUser,
      token: token
    });
  } catch (error) {
    console.error('Error saat registrasi:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
});

// Route login
router.post('/login', async (req, res) => {
  try {
    const { body, validationResult } = req.bodyValidator;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Cek apakah pengguna ada
    const [users] = await req.db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = users[0];

    // Verifikasi password
    const isPasswordValid = await req.bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    // Buat token
    const token = req.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      issuer: 'spm-batam',
      audience: 'spmb-users'
    });

    // Kembalikan data pengguna (tanpa password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login berhasil',
      user: userWithoutPassword,
      token: token
    });
  } catch (error) {
    console.error('Error saat login:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
});

module.exports = router;