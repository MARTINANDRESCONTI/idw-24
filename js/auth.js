// Usuarios de ejemplo
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "visitante", password: "visitante123", role: "visitor" },
];

// Elementos del DOM
const loginBtn = document.getElementById("loginBtn");
const userIcon = document.getElementById("userIcon");
const adminLink = document.getElementById("adminLink");
const reservasLink = document.getElementById("reservasLink");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
const toastContainer = document.getElementById("toastContainer");

// Función para mostrar toast centrado
function showToast(message, color = "primary") {
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

// Revisar usuario logueado al cargar
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  updateNavbar(currentUser);
});

// Manejar submit del form
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    updateNavbar(user);
    loginModal.hide();
    loginForm.reset();
    showToast(`✔ Bienvenido ${user.username}`, "primary");
  } else {
    showToast(`❌ Usuario o contraseña incorrecta`, "danger");
  }
});

// Logout
loginBtn.addEventListener("click", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    localStorage.removeItem("currentUser");
    updateNavbar(null);
    showToast("✔ Sesión cerrada", "primary");
  }
});

// Actualizar navbar según usuario
function updateNavbar(user) {
  if (user) {
    loginBtn.textContent = "Logout";
    if (user.role === "admin") {
      userIcon.innerHTML = `<i class="bi bi-person-badge fs-4"></i> ${user.username}`;
      adminLink.classList.remove("d-none");
      reservasLink.classList.add("d-none");
    } else if (user.role === "visitor") {
      userIcon.innerHTML = `<i class="bi bi-person-circle fs-4"></i> ${user.username}`;
      reservasLink.classList.remove("d-none");
      adminLink.classList.add("d-none");
    }
  } else {
    loginBtn.textContent = "Login";
    userIcon.innerHTML = `<i class="bi bi-person-circle fs-4"></i>`;
    adminLink.classList.add("d-none");
    reservasLink.classList.add("d-none");
  }
}
