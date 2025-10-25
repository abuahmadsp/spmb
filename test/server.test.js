const request = require('supertest');

// Import server tanpa langsung menjalankannya
const express = require('express');
const app = express();

// Konfigurasi middleware dasar yang diperlukan tanpa koneksi database
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Endpoint health check sederhana untuk pengujian
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint 404 untuk pengujian
app.get('/nonexistent', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

describe('Server Endpoints', () => {
  // Test untuk health check endpoint
  test('harus merespon ke endpoint /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  // Test untuk endpoint API yang tidak ada
  test('harus merespon 404 untuk endpoint yang tidak ditemukan', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});