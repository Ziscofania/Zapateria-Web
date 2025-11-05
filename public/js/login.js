
async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await postJson("/api/auth/login", { email, password });

  if (res.error) {
    alert("Error: " + res.error);
    return;
  }

  // guardar tempToken localmente (solo temporal)
  const tempToken = res.tempToken;
  localStorage.setItem("tempToken", tempToken);

  if (res.needs2FASetup) {
    // mostrar QR para configurar
    document.getElementById("qrImg").src = res.qrDataUrl;
    document.getElementById("setupArea").style.display = "block";
  } else if (res.needs2FAVerify) {
    document.getElementById("verifyArea").style.display = "block";
  } else {
    alert("Unknown response");
  }
});

document.getElementById("verify").addEventListener("click", async () => {
  const token2fa = document.getElementById("code").value;
  const tempToken = localStorage.getItem("tempToken");
  const res = await postJson("/api/auth/2fa-verify", { token2fa, tempToken });
  if (res.error) { alert("Error: " + res.error); return; }
  localStorage.setItem("accessToken", res.accessToken);
  alert("Login success! Access token saved.");
});

document.getElementById("verifySetup").addEventListener("click", async () => {
  const token2fa = document.getElementById("codeSetup").value;
  const tempToken = localStorage.getItem("tempToken");
  const res = await postJson("/api/auth/2fa-verify", { token2fa, tempToken });
  if (res.error) { alert("Error: " + res.error); return; }
  localStorage.setItem("accessToken", res.accessToken);
  alert("2FA configured and login success!");
});
