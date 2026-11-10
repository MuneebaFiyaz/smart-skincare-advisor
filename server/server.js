require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const productsRouter = require('./routes/products');
const recommendRouter = require('./routes/recommend');
const compatibilityRouter = require('./routes/compatibility');
const chatbotRouter = require('./routes/chatbot');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const adminRouter = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

// This tells the server to look in the main folder (one level up from 'server') for your files
const rootDir = path.join(__dirname, '..');

// Block direct access to backend source code and dependencies before serving static files.
app.use((req, res, next) => {
  if (req.path.startsWith('/server') || req.path.startsWith('/node_modules')) {
    return res.status(404).end();
  }
  next();
});

// Serve all static files (HTML, CSS, JS, Images) from the root folder.
app.use(express.static(rootDir));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/products', productsRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/compatibility', compatibilityRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Smart Skincare Advisor server running at http://localhost:${PORT}`);
  });
});
