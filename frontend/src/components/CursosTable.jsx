import { useEffect, useState } from "react";
import axios from "axios";
import {
  obtenerCursos,
  obtenerInasistencias,
} from "../services/api";

function CursosTable() {
  // =====================================================
  // ESTADOS PRINCIPALES
  // =====================================================
  const [cursos, setCursos] = useState([]);
  const [inasistencias, setInasistencias] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // ESTADOS DE CREACIÓN, DIRECTOR Y ESTUDIANTES
  // =====================================================
  const [docentes, setDocentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [directorActual, setDirectorActual] = useState("");
  const [nuevoCurso, setNuevoCurso] = useState("");
  const [directorNuevoCurso, setDirectorNuevoCurso] = useState("");

  // =====================================================
  // CARGAR DATOS
  // =====================================================
  useEffect(() => {
    cargarDatos();
    cargarDocentes();
  }, []);

  async function cargarDocentes() {
    try {
      const res = await axios.get("http://localhost:5000/api/cursos/docentes");
      setDocentes(res.data);
    } catch (err) {
      console.error("Error al obtener lista de docentes:", err);
    }
  }

  async function cargarDatos() {
    setCargando(true);
    setError("");

    // OBTENER CURSOS
    try {
      const respuestaCursos = await obtenerCursos();
      let cursosProcesados = [];

      if (Array.isArray(respuestaCursos)) {
        cursosProcesados = respuestaCursos;
      } else if (respuestaCursos && Array.isArray(respuestaCursos.cursos)) {
        cursosProcesados = respuestaCursos.cursos;
      } else if (respuestaCursos && Array.isArray(respuestaCursos.data)) {
        cursosProcesados = respuestaCursos.data;
      }

      setCursos(cursosProcesados);
    } catch (error) {
      console.error("ERROR AL CARGAR CURSOS:", error);
      setCursos([]);
      setError("No fue posible cargar los cursos.");
    }

    // OBTENER INASISTENCIAS
    try {
      const respuestaInasistencias = await obtenerInasistencias();
      let inasistenciasProcesadas = [];

      if (Array.isArray(respuestaInasistencias)) {
        inasistenciasProcesadas = respuestaInasistencias;
      } else if (respuestaInasistencias && Array.isArray(respuestaInasistencias.alertas)) {
        inasistenciasProcesadas = respuestaInasistencias.alertas;
      } else if (respuestaInasistencias && Array.isArray(respuestaInasistencias.asistencias)) {
        inasistenciasProcesadas = respuestaInasistencias.asistencias;
      } else if (respuestaInasistencias && Array.isArray(respuestaInasistencias.data)) {
        inasistenciasProcesadas = respuestaInasistencias.data;
      }

      setInasistencias(inasistenciasProcesadas);
    } catch (error) {
      console.error("ERROR AL CARGAR INASISTENCIAS:", error);
      setInasistencias([]);
    }

    setCargando(false);
  }

  // =====================================================
  // EVENTOS: CREAR Y ACTUALIZAR DIRECTOR
  // =====================================================
  const crearCursoSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoCurso.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/cursos", {
        nombre_curso: nuevoCurso.trim(),
        id_director: directorNuevoCurso || null,
      });
      setNuevoCurso("");
      setDirectorNuevoCurso("");
      await cargarDatos();
      alert("Curso creado exitosamente.");
    } catch (err) {
      console.error("Error al crear curso:", err);
    }
  };

  const cambiarDirectorSubmit = async (e) => {
    const idNuevoDirector = e.target.value;
    setDirectorActual(idNuevoDirector);

    try {
      await axios.put(`http://localhost:5000/api/cursos/${cursoSeleccionado}/director`, {
        id_director: idNuevoDirector || null,
      });
      await cargarDatos();
    } catch (err) {
      console.error("Error al actualizar director:", err);
    }
  };

  // =====================================================
  // MANEJAR SELECCIÓN DE CURSO
  // =====================================================
  const handleSeleccionarCurso = async (idCurso) => {
    setCursoSeleccionado(idCurso);

    if (!idCurso) {
      setEstudiantes([]);
      setDirectorActual("");
      return;
    }

    const cursoObjeto = cursos.find((c) => String(obtenerIdCurso(c)) === String(idCurso));
    setDirectorActual(cursoObjeto?.id_director || "");

    try {
      const res = await axios.get(`http://localhost:5000/api/cursos/${idCurso}/estudiantes`);
      setEstudiantes(res.data);
    } catch (err) {
      console.error("Error al obtener estudiantes del curso:", err);
      setEstudiantes([]);
    }
  };

  // =====================================================
  // AUXILIARES
  // =====================================================
  function obtenerIdCurso(curso) {
    return curso.id_curso ?? curso.id ?? curso.codigo ?? curso.nombre_curso ?? "";
  }

  function obtenerNombreCurso(curso) {
    return curso.nombre_curso ?? curso.nombre ?? curso.descripcion ?? `Curso ${obtenerIdCurso(curso)}`;
  }

  function perteneceAlCurso(inasistencia, cursoSeleccionado) {
    if (!cursoSeleccionado) return false;

    const curso =
      inasistencia.curso ??
      inasistencia.nombre_curso ??
      inasistencia.id_curso ??
      inasistencia.id_asignatura_curso ??
      "";

    const cursosDeLaInasistencia = String(curso)
      .split(",")
      .map((valor) => valor.trim().toLowerCase())
      .filter(Boolean);

    const seleccionado = String(cursoSeleccionado).trim().toLowerCase();

    if (cursosDeLaInasistencia.includes(seleccionado)) {
      return true;
    }

    const cursoSeleccionadoObjeto = cursos.find(
      (cursoActual) => String(obtenerIdCurso(cursoActual)) === String(cursoSeleccionado)
    );

    if (cursoSeleccionadoObjeto) {
      const nombre = obtenerNombreCurso(cursoSeleccionadoObjeto).trim().toLowerCase();
      if (cursosDeLaInasistencia.includes(nombre)) {
        return true;
      }
    }

    return false;
  }

  const listaInasistencias = inasistencias.filter((inasistencia) =>
    perteneceAlCurso(inasistencia, cursoSeleccionado)
  );

  return (
    <>
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* =================================================
          CREAR NUEVO CURSO
      ================================================= */}
      <div className="card shadow mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">Crear Nuevo Curso</h5>
        </div>
        <div className="card-body">
          <form onSubmit={crearCursoSubmit} className="row g-3 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre del curso (Ej: 1001, 1102)"
                value={nuevoCurso}
                onChange={(e) => setNuevoCurso(e.target.value)}
                required
              />
            </div>
            <div className="col-md-5">
              <select
                className="form-select"
                value={directorNuevoCurso}
                onChange={(e) => setDirectorNuevoCurso(e.target.value)}
              >
                <option value="">Seleccionar Director de Curso (Opcional)</option>
                {docentes.map((d) => (
                  <option key={d.id_usuario} value={d.id_usuario}>
                    {d.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100 fw-bold">
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =================================================
          CARD DE CURSOS
      ================================================= */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Cursos</h5>
        </div>

        <div className="card-body">
          {cargando ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 mb-0">Cargando cursos...</p>
            </div>
          ) : (
            <>
              <select
                className="form-select mb-3"
                value={cursoSeleccionado}
                onChange={(e) => handleSeleccionarCurso(e.target.value)}
              >
                <option value="">Seleccione un curso</option>
                {cursos.map((curso) => {
                  const idCurso = obtenerIdCurso(curso);
                  const nombreCurso = obtenerNombreCurso(curso);
                  const directorNombre = curso.director ? ` - (Director: ${curso.director})` : " - (Sin Director)";

                  return (
                    <option key={idCurso} value={idCurso}>
                      {nombreCurso} {directorNombre}
                    </option>
                  );
                })}
              </select>

              {/* ASIGNACIÓN DIRECTA DE DIRECTOR */}
              {cursoSeleccionado && (
                <div className="p-3 border rounded bg-light">
                  <label className="form-label fw-bold text-dark">Director de Curso Asignado:</label>
                  <select
                    className="form-select"
                    value={directorActual}
                    onChange={cambiarDirectorSubmit}
                  >
                    <option value="">Sin Director Asignado</option>
                    {docentes.map((d) => (
                      <option key={d.id_usuario} value={d.id_usuario}>
                        {d.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {!cargando && cursos.length === 0 && !error && (
            <div className="alert alert-warning mt-3 mb-0">No hay cursos registrados.</div>
          )}
        </div>
      </div>

      {/* =================================================
          ESTUDIANTES MATRICULADOS
      ================================================= */}
      {cursoSeleccionado && (
        <div className="card shadow mb-4">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Estudiantes Matriculados</h5>
          </div>
          <div className="card-body">
            {estudiantes.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Nombre Completo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map((e) => (
                      <tr key={e.id_estudiante}>
                        <td>{e.numero_documento}</td>
                        <td>
                          {e.primer_nombre} {e.primer_apellido}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center my-2">
                No hay estudiantes registrados o asignados a este curso.
              </p>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          INASISTENCIAS DEL CURSO
      ================================================= */}
      {cursoSeleccionado && (
        <div className="card shadow">
          <div className="card-header bg-success text-white">
            <div className="d-flex justify-content-between align-items-center">
              <span>Inasistencias del curso</span>
              <span className="badge bg-light text-success">{listaInasistencias.length}</span>
            </div>
          </div>

          <div className="card-body">
            {listaInasistencias.length === 0 ? (
              <div className="alert alert-info mb-0">
                No hay inasistencias registradas para este curso.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Documento</th>
                      <th>Estudiante</th>
                      <th>Curso</th>
                      <th className="text-center">Inasistencias</th>
                      <th className="text-center">Tardanzas</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaInasistencias.map((inasistencia) => {
                      const id = inasistencia.id_estudiante ?? inasistencia.id ?? Math.random();
                      const nombre =
                        inasistencia.estudiante ??
                        inasistencia.nombre_estudiante ??
                        "Estudiante";
                      const documento =
                        inasistencia.documento ??
                        inasistencia.numero_documento ??
                        "Sin documento";
                      const cantidad = Number(inasistencia.inasistencias ?? 0);
                      const tardanzas = Number(inasistencia.tardanzas ?? 0);
                      const estado = inasistencia.estado ?? "Seguimiento";

                      return (
                        <tr key={id}>
                          <td>{documento}</td>
                          <td>
                            <strong>{nombre}</strong>
                          </td>
                          <td>
                            <span className="badge bg-info text-dark">
                              {inasistencia.curso ?? "Sin curso"}
                            </span>
                          </td>
                          <td className="text-center">
                            <span
                              className={
                                cantidad >= 10
                                  ? "badge bg-danger fs-6"
                                  : cantidad >= 5
                                  ? "badge bg-warning text-dark fs-6"
                                  : "badge bg-secondary fs-6"
                              }
                            >
                              {cantidad}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-secondary fs-6">{tardanzas}</span>
                          </td>
                          <td>
                            <span
                              className={
                                estado === "Pérdida"
                                  ? "badge bg-danger"
                                  : estado === "Exceso"
                                  ? "badge bg-warning text-dark"
                                  : "badge bg-secondary"
                              }
                            >
                              {estado}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CursosTable;