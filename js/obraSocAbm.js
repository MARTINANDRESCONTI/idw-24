// Cargar obras sociales desde localStorage 
let obras = JSON.parse(localStorage.getItem("obrasSociales")) || [];

// Guardar en localStorage

function guardar() {
  localStorage.setItem("obrasSociales", JSON.stringify(obras));
}

// ID 

function generarId() {
  return "OS" + Date.now();
}

// Descuentos predeterminados

const descuentosFijos = {
  "OSDE": 20,
  "IOMA": 30,
  "Swiss Medical": 15,
  "Galeno": 25,
  "Sancor Salud": 18
};

// Agregar nueva obra social

function agregarObra(nombre) {
  const porcentaje = descuentosFijos[nombre] || 0; // usa 0 si no está en la lista
  const nueva = {
    id: generarId(),
    nombre: nombre.trim(),
    porcentaje: porcentaje
  };
  obras.push(nueva);
  guardar();
}

// Modificar obra social 

function modificarObra(id, nuevoNombre) {
  const obra = obras.find(o => o.id === id);
  if (obra) {
    obra.nombre = nuevoNombre.trim();
    obra.porcentaje = descuentosFijos[nuevoNombre] || 0;
    guardar();
  }
}

// Eliminar obra social

function eliminarObra(id) {
  obras = obras.filter(o => o.id !== id);
  guardar();
  renderTabla();
}

// Calcular costo final

const PRECIO_CONSULTA = 50000;
function calcularCostoFinal(porcentaje) {
  return PRECIO_CONSULTA - (PRECIO_CONSULTA * porcentaje / 100);
}

// Tabla

function renderTabla() {
  const tabla = document.getElementById("tablaObras");
  tabla.innerHTML = "";

  obras.forEach(obra => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${obra.nombre}</td>
      <td>${obra.porcentaje}%</td>
      <td>$${calcularCostoFinal(obra.porcentaje).toLocaleString()}</td>
      <td>
        <button class="btn btn-warning btn-sm me-2" onclick="editarObra('${obra.id}')">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="eliminarObra('${obra.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tabla.appendChild(fila);
  });
}

// Cargar 

function editarObra(id) {
  const obra = obras.find(o => o.id === id);
  if (obra) {
    document.getElementById("obraId").value = obra.id;
    document.getElementById("nombre").value = obra.nombre;
    document.getElementById("descuento").value = obra.porcentaje;
  }
}


document.getElementById("formObraSocial").addEventListener("submit", e => {
  e.preventDefault();
  const id = document.getElementById("obraId").value;
  const nombre = document.getElementById("nombre").value;

  if (id) {
    modificarObra(id, nombre);
  } else {
    agregarObra(nombre);
  }

  e.target.reset();
  document.getElementById("obraId").value = "";
  renderTabla();
});

// Mostrar descuento por nombre

document.getElementById("nombre").addEventListener("change", () => {
  const nombre = document.getElementById("nombre").value;
  document.getElementById("descuento").value = descuentosFijos[nombre] || 0;
});


if (obras.length === 0) {
  obras = [
    { id: "OS001", nombre: "OSDE", porcentaje: 20 },
    { id: "OS002", nombre: "IOMA", porcentaje: 30 },
    { id: "OS003", nombre: "Swiss Medical", porcentaje: 15 }
  ];
  guardar();
}

renderTabla();

