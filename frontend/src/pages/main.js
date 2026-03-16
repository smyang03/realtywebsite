/**
 * 집봄 메인 페이지 - 앱 진입점
 */
const App = (() => {
  function init() {
    // 카카오 지도 초기화
    if (typeof kakao === 'undefined' || !kakao.maps) {
      document.getElementById('kakaoMap').innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;
          flex-direction:column;gap:12px;color:#6B7280;font-size:14px;text-align:center;padding:20px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="#D1D5DB" stroke-width="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <strong style="color:#374151">카카오 지도를 불러올 수 없습니다</strong>
          <span>index.html의 카카오 JavaScript 앱 키를 확인해주세요.<br/>
          <code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:12px">YOUR_KAKAO_JS_APP_KEY</code>를 실제 키로 교체하세요.</span>
        </div>`;
      return;
    }

    MapComponent.init();
    Sidebar.initRegionSelects();

    // 검색
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const doSearch = helpers.debounce(async () => {
      const q = searchInput.value.trim();
      if (!q) return;
      await MapComponent.moveToAddress(q);
    }, 400);

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

    // 내 위치 버튼
    document.getElementById('locationBtn').addEventListener('click', () => {
      MapComponent.moveToCurrentLocation();
    });

    // 상세 패널 닫기
    document.getElementById('detailClose').addEventListener('click', () => {
      DetailPanel.hide();
    });
  }

  function showDetail(kaptCode) {
    if (!kaptCode) return;
    DetailPanel.show(kaptCode);
  }

  // DOM 준비 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { showDetail };
})();

window.App = App;
