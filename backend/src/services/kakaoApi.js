const axios = require('axios');

const KAKAO_API_BASE = 'https://dapi.kakao.com/v2/local';

const headers = () => ({
  Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
});

/**
 * 주소 → 좌표 변환
 */
async function addressToCoords(address) {
  const res = await axios.get(`${KAKAO_API_BASE}/search/address.json`, {
    headers: headers(),
    params: { query: address, analyze_type: 'similar' }
  });
  const docs = res.data?.documents;
  if (!docs || docs.length === 0) return null;
  const doc = docs[0];
  return {
    lat: parseFloat(doc.y),
    lng: parseFloat(doc.x),
    address: doc.address_name,
    roadAddress: doc.road_address?.address_name || null
  };
}

/**
 * 키워드 검색 (아파트명)
 */
async function searchByKeyword(keyword, x, y, radius = 5000) {
  const params = {
    query: keyword,
    category_group_code: 'AT4', // 아파트
    x, y, radius,
    size: 15,
    sort: 'distance'
  };
  const res = await axios.get(`${KAKAO_API_BASE}/search/keyword.json`, {
    headers: headers(),
    params
  });
  return res.data?.documents || [];
}

/**
 * 좌표 → 주소 변환 (역지오코딩)
 */
async function coordsToAddress(lat, lng) {
  const res = await axios.get(`${KAKAO_API_BASE}/geo/coord2address.json`, {
    headers: headers(),
    params: { x: lng, y: lat }
  });
  const docs = res.data?.documents;
  if (!docs || docs.length === 0) return null;
  return {
    address: docs[0]?.address?.address_name || null,
    roadAddress: docs[0]?.road_address?.address_name || null,
    sigungu: docs[0]?.address?.region_2depth_name || null,
    sido: docs[0]?.address?.region_1depth_name || null
  };
}

module.exports = { addressToCoords, searchByKeyword, coordsToAddress };
