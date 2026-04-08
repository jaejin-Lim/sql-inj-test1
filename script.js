/**
 * SQL 인젝션 교육 시뮬레이터 — script.js
 *
 * ⚠ 중요: 이 파일은 순수 JavaScript로만 작동합니다.
 *   - 실제 데이터베이스나 서버를 사용하지 않습니다.
 *   - 실제 공격 페이로드는 포함되어 있지 않으며,
 *     SQL 인젝션의 동작 원리를 개념적으로 시뮬레이션합니다.
 *   - 교육 목적으로만 사용하십시오.
 */

'use strict';

// ═══════════════════════════════════════════
// 1. 시뮬레이션용 가상 사용자 데이터베이스
//    (실제 DB 없이 메모리 내 배열로 흉내냄)
// ═══════════════════════════════════════════

/**
 * 실제 시스템에서라면 이 데이터는 서버 데이터베이스에 존재합니다.
 * 여기서는 교육용 시뮬레이션이므로 메모리 배열로 대체합니다.
 */
const MOCK_USERS = [
  { id: 1, username: 'admin',   password: 'secret123', role: 'Administrator' },
  { id: 2, username: 'alice',   password: 'alice2024', role: 'User'          },
  { id: 3, username: 'bob',     password: 'qwerty!',   role: 'User'          },
];

// ═══════════════════════════════════════════
// 2. 애플리케이션 상태
// ═══════════════════════════════════════════

let currentMode = 'vulnerable'; // 'vulnerable' | 'secure'

// ═══════════════════════════════════════════
// 3. SQL 인젝션 감지 로직
//    (개념적 시뮬레이션 — 실제 공격 코드 아님)
// ═══════════════════════════════════════════

/**
 * SQL 인젝션 패턴 감지기 (교육용 개념 시뮬레이터)
 *
 * 실제 공격에서는 다양한 SQL 특수문자가 사용됩니다.
 * 여기서는 해당 패턴이 존재하는지 감지하여 시각적으로 보여줍니다.
 * (실제 SQL 파서가 아닌 개념적 모방입니다)
 */
function detectInjectionAttempt(input) {
  // SQL 인젝션에서 흔히 사용되는 특수 기호들 (개념적 예시)
  const sqlSpecialChars = ["'", '"', ';', '--', '/*', '*/'];
  const sqlKeywords = ['OR', 'AND', 'UNION', 'SELECT', 'DROP', 'DELETE', 'INSERT', 'UPDATE'];

  const upperInput = input.toUpperCase();
  const hasSpecialChar = sqlSpecialChars.some(c => input.includes(c));
  const hasKeyword = sqlKeywords.some(k => upperInput.includes(k));

  return {
    isInjection: hasSpecialChar || hasKeyword,
    hasSpecialChar,
    hasKeyword,
    detectedKeywords: sqlKeywords.filter(k => upperInput.includes(k)),
  };
}

// ═══════════════════════════════════════════
// 4. 취약한 로그인 시뮬레이터 (개념적 모방)
//
//    실제 취약한 코드는 이런 식으로 작동합니다:
//    "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
//
//    사용자 입력이 그대로 쿼리에 삽입되어 조작이 가능합니다.
// ═══════════════════════════════════════════

function vulnerableLogin(username, password) {
  const detection = detectInjectionAttempt(username);

  /**
   * [개념 시뮬레이션]
   * 실제 취약한 서버에서는 문자열 연결로 SQL 쿼리가 만들어집니다:
   *   "... WHERE username = '" + username + "' AND ..."
   *
   * 입력값에 ' OR '1'='1 같은 패턴이 있으면
   * 쿼리 논리 자체가 바뀌어 조건이 항상 참이 됩니다.
   *
   * 여기서는 그 동작을 JavaScript 조건문으로 개념적으로 흉내냅니다.
   * (실제 SQL이 실행되지 않음)
   */

  if (detection.isInjection) {
    // 인젝션 패턴 감지 → 취약 모드에서는 쿼리 조작 성공으로 시뮬레이션
    return {
      success: true,
      reason: 'injection',
      detectedChars: detection.hasSpecialChar,
      detectedKeywords: detection.detectedKeywords,
      simulatedQuery: buildVulnerableQuery(username, password),
      user: MOCK_USERS[0], // 가상으로 첫 번째 사용자(admin)로 로그인됨을 시뮬레이션
    };
  }

  // 인젝션 없음 → 정상 자격증명 검사
  const user = MOCK_USERS.find(
    u => u.username === username && u.password === password
  );

  return {
    success: !!user,
    reason: user ? 'valid_credentials' : 'invalid_credentials',
    simulatedQuery: buildVulnerableQuery(username, password),
    user: user || null,
  };
}

