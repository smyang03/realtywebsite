/**
 * 사이드바 (지역 선택 + 결과 목록) 컴포넌트
 */
const Sidebar = (() => {
  let currentPage = 1;
  let totalCount = 0;
  let currentSigunguCode = null;
  let aptData = [];
  const PAGE_SIZE = 20;

  async function initRegionSelects() {
    const sidoSelect = document.getElementById('sidoSelect');
    const sigunguSelect = document.getElementById('sigunguSelect');
    const loadBtn = document.getElementById('loadAptBtn');

    try {
      const res = await api.getSidoList();
      if (res.success && res.data) {
        const items = Array.isArray(res.data) ? res.data : [res.data];
        items.forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.sidoCode;
          opt.textContent = item.sidoName;
          sidoSelect.appendChild(opt);
        });
      }
    } catch (e) {
      helpers.showToast('시도 목록을 불러올 수 없습니다. API 키를 확인해주세요.', 'error');
    }

    sidoSelect.addEventListener('change', async () => {
      const sidoCode = sidoSelect.value;
      sigunguSelect.innerHTML = '<option value="">시/군/구 선택</option>';
      sigunguSelect.disabled = true;
      loadBtn.disabled = true;

      if (!sidoCode) return;
      try {
        const res = await api.getSigunguList(sidoCode);
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : [res.data];
          items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.sigunguCode;
            opt.textContent = item.sigunguName;
            sigunguSelect.appendChild(opt);
          });
          sigunguSelect.disabled = false;
        }
      } catch (e) {
        helpers.showToast('시군구 목록을 불러올 수 없습니다.', 'error');
      }
    });

    sigunguSelect.addEventListener('change', () => {
      loadBtn.disabled = !sigunguSelect.value;
    });

    loadBtn.addEventListener('click', () => {
      const code = sigunguSelect.value;
      if (code) loadApartments(code, 1);
    });
  }

  async function loadApartments(sigunguCode, page = 1) {
    currentSigunguCode = sigunguCode;
    currentPage = page;
    MapComponent.showLoading(true);
    renderLoading();

    try {
      const res = await api.getAptMapData(sigunguCode, page, PAGE_SIZE);
      if (!res.success) throw new Error(res.error);

      aptData = res.items || [];
      totalCount = res.totalCount || 0;

      document.getElementById('resultCount').textContent =
        `총 ${helpers.formatNumber(totalCount)}개`;

      renderList(aptData);
      MapComponent.renderMarkers(aptData, (apt) => {
        highlightCard(apt.kaptCode);
      });
      renderPagination(totalCount, page);
    } catch (e) {
      helpers.showToast(`데이터를 불러올 수 없습니다: ${e.message}`, 'error');
      document.getElementById('aptList').innerHTML =
        `<div class="empty-state"><span>데이터를 불러오지 못했습니다.<br/>${e.message}</span></div>`;
    } finally {
      MapComponent.showLoading(false);
    }
  }

  function renderList(items) {
    const list = document.getElementById('aptList');
    if (!items || items.length === 0) {
      list.innerHTML = '<div class="empty-state"><span>검색 결과가 없습니다</span></div>';
      return;
    }
    list.innerHTML = items.map(apt => {
      const name = apt.kaptName || apt.단지명 || '아파트';
      const addr = apt.kaptAddr || apt.도로명주소 || '-';
      const households = apt.kaptHhldCnt || apt.세대수 || '';
      const year = apt.kaptUsedate || apt.사용승인일 || '';
      const hasCoords = apt.coords !== null;

      return `
        <div class="apt-card" data-kaptcode="${apt.kaptCode}" onclick="Sidebar.onCardClick('${apt.kaptCode}')">
          <div class="apt-card-name">${name}</div>
          <div class="apt-card-info">
            <div class="apt-card-addr">${addr}</div>
            <div class="apt-card-meta">
              ${households ? `<span class="apt-badge">${helpers.formatNumber(households)}세대</span>` : ''}
              ${year ? `<span class="apt-badge">${helpers.formatYear(year)}</span>` : ''}
              ${hasCoords ? '<span class="apt-badge green">지도 표시</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderLoading() {
    document.getElementById('aptList').innerHTML = `
      <div class="empty-state">
        <div class="spinner" style="width:28px;height:28px;margin-bottom:8px"></div>
        <span>불러오는 중...</span>
      </div>`;
    document.getElementById('resultCount').textContent = '';
    document.getElementById('pagination').innerHTML = '';
  }

  function renderPagination(total, current) {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) {
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    const start = Math.max(1, current - 2);
    const end = Math.min(totalPages, current + 2);
    let html = `
      <button class="page-btn" ${current <= 1 ? 'disabled' : ''}
        onclick="Sidebar.goPage(${current - 1})">‹</button>`;
    for (let i = start; i <= end; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}"
        onclick="Sidebar.goPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${current >= totalPages ? 'disabled' : ''}
      onclick="Sidebar.goPage(${current + 1})">›</button>`;
    document.getElementById('pagination').innerHTML = html;
  }

  function highlightCard(kaptCode) {
    document.querySelectorAll('.apt-card').forEach(c => c.classList.remove('active'));
    const card = document.querySelector(`.apt-card[data-kaptcode="${kaptCode}"]`);
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function onCardClick(kaptCode) {
    highlightCard(kaptCode);
    const apt = aptData.find(a => a.kaptCode === kaptCode);
    if (apt) {
      if (apt.coords) MapComponent.focusApt(apt);
      window.App.showDetail(kaptCode);
    }
  }

  function goPage(page) {
    if (currentSigunguCode) loadApartments(currentSigunguCode, page);
  }

  return { initRegionSelects, loadApartments, highlightCard, onCardClick, goPage };
})();

window.Sidebar = Sidebar;
