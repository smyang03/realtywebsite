const axios = require('axios');

const LIST_BASE = 'https://apis.data.go.kr/1613000/AptListService3';
const DETAIL_BASE = 'https://apis.data.go.kr/1613000/AptBasisInfoServiceV4';

const SIDO_LIST = [
  { sidoCode: '11', sidoName: '서울특별시' },
  { sidoCode: '26', sidoName: '부산광역시' },
  { sidoCode: '27', sidoName: '대구광역시' },
  { sidoCode: '28', sidoName: '인천광역시' },
  { sidoCode: '29', sidoName: '광주광역시' },
  { sidoCode: '30', sidoName: '대전광역시' },
  { sidoCode: '31', sidoName: '울산광역시' },
  { sidoCode: '36', sidoName: '세종특별자치시' },
  { sidoCode: '41', sidoName: '경기도' },
  { sidoCode: '42', sidoName: '강원특별자치도' },
  { sidoCode: '43', sidoName: '충청북도' },
  { sidoCode: '44', sidoName: '충청남도' },
  { sidoCode: '45', sidoName: '전북특별자치도' },
  { sidoCode: '46', sidoName: '전라남도' },
  { sidoCode: '47', sidoName: '경상북도' },
  { sidoCode: '48', sidoName: '경상남도' },
  { sidoCode: '50', sidoName: '제주특별자치도' },
];

const SIGUNGU_CACHE = {};

