const express = require('express');
const router = express.Router();
const { addressToCoords, coordsToAddress, searchByKeyword } = require('../services/kakaoApi');

// 주소 → 좌표
router.get('/address', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, error: 'query 필수' });
  try {
    const coords = await addressToCoords(query);
    if (!coords) return res.status(404).json({ success: false, error: '주소를 찾을 수 없습니다.' });
    res.json({ success: true, data: coords });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 좌표 → 주소
router.get('/coords', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat, lng 필수' });
  try {
    const address = await coordsToAddress(parseFloat(lat), parseFloat(lng));
    if (!address) return res.status(404).json({ success: false, error: '주소를 찾을 수 없습니다.' });
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 키워드 검색
router.get('/search', async (req, res) => {
  const { keyword, lat, lng, radius = 5000 } = req.query;
  if (!keyword) return res.status(400).json({ success: false, error: 'keyword 필수' });
  try {
    const results = await searchByKeyword(keyword, lng, lat, parseInt(radius));
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
