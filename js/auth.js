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

  // Toast simple
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
    if (!loginBtn) return;
    if (user) {
      loginBtn.textContent = "Logout";
      if (user.role === "admin") {
        if (adminLink) adminLink.classList.remove("d-none");
        if (reservasLink) reservasLink.classList.add("d-none");
      } else if (user.role === "visitor" || user.role === "user") {
        if (reservasLink) reservasLink.classList.remove("d-none");
        if (adminLink) adminLink.classList.add("d-none");
      } else {
        if (adminLink) adminLink.classList.add("d-none");
        if (reservasLink) reservasLink.classList.add("d-none");
      }
    } else {
      loginBtn.textContent = "Login";
      if (adminLink) adminLink.classList.add("d-none");
      if (reservasLink) reservasLink.classList.add("d-none");
    }
  }

  // Leer usuario al cargar desde sessionStorage
  const stored = sessionStorage.getItem("currentUser");
  const currentUser = stored ? JSON.parse(stored) : null;
  updateNavbar(currentUser);

  if (!loginBtn) return;

  // Click en loginBtn: abre modal si no hay sesión, o hace logout si hay sesión
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
      // Abrir modal de login
      if (loginModal) loginModal.show();
    }
  });

  // Si el formulario o inputs no existen, salir (evita errores)
  if (!loginForm || !usernameInput || !passwordInput) return;

  // Manejar submit del form
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // 1) Verificar admin hardcodeado
    if (username === ADMIN_CRED.username && password === ADMIN_CRED.password) {
      const adminUser = { username: ADMIN_CRED.username, role: "admin", source: "local" };
      sessionStorage.setItem("currentUser", JSON.stringify(adminUser));
      // No token real para admin; si querés podés setear un flag
      sessionStorage.setItem("token", "ADMIN_LOCAL_TOKEN");
      updateNavbar(adminUser);
      if (loginModal) loginModal.hide();
      loginForm.reset();
      showToast(`✔ Bienvenido ${adminUser.username} (admin)`, "primary");
      return;
    }

    // 2) Intentar login contra DummyJSON
    try {
      const res = await fetch("https://dummyjson.com/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        // res puede devolver 400 si credenciales incorrectas
        showToast("❌ Usuario o contraseña incorrecta (DummyJSON)", "danger");
        return;
      }

      const data = await res.json();
      // Data contiene accessToken, refreshToken y campos del usuario
      const userFromApi = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || "user",
        id: data.id,
        source: "dummyjson"
      };

      // Guardar usuario y token en sessionStorage
      sessionStorage.setItem("currentUser", JSON.stringify(userFromApi));
      if (data.accessToken) sessionStorage.setItem("token", data.accessToken);

      updateNavbar(userFromApi);
      if (loginModal) loginModal.hide();
      loginForm.reset();
      showToast(`✔ Bienvenido ${userFromApi.username}`, "primary");
    } catch (err) {
      console.error("Error fetch login:", err);
      showToast("❌ Error de conexión al autenticar", "danger");
    }
  });



  // ---------- FUNCIONES ADMIN: cargar y mostrar usuarios de DummyJSON ----------
  // Llamar esta función desde admin.html (por ejemplo onLoad) o si detectás que el currentUser es admin
  async function loadDummyUsers() {
    if (!usersListContainer) {
      console.warn("usersList container no encontrado. Agregar un elemento con id='usersList' en admin.html");
      return;
    }

    usersListContainer.innerHTML = "Cargando usuarios...";

    try {
      // Trae la primera página por defecto (30). Podés usar ?limit=100 o paginar.
      const res = await fetch("https://dummyjson.com/users?limit=100");
      if (!res.ok) throw new Error("No se pudo traer usuarios");
      const json = await res.json();
      const users = json.users || [];

      // Construir tabla simple con username y password visible (para que el corrector pruebe)
      let html = `
        <div class="table-responsive">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Password</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
      `;
      users.forEach((u, idx) => {
        html += `
          <tr>
            <td>${idx+1}</td>
            <td>${u.username}</td>
            <td>${u.password || ""}</td>
            <td>${(u.firstName||"") + " " + (u.lastName||"")}</td>
            <td>${u.role || "user"}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary btn-copy" data-username="${u.username}" data-password="${u.password}">Copiar cred.</button>
              <button class="btn btn-sm btn-outline-success btn-login-as" data-username="${u.username}" data-password="${u.password}">Entrar</button>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table></div>`;
      usersListContainer.innerHTML = html;

      // Agregar listeners a botones de copiar y "entrar como"
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
          // Intentar login contra DummyJSON reutilizando la misma lógica:
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

  // Exponer loadDummyUsers al scope global para llamarlo desde admin.html onload o desde consola:
  window.loadDummyUsers = loadDummyUsers;

  // Si ya estás logueado y sos admin, podés auto-cargar la lista
  const curUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (curUser && curUser.role === "admin") {
    // carga automática si el contenedor está presente
    if (usersListContainer) loadDummyUsers();
  }

  // Protección de rutas basada en el nombre del archivo
const paginaActual = window.location.pathname.split("/").pop();
const usuarioLogueado = JSON.parse(sessionStorage.getItem("currentUser"));

// Proteger cualquier página que comience con "admin"
if (paginaActual.startsWith("admin") || paginaActual.startsWith("abm-") || paginaActual.startsWith("users")){
  if (!usuarioLogueado || usuarioLogueado.role !== "admin") {
    alert("❌ No tienes permiso para acceder a esta página");
    window.location.href = "index.html";
  }
}

// Ejemplo: proteger también la sección de reservas (opcional)
if (paginaActual === "reservas.html") {
  if (!usuarioLogueado || (usuarioLogueado.role !== "visitor" && usuarioLogueado.role !== "user")) {
    alert("❌ Debes iniciar sesión para acceder a reservas");
    window.location.href = "index.html";
  }
}

});
