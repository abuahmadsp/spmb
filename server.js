// server.js - Server utama untuk SPMB Al Kahfi Batam

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const winston = require('winston');

const { initializeDatabase } = require('./database');

// Import route handlers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const applicantRoutes = require('./routes/applicants');
const paymentRoutes = require('./routes/payments');
const downloadRoutes = require('./routes/downloads');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk logging permintaan
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'spmb-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security.log', level: 'warn' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get('User-Agent') });
  next();
});

// Middleware untuk parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi CORS yang lebih ketat
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware untuk security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting untuk mencegah brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per windowMs
  message: 'Terlalu banyak permintaan dari IP ini, coba lagi nanti'
});

app.use(limiter);

// Sanitasi input untuk mencegah MongoDB operator injection
app.use(mongoSanitize());

// Clean data from malicious XSS
app.use(xss());

// Konfigurasi upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const maxSize = 5 * 1024 * 1024; // 5MB
const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxSize
  },
  fileFilter: (req, file, cb) => {
    // Hanya izinkan tipe file tertentu
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Tipe file tidak diizinkan. Hanya menerima jpeg, png, dan pdf'), false);
    }
  }
});

// Middleware untuk security headers
app.use((req, res, next) => {
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Tambahkan security headers tambahan untuk produksi
  if (process.env.NODE_ENV === 'production') {
    res.header('X-Download-Options', 'noopen');
    res.header('X-Permitted-Cross-Domain-Policies', 'none');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }
  
  next();
});

// Hanya gunakan trust proxy di lingkungan produksi
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true');
}

// Route untuk static files (uploads) dengan caching untuk produksi
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 // Cache 1 hari di produksi
}));

// Serve build frontend statis di produksi
if (process.env.NODE_ENV === 'production') {
  // Serve file statis dari folder build dengan caching
  app.use(express.static(path.join(__dirname, 'build'), {
    maxAge: '1d', // Cache 1 hari untuk file statis di browser
    etag: true // Aktifkan ETag untuk mengurangi bandwidth
  }));
  
  // Route fallback untuk SPA (hanya di produksi)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // Di lingkungan development, masih menggunakan build dari Vite dev server
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Route fallback untuk SPA (jika menggunakan React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Koneksi ke database
let db;
initializeDatabase()
  .then(database => {
    db = database;
    
    // Tambahkan database ke context request
    app.use((req, res, next) => {
      req.db = db;
      req.jwt = jwt;
      req.bcrypt = bcrypt;
      req.bodyValidator = { body, validationResult };
      req.upload = upload;
      next();
    });
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/applicants', applicantRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/downloads', downloadRoutes);
    
    // Route untuk health check
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    // Route untuk serving frontend (jika menggunakan build static)
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // Route fallback untuk SPA (jika menggunakan React Router)
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error('Server Error:', err);
      res.status(500).json({ 
        error: 'Terjadi kesalahan server', 
        message: process.env.NODE_ENV === 'development' ? err.message : undefined 
      });
    });
    
    const server = app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
      console.log(`Database SQLite siap diakses`);
    });

    module.exports = app;
    module.exports.server = server; // Tambahkan ini untuk keperluan testing
  })
  .catch(err => {
    console.error('Gagal memulai server:', err);
    process.exit(1);
  });

module.exports = app;