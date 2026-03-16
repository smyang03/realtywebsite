/**
 * 집봄 API 클라이언트
 * 백엔드: http://localhost:3001
 */
const API_BASE = 'http://localhost:3001/api';

const api = {
  async _fetch(path, params = {}) {
    const url = new URL(`${API_BASE}${path}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  // 지역
  getSidoList: () => api._fetch('/apartments/sido'),
  getSigunguList: (sidoCode) => api._fetch(`/apartments/sigungu/${sidoCode}`),

  // 단지
  getAptList: (sigunguCode, pageNo = 1, numOfRows = 20) =>
    api._fetch('/apartments/list', { sigunguCode, pageNo, numOfRows }),
  getAptMapData: (sigunguCode, pageNo = 1, numOfRows = 30) =>
    api._fetch('/apartments/map', { sigunguCode, pageNo, numOfRows }),
  getAptDetail: (kaptCode) => api._fetch(`/apartments/detail/${kaptCode}`),

  // 지오코딩
  geocode: (query) => api._fetch('/geocode/address', { query }),
  reverseGeocode: (lat, lng) => api._fetch('/geocode/coords', { lat, lng }),
  searchKeyword: (keyword, lat, lng, radius) =>
    api._fetch('/geocode/search', { keyword, lat, lng, radius }),
};

window.api = api;
