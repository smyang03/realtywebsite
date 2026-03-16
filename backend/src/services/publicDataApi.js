const axios = require('axios');

const BASE_URL = 'https://apis.data.go.kr/1613000/AptListService2';

/**
 * 시도 목록 조회
 */
async function getSidoList() {
  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    numOfRows: 100,
    pageNo: 1
  };
  const res = await axios.get(`${BASE_URL}/getSidoList`, { params });
  return res.data?.response?.body?.items?.item || [];
}

/**
 * 시군구 목록 조회
 */
async function getSigunguList(sidoCode) {
  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    numOfRows: 100,
    pageNo: 1,
    sidoCode
  };
  const res = await axios.get(`${BASE_URL}/getSigunguList`, { params });
  return res.data?.response?.body?.items?.item || [];
}

/**
 * 단지 목록 조회 (시군구 코드 기반)
 */
async function getAptList(sigunguCode, pageNo = 1, numOfRows = 20) {
  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    numOfRows,
    pageNo,
    sigunguCode
  };
  const res = await axios.get(`${BASE_URL}/getAptList`, { params });
  const body = res.data?.response?.body;
  return {
    items: body?.items?.item || [],
    totalCount: body?.totalCount || 0,
    pageNo: body?.pageNo || 1,
    numOfRows: body?.numOfRows || numOfRows
  };
}

/**
 * 단지 기본 정보 조회
 */
async function getAptDetail(kaptCode) {
  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    kaptCode
  };
  const res = await axios.get(`${BASE_URL}/getAptBassInfo`, { params });
  return res.data?.response?.body?.item || null;
}

module.exports = { getSidoList, getSigunguList, getAptList, getAptDetail };
