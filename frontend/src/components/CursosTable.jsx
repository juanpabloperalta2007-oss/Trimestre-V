import { useEffect, useState } from "react";
import axios from "axios";
import {
  obtenerCursos,
  obtenerAsignaturasPorCursoDocente,
  obtenerListaAsistencia,
} from "../services/api";

function CursosTable() {
  // =====================================================
  // ESTADOS PRINCIPALES
  // =====================================================
  const [cursos, setCursos] = useState([]);
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
  // ESTADOS PARA MATRICULAR ESTUDIANTES
  // =====================================================
  const [mostrarModalMatricula, setMostrarModalMatricula] = useState(false);
  const [documentoEstudiante, setDocumentoEstudiante] = useState("");
  const [primerNombre, setPrimerNombre] = useState("");
  const [segundoNombre, setSegundoNombre] = useState("");
  const [primerApellido, setPrimerApellido] = useState("");
  const [segundoApellido, setSegundoApellido] = useState("");
  const [registrandoMatricula, setRegistrandoMatricula] = useState(false);

  // =====================================================
  // ESTADOS DE MATERIAS Y AUDITORÍA DE INASISTENCIAS
  // =====================================================
  const [materiasCurso, setMateriasCurso] = useState([]);
  const [materiaActiva, setMateriaActiva] = useState(null);
  const [fechaConsulta, setFechaConsulta] = useState(new Date().toISOString().split("T")[0]);
  const [detalleAsistencias, setDetalleAsistencias] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

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
    setMateriaActiva(null);
    setDetalleAsistencias([]);
    setMostrarModalMatricula(false);

    if (!idCurso) {
      setEstudiantes([]);
      setDirectorActual("");
      setMateriasCurso([]);
      return;
    }

    const cursoObjeto = cursos.find((c) => String(obtenerIdCurso(c)) === String(idCurso));
    setDirectorActual(cursoObjeto?.id_director || "");

    // 1. Obtener estudiantes matriculados
    await cargarEstudiantesCurso(idCurso);

    // 2. Obtener materias asignadas a este curso
    try {
      const resMaterias = await axios.get(`http://localhost:5000/api/asignaturas_cursos/curso/${idCurso}`);
      setMateriasCurso(Array.isArray(resMaterias.data) ? resMaterias.data : []);
    } catch (err) {
      console.error("Error al obtener materias del curso:", err);
      setMateriasCurso([]);
    }
  };

  const cargarEstudiantesCurso = async (idCurso) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/cursos/${idCurso}/estudiantes`);
      let listaEstudiantes = Array.isArray(res.data) ? res.data : [];

      // ORDENAR ALFABÉTICAMENTE POR PRIMER APELLIDO
      listaEstudiantes.sort((a, b) => {
        const apellidoA = (a.primer_apellido || "").toLowerCase();
        const apellidoB = (b.primer_apellido || "").toLowerCase();
        return apellidoA.localeCompare(apellidoB);
      });

      setEstudiantes(listaEstudiantes);
    } catch (err) {
      console.error("Error al obtener estudiantes del curso:", err);
      setEstudiantes([]);
    }
  };

  // =====================================================
  // MATRICULAR ESTUDIANTE EN EL CURSO
  // =====================================================
  const handleMatricularEstudiante = async (e) => {
    e.preventDefault();
    if (!documentoEstudiante.trim() || !primerNombre.trim() || !primerApellido.trim()) {
      alert("Por favor complete los campos obligatorios (Documento, Primer Nombre y Primer Apellido).");
      return;
    }

    try {
      setRegistrandoMatricula(true);

      // Código de lista automático basado en la cantidad actual de estudiantes + 1
      const codigoListaSugerido = estudiantes.length + 1;

      const payload = {
        tipo_documento: "tarjeta identidad",
        numero_documento: documentoEstudiante.trim(),
        primer_nombre: primerNombre.trim(),
        segundo_nombre: segundoNombre.trim() || null,
        primer_apellido: primerApellido.trim(),
        segundo_apellido: segundoApellido.trim() || null,
        codigo_lista: codigoListaSugerido,
        id_curso: cursoSeleccionado
      };

      await axios.post(`http://localhost:5000/api/estudiantes`, payload);

      alert("¡Estudiante matriculado exitosamente!");
      setDocumentoEstudiante("");
      setPrimerNombre("");
      setSegundoNombre("");
      setPrimerApellido("");
      setSegundoApellido("");
      setMostrarModalMatricula(false);

      await cargarEstudiantesCurso(cursoSeleccionado);
    } catch (err) {
      console.error("Detalle completo del error:", err.response);
      const mensajeServidor = err.response?.data?.error || err.response?.data?.mensaje || err.message;
      alert(`Error al matricular: ${mensajeServidor}`);
    } finally {
      setRegistrandoMatricula(false);
    }
  };

  // =====================================================
  // AUDITORÍA DE INASISTENCIAS POR MATERIA
  // =====================================================
  const abrirDetalleMateria = async (materia) => {
    setMateriaActiva(materia);
    cargarAsistenciasMateria(materia.id_asignatura_curso, fechaConsulta);
  };

  const cargarAsistenciasMateria = async (idAsignaturaCurso, fecha) => {
    setCargandoDetalle(true);
    try {
      const res = await obtenerListaAsistencia(idAsignaturaCurso, fecha);
      setDetalleAsistencias(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error al obtener detalle de inasistencias:", error);
      setDetalleAsistencias([]);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleCambioFecha = (e) => {
    const nuevaFecha = e.target.value;
    setFechaConsulta(nuevaFecha);
    if (materiaActiva) {
      cargarAsistenciasMateria(materiaActiva.id_asignatura_curso, nuevaFecha);
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
          CARD DE CURSOS Y DIRECTOR
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
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0">Estudiantes Matriculados</h5>
            <button 
              className="btn btn-success btn-sm fw-bold"
              onClick={() => setMostrarModalMatricula(!mostrarModalMatricula)}
            >
              {mostrarModalMatricula ? "✕ Cerrar Formulario" : "+ Matricular Estudiante"}
            </button>
          </div>
          <div className="card-body">
            
            {/* FORMULARIO DESPLEGABLE PARA MATRICULAR */}
            {mostrarModalMatricula && (
              <div className="card border-success mb-4 p-3 bg-light">
                <h6 className="fw-bold text-success mb-3">Registrar Nuevo Estudiante en este Curso</h6>
                <form onSubmit={handleMatricularEstudiante} className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label small fw-bold">Número de Documento</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Ej: 1500286477"
                      value={documentoEstudiante}
                      onChange={(e) => setDocumentoEstudiante(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Primer Nombre *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Ej: Jorge"
                      value={primerNombre}
                      onChange={(e) => setPrimerNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Segundo Nombre (Opcional)</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Ej: Luis"
                      value={segundoNombre}
                      onChange={(e) => setSegundoNombre(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Primer Apellido *</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Ej: Salgado"
                      value={primerApellido}
                      onChange={(e) => setPrimerApellido(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Segundo Apellido (Opcional)</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Ej: Gomez"
                      value={segundoApellido}
                      onChange={(e) => setSegundoApellido(e.target.value)}
                    />
                  </div>
                  <div className="col-12 text-end">
                    <button 
                      type="submit" 
                      className="btn btn-success btn-sm px-4 fw-bold"
                      disabled={registrandoMatricula}
                    >
                      {registrandoMatricula ? "Guardando..." : "Guardar Matrícula"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {estudiantes.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "8%" }} className="text-center">Código #</th>
                      <th>Documento</th>
                      <th>Apellidos y Nombres</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map((e, index) => (
                      <tr key={e.id_estudiante}>
                        <td className="text-center fw-bold text-primary">{index + 1}</td>
                        <td>{e.numero_documento}</td>
                        <td className="fw-semibold">
                          {e.primer_apellido} {e.segundo_apellido || ""} {e.primer_nombre} {e.segundo_nombre || ""}
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
          INASISTENCIAS POR MATERIA DEL CURSO (TARJETAS)
      ================================================= */}
      {cursoSeleccionado && !materiaActiva && (
        <div className="card shadow mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Inasistencias por Materia del Curso</h5>
          </div>
          <div className="card-body">
            {materiasCurso.length === 0 ? (
              <div className="alert alert-warning mb-0 text-center">
                Este curso no tiene materias ni docentes asignados todavía.
              </div>
            ) : (
              <div className="row">
                {materiasCurso.map((m) => (
                  <div className="col-md-4 mb-3" key={m.id_asignatura_curso}>
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h5 className="fw-bold text-primary">{m.nombre_asignatura}</h5>
                          <p className="text-muted small mb-2">Área: {m.nombre_area || "General"}</p>
                          <hr />
                        </div>
                        <button 
                          className="btn btn-outline-success w-100 mt-2"
                          onClick={() => abrirDetalleMateria(m)}
                        >
                          🔍 Revisar Inasistencias
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          VISTA DETALLADA DE INASISTENCIAS (AL CLIC EN UNA MATERIA)
      ================================================= */}
      {cursoSeleccionado && materiaActiva && (
        <div className="card shadow mb-4">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0">Materia: {materiaActiva.nombre_asignatura}</h5>
            <button className="btn btn-light btn-sm fw-bold" onClick={() => setMateriaActiva(null)}>
              ← Volver a las Materias
            </button>
          </div>
          <div className="card-body">
            <div className="row mb-4 align-items-center">
              <div className="col-md-4">
                <label className="form-label fw-bold">Filtrar por Fecha:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={fechaConsulta} 
                  onChange={handleCambioFecha} 
                />
              </div>
            </div>

            {cargandoDetalle ? (
              <div className="text-center py-4 text-muted fw-bold">Cargando registros...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "8%" }} className="text-center">Código #</th>
                      <th>Documento</th>
                      <th>Estudiante</th>
                      <th className="text-center">Estado (Asistencia)</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleAsistencias.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-3">
                          No hay registros de asistencia para esta fecha en esta materia.
                        </td>
                      </tr>
                    ) : (
                      detalleAsistencias.map((est, idx) => (
                        <tr key={est.id_estudiante}>
                          <td className="text-center fw-bold text-primary">{idx + 1}</td>
                          <td>{est.numero_documento}</td>
                          <td className="fw-semibold">
                            {est.primer_apellido} {est.segundo_apellido || ""} {est.primer_nombre} {est.segundo_nombre || ""}
                          </td>
                          <td className="text-center">
                            {est.estado === 'A' && <span className="badge bg-danger">Ausente (Falta)</span>}
                            {est.estado === 'P' && <span className="badge bg-success">Presente</span>}
                            {est.estado === 'T' && <span className="badge bg-warning text-dark">Tardanza</span>}
                            {est.estado === 'J' && <span className="badge bg-info text-dark">Justificado</span>}
                            {!est.estado && <span className="badge bg-secondary">Sin registrar</span>}
                          </td>
                          <td>{est.observaciones || "Sin observaciones"}</td>
                        </tr>
                      ))
                    )}
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