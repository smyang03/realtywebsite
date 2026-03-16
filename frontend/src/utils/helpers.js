/**
 * 숫자 포맷 (1000 → 1,000)
 */
function formatNumber(n) {
  if (!n && n !== 0) return '-';
  return Number(n).toLocaleString('ko-KR');
}

/**
 * 날짜 포맷 (YYYYMMDD → YYYY.MM.DD)
 */
function formatDate(str) {
  if (!str) return '-';
  const s = String(str);
  if (s.length === 8) return `${s.slice(0,4)}.${s.slice(4,6)}.${s.slice(6,8)}`;
  return str;
}

/**
 * 연도 표시 (YYYYMMDD → YYYY년)
 */
function formatYear(str) {
  if (!str) return '-';
  return `${String(str).slice(0,4)}년`;
}

/**
 * 면적 m² → 평 변환
 */
function sqmToPyeong(sqm) {
  if (!sqm) return null;
  return Math.round(Number(sqm) / 3.305785 * 10) / 10;
}

/**
 * 디바운스
 */
function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * 토스트 메시지
 */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#1F2937'};
    color: white; padding: 10px 20px; border-radius: 24px;
    font-size: 13px; font-weight: 500; z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
    animation: slideUp .2s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// CSS 애니메이션
const style = document.createElement('style');
style.textContent = `@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`;
document.head.appendChild(style);

window.helpers = { formatNumber, formatDate, formatYear, sqmToPyeong, debounce, showToast };
