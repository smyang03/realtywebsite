# 집봄 🏠
아파트 지도 검색 플랫폼 - 카카오 지도 + 공공데이터 API

## 빠른 시작

### 1. API 키 설정
```bash
# backend/.env 파일 수정
PUBLIC_DATA_API_KEY=실제_공공데이터_API_키
KAKAO_REST_API_KEY=실제_카카오_REST_API_키

# frontend/index.html 수정
# YOUR_KAKAO_JS_APP_KEY → 실제 카카오 JavaScript 앱 키
```

### 2. 의존성 설치 및 실행
```bash
npm run setup        # 백엔드 패키지 설치
npm run dev          # 백엔드(3001) + 프론트엔드(3000) 동시 실행
```

### 개별 실행
```bash
npm run dev:backend   # 백엔드만 (http://localhost:3001)
npm run dev:frontend  # 프론트엔드만 (http://localhost:3000)
```

## 구조
```
├── frontend/
│   ├── index.html
│   └── src/
│       ├── styles/main.css
│       ├── utils/api.js         # API 클라이언트
│       ├── utils/helpers.js     # 유틸 함수
│       ├── components/
│       │   ├── map.js           # 카카오 지도
│       │   ├── sidebar.js       # 지역 선택 + 목록
│       │   └── detail.js        # 아파트 상세
│       └── pages/main.js        # 앱 진입점
└── backend/
    ├── .env                     # API 키 (git 제외)
    └── src/
        ├── index.js             # Express 서버
        ├── routes/
        │   ├── apartments.js    # 아파트 API
        │   └── geocode.js       # 지오코딩 API
        └── services/
            ├── publicDataApi.js # 공공데이터 API
            └── kakaoApi.js      # 카카오 API
```

## API 엔드포인트 (백엔드)
| 경로 | 설명 |
|------|------|
| GET /api/apartments/sido | 시도 목록 |
| GET /api/apartments/sigungu/:sidoCode | 시군구 목록 |
| GET /api/apartments/list?sigunguCode= | 단지 목록 |
| GET /api/apartments/map?sigunguCode= | 지도용 단지+좌표 |
| GET /api/apartments/detail/:kaptCode | 단지 상세 |
| GET /api/geocode/address?query= | 주소→좌표 |
| GET /api/geocode/coords?lat=&lng= | 좌표→주소 |
| GET /api/geocode/search?keyword= | 키워드 검색 |
