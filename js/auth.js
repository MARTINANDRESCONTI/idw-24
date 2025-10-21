// auth.js adaptado al index.html que me pasaste

// Usuarios de ejemplo
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "visitante", password: "visitante123", role: "visitor" },
];

// Esperar a que exista el DOM
document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM (según tu HTML)
  const loginBtn = document.getElementById("loginBtn");
  const adminLink = document.getElementById("adminLink");
  const reservasLink = document.getElementById("reservasLink");
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");
  const loginModalEl = document.getElementById("loginModal");
  const toastContainer = document.getElementById("toastContainer");

  // Crear instancia del modal (Bootstrap)
  const loginModal = loginModalEl ? new bootstrap.Modal(loginModalEl) : null;

  // Función para mostrar toast centrado
  function showToast(message, color = "primary") {
    if (!toastContainer) return;
    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-white bg-${color} border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 2000 });
    toast.show();
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  }

  // Actualizar navbar según usuario (muestra/oculta enlaces y cambia texto del botón)
  function updateNavbar(user) {
    if (user) {
      // Mostrar rol en el botón (Logout)
      loginBtn.textContent = "Logout";
      // Mostrar/ocultar links según rol
      if (user.role === "admin") {
        if (adminLink) adminLink.classList.remove("d-none");
        if (reservasLink) reservasLink.classList.add("d-none");
      } else if (user.role === "visitor") {
        if (reservasLink) reservasLink.classList.remove("d-none");
        if (adminLink) adminLink.classList.add("d-none");
      } else {
        // Por defecto ocultar ambos si rol desconocido
        if (adminLink) adminLink.classList.add("d-none");
        if (reservasLink) reservasLink.classList.add("d-none");
      }
    } else {
      // Sin usuario: mostrar Login y ocultar links
      loginBtn.textContent = "Login";
      if (adminLink) adminLink.classList.add("d-none");
      if (reservasLink) reservasLink.classList.add("d-none");
    }
  }

  // Leer usuario al cargar y actualizar navbar
  const stored = localStorage.getItem("currentUser");
  const currentUser = stored ? JSON.parse(stored) : null;
  updateNavbar(currentUser);

  // Si el botón no existe por alguna razón, no continuar
  if (!loginBtn) return;

  // Click en loginBtn: abre modal si no hay sesión, o hace logout si hay sesión
loginBtn.addEventListener("click", () => {
  const cur = JSON.parse(localStorage.getItem("currentUser"));
  if (cur) {
    // Hacer logout
    localStorage.removeItem("currentUser");
    updateNavbar(null);
    showToast("✔ Sesión cerrada", "primary");

// Si estás en una página de administración (admin o subpáginas), volver al index
const currentPage = window.location.pathname.split("/").pop();
if (currentPage.startsWith("admin") || currentPage.startsWith("abm-")) {
  window.location.href = "index.html";
}

  } else {
    // Abrir modal de login
    if (loginModal) loginModal.show();
  }
});


  // Si el formulario o inputs no existen, salir (evita errores)
  if (!loginForm || !usernameInput || !passwordInput) return;

  // Manejar submit del form
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      updateNavbar(user);
      if (loginModal) loginModal.hide();
      loginForm.reset();
      showToast(`✔ Bienvenido ${user.username}`, "primary");
    } else {
      showToast(`❌ Usuario o contraseña incorrecta`, "danger");
    }
  });

  // Protección básica si se accede a páginas internas (opcional)
  // Si estás en admin.html y no hay usuario logueado, te manda al index
  const paginaActual = window.location.pathname.split("/").pop();
  const usuarioLogueado = JSON.parse(localStorage.getItem("currentUser"));
  if (!usuarioLogueado && (paginaActual === "admin.html" || paginaActual === "reservas.html")) {
    // No redirigimos agresivamente para que puedas depurar; mostramos aviso y opcionalmente redirigimos:
    // alert("Debes iniciar sesión para acceder a esta página.");
    // window.location.href = "index.html";
  }
});
