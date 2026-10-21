import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarCoord from "../../components/SidebarCoord"; // Asegúrate de que la ruta a tu sidebar de coordinador sea correcta
import Footer from "../../components/Footer";
import { obtenerCursos, obtenerAsignaturasPorCurso, crearAsignaturaDocente, asignarMateriaACurso } from "../../services/api";

function AsignaturasCoordinador() {
  const [materiasGlobales, setMateriasGlobales] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [nombreMateria, setNombreMateria] = useState("");
  
  // Estados para el formulario de asignación
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const resCursos = await obtenerCursos();
      setCursos(resCursos.cursos || resCursos);
      
      // Opcional: Cargar materias globales existentes si tienes un endpoint para listar todas
      setCargando(false);
    } catch (error) {
      console.error("Error al cargar datos para el coordinador:", error);
      setCargando(false);
    }
  };

  const guardarMateriaGlobal = async (e) => {
    e.preventDefault();
    if (!nombreMateria) return alert("Ingresa el nombre de la materia");

    try {
      await crearAsignaturaDocente({ nombre_asignatura: nombreMateria });
      alert("Materia creada globalmente con éxito.");
      setNombreMateria("");
    } catch (error) {
      console.error("Error al crear materia:", error);
      alert("Hubo un error al registrar la materia.");
    }
  };

  const asignarACurso = async (e) => {
    e.preventDefault();
    if (!cursoSeleccionado || !materiaSeleccionada) {
      alert("Selecciona un curso y una materia.");
      return;
    }

    try {
      await asignarMateriaACurso({
        id_asignatura: materiaSeleccionada,
        id_curso: cursoSeleccionado
      });
      alert("Materia asignada al curso correctamente.");
      setCursoSeleccionado("");
      setMateriaSeleccionada("");
    } catch (error) {
      console.error("Error al asignar:", error);
      alert(error.response?.data?.error || "Error al asignar la materia al curso.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />
      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarCoord />
          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Gestión Académica de Materias (Coordinación)</h2>

            <div className="row">
              {/* Columna 1: Crear Materia Global */}
              <div className="col-md-6 mb-4">
                <div className="card shadow border-0 h-100">
                  <div className="card-header bg-primary text-white py-3">
                    <h4 className="mb-0">1. Registrar Materia Global</h4>
                  </div>
                  <div className="card-body">
                    <form onSubmit={guardarMateriaGlobal}>
                      <div className="mb-3">
                        <label className="form-label">Nombre de la Materia</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Biología, Química..."
                          value={nombreMateria}
                          onChange={(e) => setNombreMateria(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-100">
                        Crear Materia
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Columna 2: Asignar Materia a Curso */}
              <div className="col-md-6 mb-4">
                <div className="card shadow border-0 h-100">
                  <div className="card-header bg-success text-white py-3">
                    <h4 className="mb-0">2. Asignar Materia a un Curso</h4>
                  </div>
                  <div className="card-body">
                    <form onSubmit={asignarACurso}>
                      <div className="mb-3">
                        <label className="form-label">Seleccionar Curso</label>
                        <select
                          className="form-select"
                          value={cursoSeleccionado}
                          onChange={(e) => setCursoSeleccionado(e.target.value)}
                          required
                        >
                          <option value="">Seleccione un curso...</option>
                          {cursos.map((c) => (
                            <option key={c.id_curso} value={c.id_curso}>
                              {c.nombre_curso}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">ID de la Materia o Catálogo</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="ID de la asignatura"
                          value={materiaSeleccionada}
                          onChange={(e) => setMateriaSeleccionada(e.target.value)}
                          required
                        />
                        <small className="text-muted">Ingresa el ID de la materia creada previamente.</small>
                      </div>

                      <button type="submit" className="btn btn-success w-100">
                        Asignar al Curso
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AsignaturasCoordinador;