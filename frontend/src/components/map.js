/**
 * 카카오 지도 컴포넌트
 */
const MapComponent = (() => {
  let map = null;
  let clusterer = null;
  let markers = [];
  let infoWindow = null;
  let activeMarkerData = null;

  // 서울 시청 기본 좌표
  const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };
  const DEFAULT_LEVEL = 6;

  function init() {
    const container = document.getElementById('kakaoMap');
    const options = {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: DEFAULT_LEVEL
    };
    map = new kakao.maps.Map(container, options);

    // 마커 클러스터러
    clusterer = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 5,
      disableClickZoom: false,
      styles: [{
        width: '44px', height: '44px',
        background: 'rgba(37,99,235,.85)',
        borderRadius: '50%', color: '#fff',
        textAlign: 'center', lineHeight: '44px',
        fontWeight: '700', fontSize: '14px',
        boxShadow: '0 2px 8px rgba(37,99,235,.4)'
      }]
    });

    // 인포윈도우
    infoWindow = new kakao.maps.InfoWindow({ zIndex: 1, removable: true });

    // 지도 클릭 시 인포윈도우 닫기
    kakao.maps.event.addListener(map, 'click', () => {
      infoWindow.close();
      activeMarkerData = null;
    });

    _bindControls();
    return map;
  }

  function _bindControls() {
    document.getElementById('zoomInBtn').addEventListener('click', () => {
      map.setLevel(map.getLevel() - 1);
    });
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
      map.setLevel(map.getLevel() + 1);
    });
    document.getElementById('resetViewBtn').addEventListener('click', () => {
      map.setCenter(new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
      map.setLevel(DEFAULT_LEVEL);
    });

    // 지도 타입 전환
    document.querySelectorAll('.map-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.map-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.type;
        map.setMapTypeId(
          type === 'skyview' ? kakao.maps.MapTypeId.HYBRID : kakao.maps.MapTypeId.ROADMAP
        );
      });
    });
  }

  /**
   * 아파트 목록으로 마커 렌더링
   */
  function renderMarkers(aptList, onMarkerClick) {
    clearMarkers();

    const newMarkers = [];
    aptList.forEach(apt => {
      if (!apt.coords) return;
      const { lat, lng } = apt.coords;

      const position = new kakao.maps.LatLng(lat, lng);
      const marker = new kakao.maps.Marker({ position });

      kakao.maps.event.addListener(marker, 'click', () => {
        _showInfoWindow(marker, apt);
        if (onMarkerClick) onMarkerClick(apt);
      });

      newMarkers.push(marker);
      markers.push({ marker, apt });
    });

    clusterer.addMarkers(newMarkers);

    // 마커가 있으면 지도 범위 조정
    if (newMarkers.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      markers.forEach(({ marker }) => bounds.extend(marker.getPosition()));
      map.setBounds(bounds, 60);
    }
  }

  function _showInfoWindow(marker, apt) {
    const name = apt.kaptName || apt.단지명 || '아파트';
    const addr = apt.kaptAddr || apt.도로명주소 || apt.coords?.roadAddress || '';
    const households = apt.kaptHhldCnt || apt.세대수 || '';

    const content = `
      <div class="info-window">
        <div class="info-window-name">${name}</div>
        <div class="info-window-addr">${addr}</div>
        ${households ? `<div style="font-size:11px;color:#6B7280;margin-bottom:8px">세대수: ${helpers.formatNumber(households)}세대</div>` : ''}
        <button class="info-window-btn" onclick="window.App.showDetail('${apt.kaptCode || ''}')">상세 정보 보기</button>
      </div>
    `;
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
    activeMarkerData = apt;
  }

  function clearMarkers() {
    clusterer.clear();
    markers = [];
    infoWindow.close();
    activeMarkerData = null;
  }

  /**
   * 특정 아파트로 이동 및 인포윈도우 표시
   */
  function focusApt(apt) {
    if (!apt.coords) return;
    const pos = new kakao.maps.LatLng(apt.coords.lat, apt.coords.lng);
    map.setCenter(pos);
    map.setLevel(3);

    const found = markers.find(m => {
      const p = m.marker.getPosition();
      return Math.abs(p.getLat() - apt.coords.lat) < 0.0001 &&
             Math.abs(p.getLng() - apt.coords.lng) < 0.0001;
    });
    if (found) {
      _showInfoWindow(found.marker, apt);
    }
  }

  /**
   * 주소 검색 후 지도 이동
   */
  async function moveToAddress(query) {
    try {
      const result = await api.geocode(query);
      if (result.success && result.data) {
        const pos = new kakao.maps.LatLng(result.data.lat, result.data.lng);
        map.setCenter(pos);
        map.setLevel(4);
      }
    } catch (e) {
      helpers.showToast('주소를 찾을 수 없습니다.', 'error');
    }
  }

  /**
   * 현재 위치로 이동
   */
  function moveToCurrentLocation() {
    if (!navigator.geolocation) {
      helpers.showToast('위치 서비스를 지원하지 않는 브라우저입니다.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        map.setCenter(new kakao.maps.LatLng(latitude, longitude));
        map.setLevel(4);
        helpers.showToast('현재 위치로 이동했습니다.', 'success');
      },
      () => helpers.showToast('위치 정보를 가져올 수 없습니다.', 'error')
    );
  }

  function showLoading(show) {
    document.getElementById('mapLoading').classList.toggle('hidden', !show);
  }

  return { init, renderMarkers, clearMarkers, focusApt, moveToAddress, moveToCurrentLocation, showLoading };
})();

window.MapComponent = MapComponent;
