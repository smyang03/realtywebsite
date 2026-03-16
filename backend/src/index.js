require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const apartmentRoutes = require('./routes/apartments');
const geocodeRoutes = require('./routes/geocode');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
});
app.use('/api', limiter);

app.use('/api/apartments', apartmentRoutes);
app.use('/api/geocode', geocodeRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`집봄 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
