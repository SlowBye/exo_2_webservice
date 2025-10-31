document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.style.display = 'none';

    if (!email || !password) {
        errorDiv.textContent = 'Login et mot de passe requis.';
    errorDiv.style.display = 'block';
    return;
  }

    try {
    const resp = await fetch('http://localhost:3000/api/login', {
        method: 'GET',
    headers: {
        'Authorization': 'Basic ' + base64EncodeUTF8(`${email}:${password}`)
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
    throw new Error(text || `Erreur ${resp.status}`);
    }

    try {
      const data = await resp.clone().json();
    if (data?.token || data?.access_token) {
        localStorage.setItem('token', data.token || data.access_token);
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
    }

    // localStorage.setItem('currentUser', email);
    window.location.href = 'notes.html';
  } catch (err) {
        errorDiv.textContent = err?.message || 'Login ou mot de passe incorrect';
    errorDiv.style.display = 'block';
  }
});

function base64EncodeUTF8(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}
