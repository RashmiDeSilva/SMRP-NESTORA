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
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/boardings', require('./routes/boardingRoutes'));

// Root Route (Health Check)
app.get('/', (req, res) => {
  res.json({ message: 'SMRP Nestora Backend API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