// ═══════════════════════════════════════════
// 5. 안전한 로그인 시뮬레이터 (준비된 문 개념)
//
//    실제 안전한 코드:
//    "SELECT * FROM users WHERE username = ? AND password = ?"
//    플레이스홀더(?)를 사용하면 SQL 구조와 데이터가 분리됩니다.
// ═══════════════════════════════════════════

function secureLogin(username, password) {
  /**
   * [준비된 문 시뮬레이션]
   * Prepared Statement에서는 입력값이 SQL 구조에 영향을 주지 못합니다.
   * 특수문자(' ; --)가 포함되어 있어도 "데이터"로만 처리됩니다.
   *
   * 즉, username = "' OR '1'='1"을 입력해도
   * 실제로 username이 "' OR '1'='1"인 사용자를 찾으므로 찾지 못합니다.
   */

  // 입력값 그대로 데이터로만 사용 (SQL 구조 변경 불가)
  const user = MOCK_USERS.find(
    u => u.username === username && u.password === password
  );

  const detection = detectInjectionAttempt(username);

  return {
    success: !!user,
    reason: user ? 'valid_credentials' : detection.isInjection ? 'injection_blocked' : 'invalid_credentials',
    simulatedQuery: buildSecureQuery(username, password),
    user: user || null,
    injectionAttempted: detection.isInjection,
  };
}

// ═══════════════════════════════════════════
// 6. 쿼리 표시 빌더 (시각적 교육용)
// ═══════════════════════════════════════════

function buildVulnerableQuery(username, password) {
  // 취약한 문자열 연결 방식 시각화
  return `SELECT * FROM users\nWHERE username = '${username}'\nAND password = '${password}'`;
}

function buildSecureQuery(username, password) {
  // 준비된 문은 입력값을 ? 플레이스홀더로 대체
  return `SELECT * FROM users\nWHERE username = ?\nAND password = ?\n-- [바인딩 파라미터: ('${sanitizeForDisplay(username)}', '***')]`;
}

// 표시용 문자열 이스케이프 (XSS 방지)
function sanitizeForDisplay(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ═══════════════════════════════════════════
// 7. UI 업데이트 함수들
// ═══════════════════════════════════════════

/**
 * 현재 입력값을 기반으로 쿼리 미리보기 업데이트
 */
function updateQueryPreview() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const display = document.getElementById('query-display');

  const detection = detectInjectionAttempt(username);
  let queryText;

  if (currentMode === 'vulnerable') {
    queryText = buildVulnerableQuery(username, password);
    // 인젝션 패턴 강조 표시
    if (detection.isInjection) {
      const safeUser = sanitizeForDisplay(username);
      const safePass = sanitizeForDisplay(password);
      display.innerHTML =
        `<span class="hl-key">SELECT</span> * <span class="hl-key">FROM</span> users\n` +
        `<span class="hl-key">WHERE</span> username = '<span class="hl-inject">${safeUser}</span>'\n` +
        `<span class="hl-key">AND</span> password = '${safePass}'`;
    } else {
      display.innerHTML =
        `<span class="hl-key">SELECT</span> * <span class="hl-key">FROM</span> users\n` +
        `<span class="hl-key">WHERE</span> username = '${sanitizeForDisplay(username)}'\n` +
        `<span class="hl-key">AND</span> password = '${sanitizeForDisplay(password)}'`;
    }
  } else {
    // 보안 모드: 항상 플레이스홀더 표시
    display.innerHTML =
      `<span class="hl-key">SELECT</span> * <span class="hl-key">FROM</span> users\n` +
      `<span class="hl-key">WHERE</span> username = <span class="hl-safe">?</span>\n` +
      `<span class="hl-key">AND</span> password = <span class="hl-safe">?</span>\n` +
      `<span style="color:var(--text-dim)">-- 파라미터: ('${sanitizeForDisplay(username)}', '***')</span>`;
  }
}