const SIGUNGU_MAP_UNUSED = {
  '11': [
    { sigunguCode: '11010', sigunguName: '종로구' },
    { sigunguCode: '11020', sigunguName: '중구' },
    { sigunguCode: '11030', sigunguName: '용산구' },
    { sigunguCode: '11040', sigunguName: '성동구' },
    { sigunguCode: '11050', sigunguName: '광진구' },
    { sigunguCode: '11060', sigunguName: '동대문구' },
    { sigunguCode: '11070', sigunguName: '중랑구' },
    { sigunguCode: '11080', sigunguName: '성북구' },
    { sigunguCode: '11090', sigunguName: '강북구' },
    { sigunguCode: '11100', sigunguName: '도봉구' },
    { sigunguCode: '11110', sigunguName: '노원구' },
    { sigunguCode: '11120', sigunguName: '은평구' },
    { sigunguCode: '11130', sigunguName: '서대문구' },
    { sigunguCode: '11140', sigunguName: '마포구' },
    { sigunguCode: '11150', sigunguName: '양천구' },
    { sigunguCode: '11160', sigunguName: '강서구' },
    { sigunguCode: '11170', sigunguName: '구로구' },
    { sigunguCode: '11180', sigunguName: '금천구' },
    { sigunguCode: '11190', sigunguName: '영등포구' },
    { sigunguCode: '11200', sigunguName: '동작구' },
    { sigunguCode: '11210', sigunguName: '관악구' },
    { sigunguCode: '11220', sigunguName: '서초구' },
    { sigunguCode: '11230', sigunguName: '강남구' },
    { sigunguCode: '11240', sigunguName: '송파구' },
    { sigunguCode: '11250', sigunguName: '강동구' },
  ],
  '26': [
    { sigunguCode: '26010', sigunguName: '중구' },
    { sigunguCode: '26020', sigunguName: '서구' },
    { sigunguCode: '26030', sigunguName: '동구' },
    { sigunguCode: '26040', sigunguName: '영도구' },
    { sigunguCode: '26050', sigunguName: '부산진구' },
    { sigunguCode: '26060', sigunguName: '동래구' },
    { sigunguCode: '26070', sigunguName: '남구' },
    { sigunguCode: '26080', sigunguName: '북구' },
    { sigunguCode: '26090', sigunguName: '해운대구' },
    { sigunguCode: '26100', sigunguName: '사하구' },
    { sigunguCode: '26110', sigunguName: '금정구' },
    { sigunguCode: '26120', sigunguName: '강서구' },
    { sigunguCode: '26130', sigunguName: '연제구' },
    { sigunguCode: '26140', sigunguName: '수영구' },
    { sigunguCode: '26150', sigunguName: '사상구' },
    { sigunguCode: '26710', sigunguName: '기장군' },
  ],
  '27': [
    { sigunguCode: '27010', sigunguName: '중구' },
    { sigunguCode: '27020', sigunguName: '동구' },
    { sigunguCode: '27030', sigunguName: '서구' },
    { sigunguCode: '27040', sigunguName: '남구' },
    { sigunguCode: '27050', sigunguName: '북구' },
    { sigunguCode: '27060', sigunguName: '수성구' },
    { sigunguCode: '27070', sigunguName: '달서구' },
    { sigunguCode: '27710', sigunguName: '달성군' },
    { sigunguCode: '27720', sigunguName: '군위군' },
  ],
  '28': [
    { sigunguCode: '28010', sigunguName: '중구' },
    { sigunguCode: '28020', sigunguName: '동구' },
    { sigunguCode: '28030', sigunguName: '미추홀구' },
    { sigunguCode: '28040', sigunguName: '연수구' },
    { sigunguCode: '28050', sigunguName: '남동구' },
    { sigunguCode: '28060', sigunguName: '부평구' },
    { sigunguCode: '28070', sigunguName: '계양구' },
    { sigunguCode: '28080', sigunguName: '서구' },
    { sigunguCode: '28710', sigunguName: '강화군' },
    { sigunguCode: '28720', sigunguName: '옹진군' },
  ],
  '29': [
    { sigunguCode: '29010', sigunguName: '동구' },
    { sigunguCode: '29020', sigunguName: '서구' },
    { sigunguCode: '29030', sigunguName: '남구' },
    { sigunguCode: '29040', sigunguName: '북구' },
    { sigunguCode: '29050', sigunguName: '광산구' },
  ],
  '30': [
    { sigunguCode: '30010', sigunguName: '동구' },
    { sigunguCode: '30020', sigunguName: '중구' },
    { sigunguCode: '30030', sigunguName: '서구' },
    { sigunguCode: '30040', sigunguName: '유성구' },
    { sigunguCode: '30050', sigunguName: '대덕구' },
  ],
  '31': [
    { sigunguCode: '31010', sigunguName: '중구' },
    { sigunguCode: '31020', sigunguName: '남구' },
    { sigunguCode: '31030', sigunguName: '동구' },
    { sigunguCode: '31040', sigunguName: '북구' },
    { sigunguCode: '31710', sigunguName: '울주군' },
  ],
  '36': [
    { sigunguCode: '36010', sigunguName: '세종시' },
  ],
  '41': [
    { sigunguCode: '41111', sigunguName: '수원시 장안구' },
    { sigunguCode: '41113', sigunguName: '수원시 권선구' },
    { sigunguCode: '41115', sigunguName: '수원시 팔달구' },
    { sigunguCode: '41117', sigunguName: '수원시 영통구' },
    { sigunguCode: '41131', sigunguName: '성남시 수정구' },
    { sigunguCode: '41133', sigunguName: '성남시 중원구' },
    { sigunguCode: '41135', sigunguName: '성남시 분당구' },
    { sigunguCode: '41150', sigunguName: '의정부시' },
    { sigunguCode: '41171', sigunguName: '안양시 만안구' },
    { sigunguCode: '41173', sigunguName: '안양시 동안구' },
    { sigunguCode: '41190', sigunguName: '부천시' },
    { sigunguCode: '41210', sigunguName: '광명시' },
    { sigunguCode: '41220', sigunguName: '평택시' },
    { sigunguCode: '41250', sigunguName: '동두천시' },
    { sigunguCode: '41271', sigunguName: '안산시 상록구' },
    { sigunguCode: '41273', sigunguName: '안산시 단원구' },
    { sigunguCode: '41281', sigunguName: '고양시 덕양구' },
    { sigunguCode: '41285', sigunguName: '고양시 일산동구' },
    { sigunguCode: '41287', sigunguName: '고양시 일산서구' },
    { sigunguCode: '41290', sigunguName: '과천시' },
    { sigunguCode: '41310', sigunguName: '구리시' },
    { sigunguCode: '41360', sigunguName: '남양주시' },
    { sigunguCode: '41370', sigunguName: '오산시' },
    { sigunguCode: '41390', sigunguName: '시흥시' },
    { sigunguCode: '41410', sigunguName: '군포시' },
    { sigunguCode: '41430', sigunguName: '의왕시' },
    { sigunguCode: '41450', sigunguName: '하남시' },
    { sigunguCode: '41461', sigunguName: '용인시 처인구' },
    { sigunguCode: '41463', sigunguName: '용인시 기흥구' },
    { sigunguCode: '41465', sigunguName: '용인시 수지구' },
    { sigunguCode: '41480', sigunguName: '파주시' },
    { sigunguCode: '41500', sigunguName: '이천시' },
    { sigunguCode: '41550', sigunguName: '안성시' },
    { sigunguCode: '41570', sigunguName: '김포시' },
    { sigunguCode: '41590', sigunguName: '화성시' },
    { sigunguCode: '41610', sigunguName: '광주시' },
    { sigunguCode: '41630', sigunguName: '양주시' },
    { sigunguCode: '41650', sigunguName: '포천시' },
    { sigunguCode: '41670', sigunguName: '여주시' },
    { sigunguCode: '41800', sigunguName: '연천군' },
    { sigunguCode: '41820', sigunguName: '가평군' },
    { sigunguCode: '41830', sigunguName: '양평군' },
  ],
  '42': [
    { sigunguCode: '42110', sigunguName: '춘천시' },
    { sigunguCode: '42130', sigunguName: '원주시' },
    { sigunguCode: '42150', sigunguName: '강릉시' },
    { sigunguCode: '42170', sigunguName: '동해시' },
    { sigunguCode: '42190', sigunguName: '태백시' },
    { sigunguCode: '42210', sigunguName: '속초시' },
    { sigunguCode: '42230', sigunguName: '삼척시' },
    { sigunguCode: '42720', sigunguName: '홍천군' },
    { sigunguCode: '42730', sigunguName: '횡성군' },
    { sigunguCode: '42750', sigunguName: '영월군' },
    { sigunguCode: '42760', sigunguName: '평창군' },
    { sigunguCode: '42770', sigunguName: '정선군' },
    { sigunguCode: '42780', sigunguName: '철원군' },
    { sigunguCode: '42790', sigunguName: '화천군' },
    { sigunguCode: '42800', sigunguName: '양구군' },
    { sigunguCode: '42810', sigunguName: '인제군' },
    { sigunguCode: '42820', sigunguName: '고성군' },
    { sigunguCode: '42830', sigunguName: '양양군' },
  ],
  '43': [
    { sigunguCode: '43111', sigunguName: '청주시 상당구' },
    { sigunguCode: '43112', sigunguName: '청주시 서원구' },
    { sigunguCode: '43113', sigunguName: '청주시 흥덕구' },
    { sigunguCode: '43114', sigunguName: '청주시 청원구' },
    { sigunguCode: '43130', sigunguName: '충주시' },
    { sigunguCode: '43150', sigunguName: '제천시' },
    { sigunguCode: '43720', sigunguName: '보은군' },
    { sigunguCode: '43730', sigunguName: '옥천군' },
    { sigunguCode: '43740', sigunguName: '영동군' },
    { sigunguCode: '43745', sigunguName: '증평군' },
    { sigunguCode: '43750', sigunguName: '진천군' },
    { sigunguCode: '43760', sigunguName: '괴산군' },
    { sigunguCode: '43770', sigunguName: '음성군' },
    { sigunguCode: '43800', sigunguName: '단양군' },
  ],
  '44': [
    { sigunguCode: '44131', sigunguName: '천안시 동남구' },
    { sigunguCode: '44133', sigunguName: '천안시 서북구' },
    { sigunguCode: '44150', sigunguName: '공주시' },
    { sigunguCode: '44180', sigunguName: '보령시' },
    { sigunguCode: '44200', sigunguName: '아산시' },
    { sigunguCode: '44210', sigunguName: '서산시' },
    { sigunguCode: '44230', sigunguName: '논산시' },
    { sigunguCode: '44250', sigunguName: '계룡시' },
    { sigunguCode: '44270', sigunguName: '당진시' },
    { sigunguCode: '44710', sigunguName: '금산군' },
    { sigunguCode: '44760', sigunguName: '부여군' },
    { sigunguCode: '44770', sigunguName: '서천군' },
    { sigunguCode: '44790', sigunguName: '청양군' },
    { sigunguCode: '44800', sigunguName: '홍성군' },
    { sigunguCode: '44810', sigunguName: '예산군' },
    { sigunguCode: '44825', sigunguName: '태안군' },
  ],
  '45': [
    { sigunguCode: '45111', sigunguName: '전주시 완산구' },
    { sigunguCode: '45113', sigunguName: '전주시 덕진구' },
    { sigunguCode: '45130', sigunguName: '군산시' },
    { sigunguCode: '45140', sigunguName: '익산시' },
    { sigunguCode: '45180', sigunguName: '정읍시' },
    { sigunguCode: '45190', sigunguName: '남원시' },
    { sigunguCode: '45210', sigunguName: '김제시' },
    { sigunguCode: '45710', sigunguName: '완주군' },
    { sigunguCode: '45720', sigunguName: '진안군' },
    { sigunguCode: '45730', sigunguName: '무주군' },
    { sigunguCode: '45740', sigunguName: '장수군' },
    { sigunguCode: '45750', sigunguName: '임실군' },
    { sigunguCode: '45770', sigunguName: '순창군' },
    { sigunguCode: '45790', sigunguName: '고창군' },
    { sigunguCode: '45800', sigunguName: '부안군' },
  ],
  '46': [
    { sigunguCode: '46110', sigunguName: '목포시' },
    { sigunguCode: '46130', sigunguName: '여수시' },
    { sigunguCode: '46150', sigunguName: '순천시' },
    { sigunguCode: '46170', sigunguName: '나주시' },
    { sigunguCode: '46230', sigunguName: '광양시' },
    { sigunguCode: '46710', sigunguName: '담양군' },
    { sigunguCode: '46720', sigunguName: '곡성군' },
    { sigunguCode: '46730', sigunguName: '구례군' },
    { sigunguCode: '46770', sigunguName: '고흥군' },
    { sigunguCode: '46780', sigunguName: '보성군' },
    { sigunguCode: '46790', sigunguName: '화순군' },
    { sigunguCode: '46800', sigunguName: '장흥군' },
    { sigunguCode: '46810', sigunguName: '강진군' },
    { sigunguCode: '46820', sigunguName: '해남군' },
    { sigunguCode: '46830', sigunguName: '영암군' },
    { sigunguCode: '46840', sigunguName: '무안군' },
    { sigunguCode: '46860', sigunguName: '함평군' },
    { sigunguCode: '46870', sigunguName: '영광군' },
    { sigunguCode: '46880', sigunguName: '장성군' },
    { sigunguCode: '46900', sigunguName: '완도군' },
    { sigunguCode: '46910', sigunguName: '진도군' },
    { sigunguCode: '46920', sigunguName: '신안군' },
  ],
  '47': [
    { sigunguCode: '47111', sigunguName: '포항시 남구' },
    { sigunguCode: '47113', sigunguName: '포항시 북구' },
    { sigunguCode: '47130', sigunguName: '경주시' },
    { sigunguCode: '47150', sigunguName: '김천시' },
    { sigunguCode: '47170', sigunguName: '안동시' },
    { sigunguCode: '47190', sigunguName: '구미시' },
    { sigunguCode: '47210', sigunguName: '영주시' },
    { sigunguCode: '47230', sigunguName: '영천시' },
    { sigunguCode: '47250', sigunguName: '상주시' },
    { sigunguCode: '47280', sigunguName: '문경시' },
    { sigunguCode: '47290', sigunguName: '경산시' },
    { sigunguCode: '47730', sigunguName: '의성군' },
    { sigunguCode: '47740', sigunguName: '청송군' },
    { sigunguCode: '47750', sigunguName: '영양군' },
    { sigunguCode: '47760', sigunguName: '영덕군' },
    { sigunguCode: '47770', sigunguName: '청도군' },
    { sigunguCode: '47780', sigunguName: '고령군' },
    { sigunguCode: '47790', sigunguName: '성주군' },
    { sigunguCode: '47800', sigunguName: '칠곡군' },
    { sigunguCode: '47820', sigunguName: '예천군' },
    { sigunguCode: '47830', sigunguName: '봉화군' },
    { sigunguCode: '47840', sigunguName: '울진군' },
    { sigunguCode: '47850', sigunguName: '울릉군' },
  ],
  '48': [
    { sigunguCode: '48121', sigunguName: '창원시 의창구' },
    { sigunguCode: '48123', sigunguName: '창원시 성산구' },
    { sigunguCode: '48125', sigunguName: '창원시 마산합포구' },
    { sigunguCode: '48127', sigunguName: '창원시 마산회원구' },
    { sigunguCode: '48129', sigunguName: '창원시 진해구' },
    { sigunguCode: '48170', sigunguName: '진주시' },
    { sigunguCode: '48220', sigunguName: '통영시' },
    { sigunguCode: '48240', sigunguName: '사천시' },
    { sigunguCode: '48250', sigunguName: '김해시' },
    { sigunguCode: '48270', sigunguName: '밀양시' },
    { sigunguCode: '48310', sigunguName: '거제시' },
    { sigunguCode: '48330', sigunguName: '양산시' },
    { sigunguCode: '48720', sigunguName: '의령군' },
    { sigunguCode: '48730', sigunguName: '함안군' },
    { sigunguCode: '48740', sigunguName: '창녕군' },
    { sigunguCode: '48820', sigunguName: '고성군' },
    { sigunguCode: '48840', sigunguName: '남해군' },
    { sigunguCode: '48850', sigunguName: '하동군' },
    { sigunguCode: '48860', sigunguName: '산청군' },
    { sigunguCode: '48870', sigunguName: '함양군' },
    { sigunguCode: '48880', sigunguName: '거창군' },
    { sigunguCode: '48890', sigunguName: '합천군' },
  ],
  '50': [
    { sigunguCode: '50110', sigunguName: '제주시' },
    { sigunguCode: '50130', sigunguName: '서귀포시' },
  ],
};

