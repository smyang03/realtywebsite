/**
 * 아파트 상세 정보 패널 컴포넌트
 */
const DetailPanel = (() => {
  function show(kaptCode) {
    const panel = document.getElementById('detailPanel');
    const content = document.getElementById('detailContent');
    const nameEl = document.getElementById('detailName');

    panel.classList.remove('hidden');
    nameEl.textContent = '불러오는 중...';
    content.innerHTML = `<div class="detail-loading"><div class="spinner"></div> 데이터 조회 중...</div>`;

    api.getAptDetail(kaptCode)
      .then(res => {
        if (!res.success || !res.data) throw new Error('데이터 없음');
        render(res.data);
      })
      .catch(err => {
        nameEl.textContent = '오류';
        content.innerHTML = `<div class="detail-loading">상세 정보를 불러올 수 없습니다.<br/>${err.message}</div>`;
      });
  }

  function render(data) {
    const nameEl = document.getElementById('detailName');
    const content = document.getElementById('detailContent');

    nameEl.textContent = data.kaptName || '아파트';

    const addr = data.kaptAddr || '-';
    const roadAddr = data.kaptAddrRoad || data.coords?.roadAddress || '-';
    const households = data.kaptHhldCnt;
    const dongCnt = data.kaptDongCnt;
    const usedate = data.kaptUsedate;
    const totalFloor = data.kaptTotFlrCnt;
    const parkTotal = data.kaptTotParCnt;
    const mgmt = data.kaptMgmtInCd ? getMgmtType(data.kaptMgmtInCd) : null;
    const heat = data.kaptHeatingType || null;

    content.innerHTML = `
      <div class="detail-section">
        <div class="detail-section-title">위치 정보</div>
        <div class="detail-grid">
          <div class="detail-item full">
            <div class="detail-item-label">도로명 주소</div>
            <div class="detail-item-value small">${roadAddr}</div>
          </div>
          <div class="detail-item full">
            <div class="detail-item-label">지번 주소</div>
            <div class="detail-item-value small">${addr}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-section-title">단지 현황</div>
        <div class="detail-grid">
          ${households ? `
          <div class="detail-item">
            <div class="detail-item-label">세대수</div>
            <div class="detail-item-value">${helpers.formatNumber(households)}세대</div>
          </div>` : ''}
          ${dongCnt ? `
          <div class="detail-item">
            <div class="detail-item-label">동수</div>
            <div class="detail-item-value">${helpers.formatNumber(dongCnt)}동</div>
          </div>` : ''}
          ${usedate ? `
          <div class="detail-item">
            <div class="detail-item-label">사용 승인일</div>
            <div class="detail-item-value">${helpers.formatDate(usedate)}</div>
          </div>` : ''}
          ${totalFloor ? `
          <div class="detail-item">
            <div class="detail-item-label">최고 층수</div>
            <div class="detail-item-value">${totalFloor}층</div>
          </div>` : ''}
          ${parkTotal ? `
          <div class="detail-item">
            <div class="detail-item-label">총 주차대수</div>
            <div class="detail-item-value">${helpers.formatNumber(parkTotal)}대</div>
          </div>` : ''}
          ${mgmt ? `
          <div class="detail-item">
            <div class="detail-item-label">관리 형태</div>
            <div class="detail-item-value small">${mgmt}</div>
          </div>` : ''}
          ${heat ? `
          <div class="detail-item">
            <div class="detail-item-label">난방 방식</div>
            <div class="detail-item-value small">${heat}</div>
          </div>` : ''}
        </div>
      </div>

      ${data.coords ? `
      <div class="detail-section">
        <div class="detail-section-title">좌표 정보</div>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-item-label">위도</div>
            <div class="detail-item-value small">${data.coords.lat?.toFixed(6)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-item-label">경도</div>
            <div class="detail-item-value small">${data.coords.lng?.toFixed(6)}</div>
          </div>
        </div>
      </div>` : ''}

      <div style="margin-top:16px">
        <div class="detail-section-title" style="margin-bottom:6px">단지 코드</div>
        <div style="font-size:11px;color:#9CA3AF;font-family:monospace">${data.kaptCode || '-'}</div>
      </div>
    `;
  }

  function getMgmtType(code) {
    const types = { '1': '자치관리', '2': '위탁관리', '3': '혼합관리' };
    return types[String(code)] || `코드 ${code}`;
  }

  function hide() {
    document.getElementById('detailPanel').classList.add('hidden');
  }

  return { show, hide };
})();

window.DetailPanel = DetailPanel;
