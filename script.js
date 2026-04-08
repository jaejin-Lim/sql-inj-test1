const correctUser = "admin";
const correctPass = "1234";

const toggle = document.getElementById("modeToggle");
const label = document.getElementById("modeLabel");
const explainText = document.getElementById("explainText");

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    label.textContent = "Secure Mode";
    explainText.textContent = "보안 모드입니다. 입력값이 안전하게 처리됩니다.";
  } else {
    label.textContent = "Vulnerable Mode";
    explainText.textContent = "취약한 모드입니다. 입력값이 그대로 처리됩니다.";
  }
});

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const result = document.getElementById("result");

  if (!toggle.checked) {
    // ❌ 취약한 모드 (Injection 시뮬레이션)
    if (user.includes("'") || pass.includes("'")) {
      result.textContent = "로그인 성공 (Injection 시뮬레이션)";
      result.className = "success";
      explainText.textContent =
        "특수 입력이 그대로 처리되어 인증이 우회된 상황을 시뮬레이션합니다.";
    } else if (user === correctUser && pass === correctPass) {
      result.textContent = "정상 로그인 성공";
      result.className = "success";
    } else {
      result.textContent = "로그인 실패";
      result.className = "fail";
    }

  } else {
    // ✅ 보안 모드
    if (user === correctUser && pass === correctPass) {
      result.textContent = "정상 로그인 성공";
      result.className = "success";
      explainText.textContent =
        "입력값이 안전하게 처리되어 인증이 정상적으로 수행됩니다.";
    } else {
      result.textContent = "로그인 실패";
      result.className = "fail";
      explainText.textContent =
        "보안 처리로 인해 비정상 입력은 차단됩니다.";
    }
  }
}