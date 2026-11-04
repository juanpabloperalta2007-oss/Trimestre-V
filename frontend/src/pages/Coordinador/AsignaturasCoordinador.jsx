import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarCoord from "../../components/SidebarCoord";
import Footer from "../../components/Footer";
import { 
  obtenerCursos, 
  crearAsignaturaDocente, 
  asignarMateriaACurso, 
  obtenerAsignaturasPorCurso, 
  obtenerAsignaturasPorCursoDocente,
  obtenerUsuarios 
} from "../../services/api";
import axios from "axios";

function AsignaturasCoordinador() {
  const [cursos, setCursos] = useState([]);
  const [materiasGlobales, setMateriasGlobales] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [nombreMateria, setNombreMateria] = useState("");
  
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [estadoMaterias, setEstadoMaterias] = useState({}); 
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar datos iniciales (cursos, catálogo global y lista de docentes)
  const cargarDatosIniciales = async () => {
    try {
      const resCursos = await obtenerCursos();
      setCursos(Array.isArray(resCursos) ? resCursos : (resCursos.cursos || []));

      const resMaterias = await obtenerAsignaturasPorCurso();
      setMateriasGlobales(Array.isArray(resMaterias) ? resMaterias : (resMaterias.asignaturas || []));

      const resUsuarios = await obtenerUsuarios();
      const listaUsuarios = Array.isArray(resUsuarios) ? resUsuarios : (resUsuarios.usuarios || []);
      const soloDocentes = listaUsuarios.filter(u => Number(u.id_cargo) === 3);
      setDocentes(soloDocentes);

    } catch (error) {
      console.error("Error al cargar datos de coordinación:", error);
    } finally {
      setCargando(false);
    }
  };

  // Cada vez que cambia el curso seleccionado, cargamos sus materias ya guardadas
  useEffect(() => {
    if (!cursoSeleccionado) {
      setEstadoMaterias({});
      return;
    }

    const cargarAsignacionesCurso = async () => {
      try {
        const resAsignadas = await obtenerAsignaturasPorCursoDocente(cursoSeleccionado);
        const asignadas = Array.isArray(resAsignadas) ? resAsignadas : [];
        
        const nuevoEstado = {};
        asignadas.forEach(item => {
          nuevoEstado[item.id_asignatura] = {
            activo: true,
            id_docente: item.id_usuario ? String(item.id_usuario) : (item.id_docente ? String(item.id_docente) : "")
          };
        });
        setEstadoMaterias(nuevoEstado);
      } catch (error) {
        console.error("Error al cargar asignaciones del curso:", error);
      }
    };

    cargarAsignacionesCurso();
  }, [cursoSeleccionado]);

  const handleCambioCurso = (e) => {
    const idCurso = e.target.value;
    setCursoSeleccionado(idCurso);
  };

  const guardarMateriaGlobal = async (e) => {
    e.preventDefault();
    if (!nombreMateria.trim()) return alert("Ingresa el nombre de la materia");

    try {
      await crearAsignaturaDocente({ nombre_asignatura: nombreMateria });
      alert("Materia creada globalmente con éxito.");
      setNombreMateria("");
      cargarDatosIniciales();
    } catch (error) {
      console.error("Error al crear materia:", error);
      alert(error.response?.data?.error || "Hubo un error al registrar la materia.");
    }
  };

  // Función para eliminar una materia del catálogo global
  const eliminarMateriaGlobal = async (idAsignatura) => {
    if (!window.confirm("¿Estás seguro de eliminar esta materia del catálogo global? Se borrará de todas las asignaciones.")) return;

    try {
      await axios.delete(`http://localhost:5000/api/asignaturas/${idAsignatura}`);
      alert("Materia eliminada del catálogo con éxito.");
      cargarDatosIniciales();
    } catch (error) {
      console.error("Error al eliminar materia global:", error);
      alert(error.response?.data?.error || "No se pudo eliminar la materia.");
    }
  };

  const handleToggleActivo = (idAsignatura) => {
    setEstadoMaterias(prev => ({
      ...prev,
      [idAsignatura]: {
        ...prev[idAsignatura],
        activo: !(prev[idAsignatura]?.activo)
      }
    }));
  };

  const handleDocenteChange = (idAsignatura, idDocente) => {
    setEstadoMaterias(prev => ({
      ...prev,
      [idAsignatura]: {
        ...prev[idAsignatura],
        id_docente: idDocente
      }
    }));
  };

  const guardarConfiguracionCurso = async (e) => {
    e.preventDefault();
    if (!cursoSeleccionado) {
      alert("Selecciona un curso primero.");
      return;
    }

    try {
      for (const [id_asignatura, config] of Object.entries(estadoMaterias)) {
        if (config?.activo) {
          await asignarMateriaACurso({
            id_asignatura: Number(id_asignatura),
            id_curso: Number(cursoSeleccionado),
            id_docente: config.id_docente ? Number(config.id_docente) : null
          });
        }
      }

      alert("¡Configuración de materias y docentes guardada con éxito!");
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert(error.response?.data?.error || "Error al procesar la asignación.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />
      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100 align-items-stretch">
          <SidebarCoord />
          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Gestión Académica de Materias y Docentes por Curso</h2>

            {cargando ? (
              <div className="text-center py-5">
                <p className="text-muted fw-bold">Cargando panel de coordinación...</p>
              </div>
            ) : (
              <div className="row">
                {/* Columna 1: Registrar y Administrar Catálogo Global de Materias */}
                <div className="col-md-5 mb-4">
                  <div className="card shadow border-0 h-100">
                    <div className="card-header bg-primary text-white py-3">
                      <h4 className="mb-0">1. Catálogo Global de Materias</h4>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <form onSubmit={guardarMateriaGlobal} className="mb-4">
                        <div className="mb-3">
                          <label className="form-label fw-bold">Nueva Materia Global</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ej: Física, Cálculo..."
                            value={nombreMateria}
                            onChange={(e) => setNombreMateria(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary w-100">
                          Crear en Catálogo
                        </button>
                      </form>

                      <hr />

                      <label className="form-label fw-bold">Materias Registradas:</label>
                      <div className="table-responsive border rounded bg-white flex-grow-1" style={{ maxHeight: "220px", overflowY: "auto" }}>
                        <table className="table table-sm table-striped align-middle mb-0">
                          <tbody>
                            {materiasGlobales.length === 0 ? (
                              <tr>
                                <td className="text-center text-muted py-3">No hay materias globales.</td>
                              </tr>
                            ) : (
                              materiasGlobales.map((m) => (
                                <tr key={m.id_asignatura}>
                                  <td className="ps-3">{m.nombre_asignatura}</td>
                                  <td className="text-end pe-3">
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => eliminarMateriaGlobal(m.id_asignatura)}
                                      title="Eliminar materia global"
                                    >
                                      🗑️ Eliminar
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2: Configuración por Curso */}
                <div className="col-md-7 mb-4">
                  <div className="card shadow border-0 h-100">
                    <div className="card-header bg-success text-white py-3">
                      <h4 className="mb-0">2. Configurar Materias para un Curso</h4>
                    </div>
                    <div className="card-body">
                      <div className="mb-4">
                        <label className="form-label fw-bold">Seleccionar Curso</label>
                        <select
                          className="form-select"
                          value={cursoSeleccionado}
                          onChange={handleCambioCurso}
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

                      {cursoSeleccionado && (
                        <form onSubmit={guardarConfiguracionCurso}>
                          <h5 className="text-secondary mb-3">Asignar a este Curso:</h5>
                          <div className="table-responsive mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                            <table className="table table-bordered align-middle">
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: "15%" }} className="text-center">Activa</th>
                                  <th style={{ width: "40%" }}>Materia</th>
                                  <th style={{ width: "45%" }}>Docente Encargado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {materiasGlobales.map((m) => {
                                  const estaActiva = estadoMaterias[m.id_asignatura]?.activo || false;
                                  return (
                                    <tr key={m.id_asignatura}>
                                      <td className="text-center">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={estaActiva}
                                          onChange={() => handleToggleActivo(m.id_asignatura)}
                                          style={{ transform: "scale(1.2)" }}
                                        />
                                      </td>
                                      <td className="fw-semibold">{m.nombre_asignatura}</td>
                                      <td>
                                        <select
                                          className="form-select form-select-sm"
                                          value={estadoMaterias[m.id_asignatura]?.id_docente || ""}
                                          onChange={(e) => handleDocenteChange(m.id_asignatura, e.target.value)}
                                          disabled={!estaActiva}
                                        >
                                          <option value="">-- Seleccionar Docente --</option>
                                          {docentes.map((d) => (
                                            <option key={d.id_usuario} value={d.id_usuario}>
                                              {d.primer_nombre} {d.primer_apellido}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <button type="submit" className="btn btn-success w-100">
                            Guardar Configuración del Curso
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AsignaturasCoordinador;