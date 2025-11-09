// ================== DATOS INICIALES DE ESPECIALIDADES ==================

const ESPECIALIDADES_INICIALES = [
  {
    especialidadId: 1,
    descripcion: "Cardiología",
    detalles: "Especialidad que se dedica al diagnóstico y tratamiento de las enfermedades del corazón y del sistema circulatorio",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 2,
    descripcion: "Pediatría",
    detalles: "Rama de la medicina que se ocupa del cuidado, desarrollo y enfermedades de los niños",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 3,
    descripcion: "Traumatología",
    detalles: "Especialidad médica que se dedica al diagnóstico, tratamiento y rehabilitación de lesiones del sistema músculo-esquelético",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 4,
    descripcion: "Ginecología",
    detalles: "Rama de la medicina que se dedica a la salud femenina, en especial a los órganos genitales femeninos",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 5,
    descripcion: "Clínica Médica",
    detalles: "Especialidad que se dedica al diagnóstico y tratamiento de enfermedades generales en adultos",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 6,
    descripcion: "Dermatología",
    detalles: "Especialidad médica que se dedica al cuidado de la piel, cabello y uñas",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 7,
    descripcion: "Neurología",
    detalles: "Especialidad que se dedica al estudio y tratamiento de las enfermedades del sistema nervioso",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  },
  {
    especialidadId: 8,
    descripcion: "Oftalmología",
    detalles: "Rama de la medicina que se ocupa de las enfermedades del ojo y de la visión",
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  }
];

// ================== INICIALIZACIÓN ==================

// Inicializar LocalStorage si no existe
function inicializarEspecialidades() {
  if (!localStorage.getItem("especialidades")) {
    localStorage.setItem("especialidades", JSON.stringify(ESPECIALIDADES_INICIALES));
    console.log("✓ Especialidades inicializadas en LocalStorage");
  }
}

// Ejecutar al cargar el script
inicializarEspecialidades();