function getSidoList() {
  return SIDO_LIST;
}

async function getSigunguList(sidoCode) {
  if (SIGUNGU_CACHE[sidoCode]) return SIGUNGU_CACHE[sidoCode];

  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    numOfRows: 9999,
    pageNo: 1,
    sidoCode
  };
  const res = await axios.get(`${LIST_BASE}/getSidoAptList3`, { params });
  const raw = res.data?.response?.body?.items || [];
  const items = Array.isArray(raw) ? raw : [raw];

  const map = new Map();
  items.forEach(item => {
    if (item.as2 && item.bjdCode) {
      const code = String(item.bjdCode).substring(0, 5);
      if (!map.has(item.as2)) map.set(item.as2, { sigunguCode: code, sigunguName: item.as2 });
    }
  });

  const result = Array.from(map.values()).sort((a, b) => a.sigunguName.localeCompare(b.sigunguName));
  SIGUNGU_CACHE[sidoCode] = result;
  return result;
}

async function getAptList(sigunguCode, pageNo = 1, numOfRows = 20) {
  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    numOfRows,
    pageNo,
    sigunguCode
  };
  const res = await axios.get(`${LIST_BASE}/getSigunguAptList3`, { params });
  const body = res.data?.response?.body;
  const raw = body?.items || [];
  const items = Array.isArray(raw) ? raw : [raw];
  return {
    items,
    totalCount: body?.totalCount || 0,
    pageNo: body?.pageNo || 1,
    numOfRows: body?.numOfRows || numOfRows
  };
}

async function getAptDetail(kaptCode) {
  const params = {
    serviceKey: process.env.PUBLIC_DATA_API_KEY,
    _type: 'json',
    kaptCode
  };
  const res = await axios.get(`${DETAIL_BASE}/getAphusBassInfoV4`, { params });
  return res.data?.response?.body?.item || null;
}

module.exports = { getSidoList, getSigunguList, getAptList, getAptDetail };
