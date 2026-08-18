function showRegister(e) {
  e.preventDefault();
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

function showLogin(e) {
  e.preventDefault();
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Пожалуйста, заполните все поля');
    return false;
  }
  
  alert('Вход выполнен успешно!');
  return false;
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  
  if (!name || !email || !password || !confirm) {
    alert('Пожалуйста, заполните все поля');
    return false;
  }
  
  if (password !== confirm) {
    alert('Пароли не совпадают');
    return false;
  }
  
  if (password.length < 6) {
    alert('Пароль должен содержать минимум 6 символов');
    return false;
  }
  
  alert('Регистрация успешна! Теперь вы можете войти.');
  showLogin(e);
  return false;
}
