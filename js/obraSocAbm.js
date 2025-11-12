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

function agregarObra(nombre, porcentaje) { 
  nombre = nombre.trim();
 
// Validación: nombre vacío

  if (!nombre) {
  alert("Debe ingresar un nombre de obra social.");
    return;
  }

// Validación: evitar nombres repetidos.

const existe = obras.some(o => o.nombre.toLowerCase() === nombre.toLowerCase());
  if (existe) {
  alert("Esa obra social ya está registrada.");
    return;
}
  const porcentajeNum = parseFloat(porcentaje) || 0;

const nueva = {
id: generarId(),
nombre: nombre,
porcentaje: porcentajeNum 
};

obras.push(nueva);
guardar();
renderTabla();
alert(`Obra social "${nombre}" agregada correctamente.`);
}

// Modificar obra social 

function modificarObra(id, nuevoNombre, nuevoPorcentaje) {
const obra = obras.find(o => o.id === id);
if (obra) {
obra.nombre = nuevoNombre.trim();
    
  obra.porcentaje = parseFloat(nuevoPorcentaje) || 0; 
  guardar();
  }
}

// Eliminar obra social

function eliminarObra(id) {
obras = obras.filter(o => o.id !== id);
guardar();
renderTabla();
}

// Tabla

function renderTabla() {
    const tabla = document.getElementById("tablaObras");
    tabla.innerHTML = "";

    const medicos = JSON.parse(localStorage.getItem("medicos")) || [];

    obras.forEach(obra => {
        const fila = document.createElement("tr");

  // Buscar médico relacionado
  const medico = medicos.find(m => m.obraSocialId === obra.id); 
  

  fila.innerHTML = `
    <td>${obra.nombre}</td>
    <td>${obra.porcentaje}%</td>
    
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


// Editar

function editarObra(id) {
const obra = obras.find(o => o.id === id);
if (obra) {
document.getElementById("obraId").value = obra.id;
document.getElementById("nombre").value = obra.nombre;
document.getElementById("descuento").value = obra.porcentaje;
}
}

// Formulario submit

document.getElementById("formObraSocial").addEventListener("submit", e => {
e.preventDefault();
const id = document.getElementById("obraId").value;
const nombre = document.getElementById("nombre").value;
const descuento = document.getElementById("descuento").value;

if (id) {
modificarObra(id, nombre, descuento); 
} else {
agregarObra(nombre, descuento);
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

// Cargar obras iniciales si no hay en localStorage

if (obras.length === 0) 
  { obras = [
{ id: "OS001", nombre: "OSDE", porcentaje: 20 },
{ id: "OS002", nombre: "IOMA", porcentaje: 30 },
{ id: "OS003", nombre: "Swiss Medical", porcentaje: 15 }
 ];
 guardar();
}

renderTabla();
