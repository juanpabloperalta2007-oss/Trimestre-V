import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarCoord from "../../components/SidebarCoord";
import Footer from "../../components/Footer";
import { 
  obtenerCursos, 
  crearAsignaturaDocente, 
  obtenerAsignaturasPorCurso 
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

  // 1. Cargar datos generales al montar la vista
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const resCursos = await obtenerCursos();
        setCursos(Array.isArray(resCursos) ? resCursos : (resCursos.cursos || []));

        const resMaterias = await obtenerAsignaturasPorCurso();
        setMateriasGlobales(Array.isArray(resMaterias) ? resMaterias : (resMaterias.asignaturas || []));

        const resDocentes = await axios.get("http://localhost:5000/api/asignaturas_cursos/docentes");
        setDocentes(Array.isArray(resDocentes.data) ? resDocentes.data : []);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarInicial();
  }, []);

  // 2. Cargar las asignaciones del curso de forma independiente y segura
  useEffect(() => {
    if (!cursoSeleccionado) {
      setEstadoMaterias({});
      return;
    }

    const cargarAsignacionesDelCurso = async () => {
      try {
        // Llamamos directamente al endpoint que ya creamos en el backend
        const response = await axios.get(`http://localhost:5000/api/asignaturas_cursos/curso/${cursoSeleccionado}`);
        const asignadas = Array.isArray(response.data) ? response.data : [];
        
        const nuevoEstado = {};
        
        // Rellenamos el estado con lo que realmente arrojó la base de datos para este curso
        asignadas.forEach(item => {
          const idAsig = item.id_asignatura;
          const idDoc = item.id_docente;

          if (idAsig) {
            nuevoEstado[idAsig] = {
              activo: true,
              id_docente: idDoc ? String(idDoc) : ""
            };
          }
        });

        setEstadoMaterias(nuevoEstado);
      } catch (error) {
        console.error("Error al cargar las materias del curso:", error);
        setEstadoMaterias({});
      }
    };

    cargarAsignacionesDelCurso();
  }, [cursoSeleccionado]);

  const handleCambioCurso = (e) => {
    setCursoSeleccionado(e.target.value);
  };

  const guardarMateriaGlobal = async (e) => {
    e.preventDefault();
    if (!nombreMateria.trim()) return alert("Ingresa el nombre de la materia");

    try {
      await crearAsignaturaDocente({ nombre_asignatura: nombreMateria });
      alert("Materia creada globalmente con éxito.");
      setNombreMateria("");
      // Recargar catálogo global
      const resMaterias = await obtenerAsignaturasPorCurso();
      setMateriasGlobales(Array.isArray(resMaterias) ? resMaterias : (resMaterias.asignaturas || []));
    } catch (error) {
      console.error("Error al crear materia:", error);
      alert(error.response?.data?.error || "Hubo un error al registrar la materia.");
    }
  };

  const eliminarMateriaGlobal = async (idAsignatura) => {
    if (!window.confirm("¿Estás seguro de eliminar esta materia del catálogo global?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/asignaturas/${idAsignatura}`);
      alert("Materia eliminada con éxito.");
      const resMaterias = await obtenerAsignaturasPorCurso();
      setMateriasGlobales(Array.isArray(resMaterias) ? resMaterias : (resMaterias.asignaturas || []));
    } catch (error) {
      console.error("Error al eliminar materia global:", error);
      alert(error.response?.data?.error || "No se pudo eliminar la materia.");
    }
  };

  const handleToggleActivo = (idAsignatura) => {
    setEstadoMaterias(prev => ({
      ...prev,
      [idAsignatura]: {
        activo: !(prev[idAsignatura]?.activo),
        id_docente: prev[idAsignatura]?.id_docente || ""
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
      const asignaturasParaGuardar = [];

      materiasGlobales.forEach((m) => {
        const config = estadoMaterias[m.id_asignatura];
        if (config?.activo) {
          const docenteVal = config.id_docente && config.id_docente !== "" ? Number(config.id_docente) : null;
          
          asignaturasParaGuardar.push({
            id_asignatura: Number(m.id_asignatura),
            id_docente: docenteVal
          });
        }
      });

      await axios.post("http://localhost:5000/api/asignaturas_cursos", {
        id_curso: Number(cursoSeleccionado),
        asignaturas: asignaturasParaGuardar
      });

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
                {/* Columna 1: Catálogo Global */}
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
                                  const docenteSeleccionado = estadoMaterias[m.id_asignatura]?.id_docente || "";
                                  
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
                                          value={docenteSeleccionado}
                                          onChange={(e) => handleDocenteChange(m.id_asignatura, e.target.value)}
                                          disabled={!estaActiva}
                                        >
                                          <option value="">-- Seleccionar Docente --</option>
                                          {docentes.map((d) => (
                                            <option key={d.id_docente} value={d.id_docente}>
                                              {d.nombre_completo}
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