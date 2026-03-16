const express = require('express');
const router = express.Router();
const { getSidoList, getSigunguList, getAptList, getAptDetail } = require('../services/publicDataApi');
const { addressToCoords, searchByKeyword } = require('../services/kakaoApi');

// 시도 목록 (정적 데이터)
router.get('/sido', (req, res) => {
  res.json({ success: true, data: getSidoList() });
});

// 시군구 목록 (API에서 동적 조회, 캐시됨)
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
    const address = detail.doroJuso || detail.kaptAddr;
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

    // 시군구 중심 좌표 먼저 획득 (첫 번째 아이템 기준)
    const firstItem = result.items[0];
    const regionAddr = firstItem ? [firstItem.as1, firstItem.as2].filter(Boolean).join(' ') : null;
    const regionCenter = regionAddr ? await addressToCoords(regionAddr).catch(() => null) : null;

    // 병렬 좌표 변환 - 아파트명으로 키워드 검색
    const itemsWithCoords = await Promise.all(
      result.items.map(async (item) => {
        let coords = null;
        if (item.kaptName && regionCenter) {
          const cleanName = item.kaptName.replace(/[&+#]/g, ' ').replace(/\s+/g, ' ').trim();
          const keyword = `${item.as2 || ''} ${cleanName}`.trim();
          const results = await searchByKeyword(keyword, regionCenter.lng, regionCenter.lat, 30000).catch(() => []);
          if (results.length > 0) {
            coords = { lat: parseFloat(results[0].y), lng: parseFloat(results[0].x) };
          }
        }
        // fallback: 동 주소로 geocode
        if (!coords) {
          const address = [item.as1, item.as2, item.as3].filter(Boolean).join(' ');
          if (address) coords = await addressToCoords(address).catch(() => null);
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
