const PRECIO_PARTICULAR = 50000;

// Cargar desde localStorage

let obras = JSON.parse(localStorage.getItem("obrasSociales")) || [];

const tabla = document.getElementById("tablaObras");
const form = document.getElementById("obraForm");
const select = document.getElementById("obraSelect");
const infoObra = document.getElementById("infoObra");

// Guardar en localStorage

function guardar() {
    localStorage.setItem("obrasSociales", JSON.stringify(obras));
}

// Tabla 

function renderTabla() {
    tabla.innerHTML = "";
    obras.forEach((obra) => {
        let costoFinal = PRECIO_PARTICULAR - (PRECIO_PARTICULAR * obra.descuento / 100);
        tabla.innerHTML += `
            <tr>
                <td>${obra.nombre}</td>
                <td>${obra.descuento}%</td>
                <td>$${costoFinal.toLocaleString()}</td>
            </tr>
        `;
    });
}

// SELECT de obras sociales

function renderSelect() {
    select.innerHTML = `<option value="">-- Elegir --</option>`;
    obras.forEach((obra, index) => {
        select.innerHTML += `<option value="${index}">${obra.nombre}</option>`;
    });
}

// Mostrar info al seleccionar obra social

select.addEventListener("change", () => {
    const index = select.value;
    
    if (index === "") {
        infoObra.classList.add("d-none");
        infoObra.innerHTML = "";
        return;
    }

    const obra = obras[index];
    const costoFinal = PRECIO_PARTICULAR - (PRECIO_PARTICULAR * obra.descuento / 100);

    infoObra.classList.remove("d-none");
    infoObra.innerHTML = `
        <strong>Obra Social:</strong> ${obra.nombre}<br>
        <strong>Descuento:</strong> ${obra.descuento}%<br>
        <strong>Costo Final:</strong> $${costoFinal.toLocaleString()}
    `;
});

// Formulario para agregar nuevas

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nueva = {
        nombre: document.getElementById("nombre").value.trim(),
        descuento: parseInt(document.getElementById("descuento").value)
    };

    obras.push(nueva);
    guardar();
    renderTabla();
    renderSelect();
    form.reset();
});

renderTabla();
renderSelect();