/**
 * 로그인 시도 결과 표시
 */
function showResult(result) {
  const box = document.getElementById('result-box');
  const icon = document.getElementById('result-icon');
  const title = document.getElementById('result-title');
  const reason = document.getElementById('result-reason');

  box.classList.remove('hidden', 'success', 'failure');

  if (result.success) {
    box.classList.add('success');
    icon.textContent = '✅';
    title.textContent = '로그인 성공!';

    if (result.reason === 'injection') {
      title.textContent = '⚠ 인젝션 공격으로 로그인 우회됨!';
      reason.innerHTML =
        `SQL 특수문자로 쿼리 구조가 변경되었습니다.<br>` +
        `조건이 항상 <code style="color:var(--red);font-family:var(--mono)">TRUE</code>가 되어 인증을 통과했습니다.<br>` +
        `<span style="color:var(--red)">실제 비밀번호를 몰라도 로그인이 가능합니다.</span>`;
    } else {
      reason.textContent = `올바른 자격증명으로 로그인 성공. 역할: ${result.user.role}`;
    }
  } else {
    box.classList.add('failure');
    icon.textContent = '🚫';

    if (result.reason === 'injection_blocked') {
      title.textContent = '인젝션 공격 차단됨';
      reason.innerHTML =
        `준비된 문(Prepared Statement)이 활성화되어 있습니다.<br>` +
        `특수문자가 포함된 입력값도 <strong style="color:var(--green)">데이터</strong>로만 처리됩니다.<br>` +
        `SQL 구조가 변경되지 않으므로 공격이 무력화됩니다.`;
    } else {
      title.textContent = '로그인 실패';
      reason.textContent = '사용자 이름 또는 비밀번호가 일치하지 않습니다.';
    }
  }
}

/**
 * 설명 패널 내용 업데이트
 */
function updateExplanationPanel() {
  const container = document.getElementById('explanation-content');

  if (currentMode === 'vulnerable') {
    container.innerHTML = `
      <div class="exp-block vuln">
        <h4>⚠ 취약한 쿼리 방식</h4>
        <p>입력값이 SQL 문자열에 직접 <strong>연결(concatenation)</strong>됩니다.</p>
        <div class="step-list">
          <div class="step">
            <span class="step-num v">1</span>
            <span>사용자가 입력한 값이 쿼리 문자열에 그대로 삽입됩니다</span>
          </div>
          <div class="step">
            <span class="step-num v">2</span>
            <span>특수문자(<code>'</code>, <code>--</code>)로 SQL 논리를 변경할 수 있습니다</span>
          </div>
          <div class="step">
            <span class="step-num v">3</span>
            <span>쿼리 조건이 항상 참이 되어 인증이 우회됩니다</span>
          </div>
        </div>
      </div>

      <div class="exp-block note">
        <h4>🧪 테스트 자격증명</h4>
        <p>정상 로그인 테스트:</p>
        <ul>
          <li>아이디: <code>admin</code> / 비밀번호: <code>secret123</code></li>
          <li>아이디: <code>alice</code> / 비밀번호: <code>alice2024</code></li>
        </ul>
      </div>

      <div class="exp-block note">
        <h4>🔍 핵심 원리</h4>
        <p>
          <code>' OR '1'='1</code>과 같은 입력은 SQL 조건을 
          <strong>항상 참</strong>으로 만들어 인증을 우회합니다.
          입력이 코드(SQL)로 해석되는 것이 문제의 근본 원인입니다.
        </p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="exp-block safe">
        <h4>🛡 준비된 문(Prepared Statement)</h4>
        <p>SQL 구조와 데이터를 완전히 분리합니다.</p>
        <div class="step-list">
          <div class="step">
            <span class="step-num s">1</span>
            <span>SQL 쿼리 구조가 먼저 <strong>컴파일</strong>됩니다 (<code>?</code> 플레이스홀더)</span>
          </div>
          <div class="step">
            <span class="step-num s">2</span>
            <span>사용자 입력은 나중에 <strong>바인딩</strong>됩니다 (데이터로만 처리)</span>
          </div>
          <div class="step">
            <span class="step-num s">3</span>
            <span>특수문자가 있어도 SQL 구조를 변경할 수 없습니다</span>
          </div>
        </div>
      </div>

      <div class="exp-block note">
        <h4>✅ 결과</h4>
        <p>
          어떤 값을 입력해도 <strong>데이터</strong>로만 취급됩니다.
          <code>' OR '1'='1</code>을 입력해도 해당 문자열을 username으로 가진 사용자를 찾으므로 로그인에 실패합니다.
        </p>
      </div>

      <div class="exp-block safe">
        <h4>💻 코드 비교</h4>
        <p><strong style="color:var(--red)">취약:</strong></p>
        <code style="display:block;background:var(--bg-input);padding:.5rem;border-radius:4px;font-size:.75rem;margin:.3rem 0;">"SELECT * FROM users WHERE username = '" + username + "'"</code>
        <p style="margin-top:.6rem"><strong style="color:var(--green)">안전:</strong></p>
        <code style="display:block;background:var(--bg-input);padding:.5rem;border-radius:4px;font-size:.75rem;color:var(--green);margin:.3rem 0;">stmt.prepare("SELECT * FROM users WHERE username = ?");<br>stmt.bind(username);</code>
      </div>
    `;
  }
}

