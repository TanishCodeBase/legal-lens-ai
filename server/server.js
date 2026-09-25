require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Basic Health Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'LegalLens AI',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  }
});

// Import Routes
const analyzeRoute = require('./routes/analyze');
const askRoute = require('./routes/ask');
const compareRoute = require('./routes/compare');
const consultationRoute = require('./routes/consultation');

// API Routes
app.use('/api/analyze', analyzeRoute(upload));
app.use('/api/ask', askRoute);
app.use('/api/compare', compareRoute);
app.use('/api/consultation', consultationRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Only PDF files are supported.') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_FILE', message: err.message } });
  }
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LegalLens AI server listening on port ${PORT}`);
});
