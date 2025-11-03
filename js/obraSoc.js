

// precio

const PRECIO_BASE = 50000; // Precio consulta sin obra social
let ordenColumna = "nombre";
let ordenAscendente = true;

// funciones

function obtenerObras() {
    return JSON.parse(localStorage.getItem("obrasSociales")) || [];
}

function guardarObras(obras) {
    localStorage.setItem("obrasSociales", JSON.stringify(obras));
}


// ordenar 

function ordenarObras(obras) {
    return obras.sort((a, b) => {
        let valorA, valorB;

        switch (ordenColumna) {
            case "descuento":
                valorA = a.descuento;
                valorB = b.descuento;
                break;
            case "precioFinal":
                valorA = PRECIO_BASE - (PRECIO_BASE * a.descuento / 100);
                valorB = PRECIO_BASE - (PRECIO_BASE * b.descuento / 100);
                break;
            default:
                valorA = a.nombre.toLowerCase();
                valorB = b.nombre.toLowerCase();
        }

        if (valorA < valorB) return ordenAscendente ? -1 : 1;
        if (valorA > valorB) return ordenAscendente ? 1 : -1;
        return 0;
    });
}


// actualizar tabla

function actualizarTabla() {
    let obras = obtenerObras();

    
    const filtro = document.getElementById("buscarInput").value.toLowerCase();
    if (filtro.trim() !== "") {
        obras = obras.filter(o => o.nombre.toLowerCase().includes(filtro));
    }

    // Ordenar antes de mostrar
    obras = ordenarObras(obras);

    const tabla = document.getElementById("tablaObrasSociales");
    tabla.innerHTML = "";

    obras.forEach((obra, index) => {
        const precioFinal = PRECIO_BASE - (PRECIO_BASE * obra.descuento / 100);

        const fila = `
            <tr>
                <td class="fw-semibold">${obra.nombre}</td>
                <td>${obra.descuento}%</td>
                <td>$${PRECIO_BASE.toLocaleString()}</td>
                <td class="fw-bold text-success">$${precioFinal.toLocaleString()}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarObra(${index})">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarObra(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tabla.innerHTML += fila;
    });
}


// guardar y editar

document.getElementById("formObraSocial").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = document.getElementById("obraId").value;
    const nombre = document.getElementById("nombre").value.trim();
    const descuento = parseInt(document.getElementById("descuento").value);

    if (descuento < 0 || descuento > 100) {
        alert("El descuento debe estar entre 0% y 100%");
        return;
    }

    let obras = obtenerObras();

    // Validar repetidos
    const existe = obras.some((o, idx) => o.nombre.toLowerCase() === nombre.toLowerCase() && idx != id);
    if (existe) {
        alert("❌ Ya existe una obra social con ese nombre");
        return;
    }

    if (id === "") {
        obras.push({ nombre, descuento });
    } else {
        obras[id] = { nombre, descuento };
    }

    guardarObras(obras);
    actualizarTabla();
    this.reset();
    document.getElementById("obraId").value = "";
});


// editar

function editarObra(index) {
    const obras = obtenerObras();
    const obra = obras[index];

    document.getElementById("obraId").value = index;
    document.getElementById("nombre").value = obra.nombre;
    document.getElementById("descuento").value = obra.descuento;
}


// eliminar

function eliminarObra(index) {
    if (confirm("¿Seguro que deseas eliminar esta obra social?")) {
        let obras = obtenerObras();
        obras.splice(index, 1);
        guardarObras(obras);
        actualizarTabla();
    }
}


// buscador o.s

document.getElementById("buscarInput").addEventListener("input", actualizarTabla);


// orden 

document.querySelectorAll("th[data-columna]").forEach(th => {
    th.addEventListener("click", () => {
        const columna = th.getAttribute("data-columna");
        if (ordenColumna === columna) {
            ordenAscendente = !ordenAscendente; // Invierte el orden
        } else {
            ordenColumna = columna;
            ordenAscendente = true; // Reset ascendente
        }
        actualizarTabla();
    });
});


// carga 
document.addEventListener("DOMContentLoaded", actualizarTabla);
