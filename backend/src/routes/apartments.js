const express = require('express');
const router = express.Router();
const { getSidoList, getSigunguList, getAptList, getAptDetail } = require('../services/publicDataApi');
const { addressToCoords } = require('../services/kakaoApi');

// 시도 목록
router.get('/sido', async (req, res) => {
  try {
    const data = await getSidoList();
    res.json({ success: true, data });
  } catch (err) {
    console.error('시도 목록 오류:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 시군구 목록
router.get('/sigungu/:sidoCode', async (req, res) => {
  try {
    const data = await getSigunguList(req.params.sidoCode);
    res.json({ success: true, data });
  } catch (err) {
    console.error('시군구 목록 오류:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 단지 목록 (시군구 코드)
router.get('/list', async (req, res) => {
  const { sigunguCode, pageNo = 1, numOfRows = 20 } = req.query;
  if (!sigunguCode) {
    return res.status(400).json({ success: false, error: 'sigunguCode 필수' });
  }
  try {
    const data = await getAptList(sigunguCode, parseInt(pageNo), parseInt(numOfRows));
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('단지 목록 오류:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 단지 상세 + 좌표 변환
router.get('/detail/:kaptCode', async (req, res) => {
  try {
    const detail = await getAptDetail(req.params.kaptCode);
    if (!detail) {
      return res.status(404).json({ success: false, error: '단지를 찾을 수 없습니다.' });
    }
    // 도로명 주소로 좌표 획득
    const address = detail.kaptAddr || `${detail.sido} ${detail.sigungu} ${detail.bjdCode}`;
    let coords = null;
    if (address) {
      coords = await addressToCoords(address).catch(() => null);
    }
    res.json({ success: true, data: { ...detail, coords } });
  } catch (err) {
    console.error('단지 상세 오류:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 단지 목록 + 좌표 일괄 변환 (지도용)
router.get('/map', async (req, res) => {
  const { sigunguCode, pageNo = 1, numOfRows = 30 } = req.query;
  if (!sigunguCode) {
    return res.status(400).json({ success: false, error: 'sigunguCode 필수' });
  }
  try {
    const result = await getAptList(sigunguCode, parseInt(pageNo), parseInt(numOfRows));
    // 병렬 좌표 변환 (최대 30개)
    const itemsWithCoords = await Promise.all(
      result.items.map(async (item) => {
        const address = item.kaptAddr || item.도로명주소;
        let coords = null;
        if (address) {
          coords = await addressToCoords(address).catch(() => null);
        }
        return { ...item, coords };
      })
    );
    res.json({
      success: true,
      items: itemsWithCoords,
      totalCount: result.totalCount,
      pageNo: result.pageNo
    });
  } catch (err) {
    console.error('지도용 단지 오류:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
