import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import botRoutes from './routes/bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Check if client build exists and serve static files
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log('✅ Serving static files from client/dist');
} else {
  console.log('ℹ️ Client build not found, running in development mode');
}

// API Routes
app.use('/api/bot', botRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BotWeaver API is running securely!' });
});

// Serve React app for all other routes (only if dist exists)
if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.json({ 
      message: 'BotWeaver API is running securely!',
      frontend: 'Please access the frontend at http://localhost:5174',
      api: 'API endpoints available at /api/*',
      security: 'Self-hosted and Discord ToS compliant'
    });
  });
}

app.listen(PORT, () => {
  console.log(`🤖 BotWeaver is running securely on http://localhost:${PORT}`);
  console.log(`🛡️ Self-hosted Discord bot builder - Your data stays with you`);
  console.log(`📋 API endpoint: http://localhost:${PORT}/api`);
});
