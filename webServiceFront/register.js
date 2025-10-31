// Inscription (POST JSON -> /api/sign_up)
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('registerError');
  const successDiv = document.getElementById('registerSuccess');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (!email) {
    errorDiv.textContent = 'login requis';
    errorDiv.style.display = 'block';
    return;
  }
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Les mots de passe ne correspondent pas';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const resp = await fetch('http://localhost:3000/api/sign_up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: email, password })
    });

    if (!resp.ok) {
      let message = `Erreur ${resp.status}`;
      try {
        const data = await resp.clone().json();
        if (data?.error || data?.message) message = data.error || data.message;
      } catch {
        const text = await resp.text();
        if (text) message = text;
      }
      if (resp.status === 409) message = 'Cet email est déjà utilisé';
      if (resp.status === 400) message = 'Requête invalide';
      throw new Error(message);
    }

    successDiv.textContent = 'Compte créé avec succès ! Redirection...';
    successDiv.style.display = 'block';
    document.getElementById('registerForm').reset();

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (err) {
    errorDiv.textContent = err?.message || 'Une erreur est survenue';
    errorDiv.style.display = 'block';
  }
});
