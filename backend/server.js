const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/boardings', require('./routes/boardingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Root Route (Health Check)
app.get('/', (req, res) => {
  res.json({ message: 'SMRP Nestora Backend API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
