// auth.js - adaptado: admin hardcodeado + DummyJSON para el resto (sessionStorage)

// Usuario admin hardcodeado (para la corrección)
const ADMIN_CRED = { username: "admin", password: "admin123", role: "admin" };

// Esperar a que exista el DOM
document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM (ajustá ids si son distintos)
  const loginBtn = document.getElementById("loginBtn");
  const adminLink = document.getElementById("adminLink");
  const reservasLink = document.getElementById("reservasLink");
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("usernameInput");
  const passwordInput = document.getElementById("passwordInput");
  const loginModalEl = document.getElementById("loginModal");
  const toastContainer = document.getElementById("toastContainer");
  const usersListContainer = document.getElementById("usersList"); // contenedor en admin.html para la tabla

  const loginModal = loginModalEl ? new bootstrap.Modal(loginModalEl) : null;

  // ================== TOAST SIMPLE ==================
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

  // ================== ACTUALIZAR NAVBAR ==================
  function updateNavbar(user) {
    if (!loginBtn) return;
    if (user) {
      loginBtn.textContent = "Logout";
      if (user.role === "admin") {
        adminLink?.classList.remove("d-none");
        reservasLink?.classList.add("d-none");
      } else if (user.role === "visitor" || user.role === "user") {
        reservasLink?.classList.remove("d-none");
        adminLink?.classList.add("d-none");
      } else {
        adminLink?.classList.add("d-none");
        reservasLink?.classList.add("d-none");
      }
    } else {
      loginBtn.textContent = "Login";
      adminLink?.classList.add("d-none");
      reservasLink?.classList.remove("d-none"); // 👈 se deja visible para todos
    }
  }

  // Leer usuario al cargar desde sessionStorage
  const stored = sessionStorage.getItem("currentUser");
  const currentUser = stored ? JSON.parse(stored) : null;
  updateNavbar(currentUser);

  if (!loginBtn) return;

  // ================== LOGIN / LOGOUT ==================
  loginBtn.addEventListener("click", () => {
    const cur = JSON.parse(sessionStorage.getItem("currentUser"));
    if (cur) {
      // Logout
      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem("token");
      updateNavbar(null);
      showToast("✔ Sesión cerrada", "primary");

      // Si estás en una página de admin, volver al index
      const currentPage = window.location.pathname.split("/").pop();
      if (currentPage.startsWith("admin") || currentPage.startsWith("abm-")) {
        window.location.href = "index.html";
      }
    } else {
      if (loginModal) loginModal.show();
    }
  });

  if (!loginForm || !usernameInput || !passwordInput) return;

  // ================== LOGIN FORM ==================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // 1) Verificar admin hardcodeado
    if (username === ADMIN_CRED.username && password === ADMIN_CRED.password) {
      const adminUser = { username: ADMIN_CRED.username, role: "admin", source: "local" };
      sessionStorage.setItem("currentUser", JSON.stringify(adminUser));
      sessionStorage.setItem("token", "ADMIN_LOCAL_TOKEN");
      updateNavbar(adminUser);
      loginModal?.hide();
      loginForm.reset();
      showToast(`✔ Bienvenido ${adminUser.username} (admin)`, "primary");
      return;
    }

    // 2) Login DummyJSON
    try {
      const res = await fetch("https://dummyjson.com/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        showToast("❌ Usuario o contraseña incorrecta (DummyJSON)", "danger");
        return;
      }

      const data = await res.json();
      const userFromApi = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || "user",
        id: data.id,
        source: "dummyjson"
      };

      sessionStorage.setItem("currentUser", JSON.stringify(userFromApi));
      if (data.accessToken) sessionStorage.setItem("token", data.accessToken);

      updateNavbar(userFromApi);
      loginModal?.hide();
      loginForm.reset();
      showToast(`✔ Bienvenido ${userFromApi.username}`, "primary");
    } catch (err) {
      console.error("Error fetch login:", err);
      showToast("❌ Error de conexión al autenticar", "danger");
    }
  });

  // ================== CARGAR USUARIOS DummyJSON ==================
  async function loadDummyUsers() {
    if (!usersListContainer) {
      console.warn("usersList container no encontrado. Agregar un elemento con id='usersList' en admin.html");
      return;
    }

    usersListContainer.innerHTML = "Cargando usuarios...";
    try {
      const res = await fetch("https://dummyjson.com/users?limit=100");
      if (!res.ok) throw new Error("No se pudo traer usuarios");
      const json = await res.json();
      const users = json.users || [];

      let html = `
        <div class="table-responsive">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th>#</th><th>Username</th><th>Password</th><th>Nombre</th><th>Rol</th><th>Acción</th>
              </tr>
            </thead><tbody>
      `;
      users.forEach((u, idx) => {
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${u.username}</td>
            <td>${u.password || ""}</td>
            <td>${(u.firstName || "") + " " + (u.lastName || "")}</td>
            <td>${u.role || "user"}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary btn-copy" data-username="${u.username}" data-password="${u.password}">Copiar cred.</button>
              <button class="btn btn-sm btn-outline-success btn-login-as" data-username="${u.username}" data-password="${u.password}">Entrar</button>
            </td>
          </tr>`;
      });
      html += "</tbody></table></div>";
      usersListContainer.innerHTML = html;

      usersListContainer.querySelectorAll(".btn-copy").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const u = e.currentTarget.dataset.username;
          const p = e.currentTarget.dataset.password;
          navigator.clipboard?.writeText(`username: ${u}, password: ${p}`);
          showToast("Credenciales copiadas al portapapeles", "primary");
        });
      });

      usersListContainer.querySelectorAll(".btn-login-as").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const username = e.currentTarget.dataset.username;
          const password = e.currentTarget.dataset.password;
          try {
            const res = await fetch("https://dummyjson.com/user/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
            });
            if (!res.ok) {
              showToast("❌ No se pudo loguear con estas credenciales", "danger");
              return;
            }
            const data = await res.json();
            const userFromApi = {
              username: data.username,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role || "user",
              id: data.id,
              source: "dummyjson"
            };
            sessionStorage.setItem("currentUser", JSON.stringify(userFromApi));
            if (data.accessToken) sessionStorage.setItem("token", data.accessToken);
            updateNavbar(userFromApi);
            showToast(`✔ Entraste como ${userFromApi.username}`, "primary");
          } catch (err) {
            console.error(err);
            showToast("❌ Error al intentar loguear", "danger");
          }
        });
      });
    } catch (err) {
      console.error("Error loadDummyUsers:", err);
      usersListContainer.innerHTML = "<p class='text-danger'>Error al cargar usuarios.</p>";
    }
  }

  // Exponer al scope global
  window.loadDummyUsers = loadDummyUsers;

  // ================== PROTECCIÓN DE RUTAS ASÍNCRONA ==================
  (async () => {
    async function esperarUsuario() {
      let user = JSON.parse(sessionStorage.getItem("currentUser"));
      let intentos = 0;
      while (!user && intentos < 10) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        user = JSON.parse(sessionStorage.getItem("currentUser"));
        intentos++;
      }
      return user;
    }

    const paginaActual = window.location.pathname.split("/").pop();
    const usuarioLogueado = await esperarUsuario();

    // 🔒 Admins
    if (
      (paginaActual.startsWith("admin") ||
        paginaActual.startsWith("abm-") ||
        paginaActual.startsWith("users")) &&
      (!usuarioLogueado || usuarioLogueado.role !== "admin")
    ) {
      alert("❌ No tienes permiso para acceder a esta página");
      window.location.href = "index.html";
    }

    // ✅ Reservas ahora es pública (se eliminó el bloqueo)
    // Antes pedía login, ahora todos pueden acceder.
    console.log("Acceso libre permitido a reservas.html para visitantes y usuarios.");
  })();
});
