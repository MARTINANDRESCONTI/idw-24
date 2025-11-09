document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  const nombreInput = document.getElementById('nombre');
  const apellidoInput = document.getElementById('apellido');
  const emailInput = document.getElementById('email');

  // Validar que la contraseña tenga al menos 8 caracteres, letras y números
  function isValidPassword(pwd) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pwd);
  }

  // Obtener usuarios guardados
  function getStoredUsers() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
  }

  // Guardar usuario nuevo
  function saveUser(user) {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem('usuarios', JSON.stringify(users));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Validar username
    if (!usernameInput.value.trim()) {
      usernameInput.classList.add('is-invalid');
      valid = false;
    } else {
      usernameInput.classList.remove('is-invalid');
    }

    // Validar contraseña
    if (!isValidPassword(passwordInput.value)) {
      passwordInput.classList.add('is-invalid');
      valid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
    }

    // Validar confirm password
    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.classList.add('is-invalid');
      valid = false;
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
    }

    // Validar nombre, apellido y email
    if (!nombreInput.value.trim() || !apellidoInput.value.trim() || !emailInput.value.trim()) {
      alert("Por favor complete todos los campos obligatorios.");
      valid = false;
    }
    if (!valid) return;

    // ✅ Verificar si el usuario ya existe (por email)
    const existingUser = getStoredUsers().find(u => u.email === emailInput.value.trim());
    if (existingUser) {
      alert("❌ Ya existe un usuario registrado con ese correo electrónico.");
      return;
    }

    // ✅ Guardar nuevo usuario con nombres de variables tipo dummyjson
    const user = {
      firstName: nombreInput.value.trim(),
      lastName: apellidoInput.value.trim(),
      email: emailInput.value.trim(),
      username: usernameInput.value.trim(),
      password: passwordInput.value,
      role: "user" // rol por defecto
    };

    saveUser(user);

    alert(`✔ Usuario ${user.username} registrado correctamente`);
    form.reset();
    setTimeout(() => {
        window.location.href = "index.html";
      }, 500); // medio segundo después de mostrar el alert
    });


  // Validación en tiempo real
  passwordInput.addEventListener('input', () => {
    if (isValidPassword(passwordInput.value)) passwordInput.classList.remove('is-invalid');
  });
  confirmPasswordInput.addEventListener('input', () => {
    if (passwordInput.value === confirmPasswordInput.value) confirmPasswordInput.classList.remove('is-invalid');
  });
});