// ═══════════════════════════════════════════
// 8. 이벤트 핸들러
// ═══════════════════════════════════════════

/**
 * 모드 전환 (취약 ↔ 보안)
 */
function setMode(mode) {
  currentMode = mode;

  // 버튼 상태
  document.getElementById('btn-vulnerable').classList.toggle('active', mode === 'vulnerable');
  document.getElementById('btn-secure').classList.toggle('active', mode === 'secure');

  // 뱃지
  const badge = document.getElementById('mode-badge');
  badge.textContent = mode === 'vulnerable' ? '현재: 취약 모드' : '현재: 보안 모드';
  badge.className = `mode-badge ${mode === 'vulnerable' ? 'vulnerable' : 'secure'}`;

  // 패널 라벨
  const label = document.getElementById('panel-mode-label');
  if (mode === 'vulnerable') {
    label.textContent = '⚠ VULNERABLE';
    label.className = 'panel-mode-label vuln-label';
  } else {
    label.textContent = '🛡 SECURE';
    label.className = 'panel-mode-label secure-label';
  }

  // body 클래스 (버튼 색상 조정)
  document.body.className = mode === 'vulnerable' ? 'mode-vuln' : 'mode-secure';

  // 힌트 박스
  const hintBox = document.getElementById('hint-box');
  hintBox.classList.toggle('hidden', mode !== 'vulnerable');

  // 결과 초기화
  document.getElementById('result-box').classList.add('hidden');

  // 설명 패널 업데이트
  updateExplanationPanel();

  // 쿼리 미리보기 업데이트
  updateQueryPreview();
}

/**
 * 로그인 시도
 */
function attemptLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username && !password) {
    // 빈 입력 안내
    const result = { success: false, reason: 'invalid_credentials' };
    showResult(result);
    return;
  }

  let result;
  if (currentMode === 'vulnerable') {
    result = vulnerableLogin(username, password);
  } else {
    result = secureLogin(username, password);
  }

  showResult(result);
}

/**
 * 힌트 코드 클릭 → 입력란에 자동 채우기
 */
document.addEventListener('DOMContentLoaded', () => {
  const hintCode = document.getElementById('hint-payload');
  if (hintCode) {
    hintCode.addEventListener('click', () => {
      document.getElementById('username').value = "' OR '1'='1";
      document.getElementById('password').value = 'anything';
      updateQueryPreview();

      // 복사됨 피드백
      hintCode.textContent = '✓ 입력란에 채워졌습니다';
      hintCode.style.color = 'var(--green)';
      setTimeout(() => {
        hintCode.textContent = "' OR '1'='1";
        hintCode.style.color = '';
      }, 1500);
    });
  }

  // 입력 이벤트 → 쿼리 미리보기 실시간 업데이트
  ['username', 'password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateQueryPreview);
    }
  });

  // 엔터 키로 로그인 시도
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') attemptLogin();
  });

  // 초기 상태 설정
  setMode('vulnerable');
});
