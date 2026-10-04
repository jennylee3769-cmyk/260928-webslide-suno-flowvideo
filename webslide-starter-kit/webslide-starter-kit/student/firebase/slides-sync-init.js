import { isConfigured, createSync } from './firebase-sync.js';

const app = window.SLIDE_APP;
const params = new URLSearchParams(location.search);
const wantAdmin = params.has('admin');
const isView = params.has('view');
const banner = document.getElementById('fbBanner');
const modeBadge = document.getElementById('modeBadge');
const connBadge = document.getElementById('connBadge');
const lockBtn = document.getElementById('lockBtn');
const pdfBtn = document.getElementById('pdfBtn');
const logoutBtn = document.getElementById('logoutBtn');
const login = document.getElementById('login');
const loginForm = document.getElementById('loginForm');
const email = document.getElementById('lgEmail');
const password = document.getElementById('lgPw');
const error = document.getElementById('lgErr');

let sync = null;
let isAdmin = false;
let locked = false;
let pdfAllowed = true;
let connected = false;
let viewers = null;

function renderMode() {
  let text = '자유 열람';
  let follow = false;
  if (isAdmin) text = '강사 제어';
  else if (sync && locked && !isView) { text = '강사 화면 따라가기'; follow = true; }
  else if (sync && !isView) text = '자유 이동';
  modeBadge.textContent = text;
  modeBadge.classList.toggle('follow', follow);
  lockBtn.hidden = pdfBtn.hidden = logoutBtn.hidden = !isAdmin;
  lockBtn.textContent = locked ? '🔒 잠금 중' : '🔓 자유 이동';
  lockBtn.setAttribute('aria-pressed', String(locked));
  pdfBtn.textContent = pdfAllowed ? 'PDF 허용 중' : 'PDF 막힘';
  pdfBtn.setAttribute('aria-pressed', String(pdfAllowed));
  app.setPolicy({ nav: isAdmin || isView || !sync || !locked, pdf: pdfAllowed });
}

function renderConnection(message) {
  if (message) {
    connBadge.hidden = false;
    connBadge.textContent = message;
    return;
  }
  if (!sync) { connBadge.hidden = true; return; }
  connBadge.hidden = !(isAdmin || !connected);
  connBadge.textContent = connected ? '● 연결' + (viewers == null ? '' : ' · 접속 ' + viewers + '명') : '○ 재연결 중';
}

if (!isConfigured(window.FIREBASE_CONFIG)) {
  banner.hidden = false;
  renderMode();
} else if (isView) {
  renderMode();
} else {
  sync = createSync(window.FIREBASE_CONFIG, window.DECK_ID || 'suno-flow-shorts-0929');
  sync.onState((state) => {
    if (!state) { renderConnection('상태 읽기 실패 · 규칙 확인'); return; }
    locked = !!state.locked;
    pdfAllowed = state.pdf !== false;
    if (!isAdmin && locked) app.showRemote(state.slide | 0);
    renderMode();
  });
  sync.onConnection((online) => { connected = online; renderConnection(); });
  if (!wantAdmin) sync.joinViewers();
  sync.onAdmin((admin, user) => {
    isAdmin = admin;
    if (admin) {
      login.hidden = true;
      error.textContent = '';
      if (viewers == null) sync.onViewers((count) => { viewers = count; renderConnection(); });
    } else if (wantAdmin && user) {
      error.textContent = '강사 목록에 없는 계정';
      login.hidden = false;
    }
    renderMode();
    renderConnection();
  });
  app.setNavigateHandler((index) => {
    if (isAdmin) sync.setSlide(index).catch(() => renderConnection('저장 실패 · 관리자 권한 확인'));
  });
  if (wantAdmin) setTimeout(() => { if (!isAdmin) { login.hidden = false; email.focus(); } }, 700);
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    try { await sync.login(email.value.trim(), password.value); }
    catch (e) { error.textContent = '로그인 실패 · 이메일과 비밀번호 확인'; }
  });
  document.getElementById('lgClose').addEventListener('click', () => { login.hidden = true; });
  lockBtn.addEventListener('click', () => sync.setLock(!locked).catch(() => renderConnection('잠금 저장 실패')));
  pdfBtn.addEventListener('click', () => sync.setPdf(!pdfAllowed).catch(() => renderConnection('PDF 설정 저장 실패')));
  logoutBtn.addEventListener('click', () => sync.logout().catch(() => renderConnection('로그아웃 실패')));
}
