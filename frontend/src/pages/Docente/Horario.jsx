import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import API, { obtenerCursos } from "../../services/api";

function Horario() {
  const [consulta, setConsulta] = useState({ id_curso: "", nombre_curso: "", anio: "2026" });
  const [materiasCurso, setMateriasCurso] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [esDirectorDelCurso, setEsDirectorDelCurso] = useState(false);
  
  const [grillaHorario, setGrillaHorario] = useState({});

  const bloquesHorarios = [
    { hora: "07:00 - 07:50", tipo: "clase", index: 0 },
    { hora: "07:50 - 08:40", tipo: "clase", index: 1 },
    { hora: "08:40 - 09:30", tipo: "clase", index: 2 },
    { hora: "09:30 - 10:20", tipo: "clase", index: 3 },
    { hora: "10:20 - 11:10", tipo: "receso" },
    { hora: "11:10 - 12:00", tipo: "clase", index: 4 },
    { hora: "12:00 - 12:50", tipo: "clase", index: 5 },
    { hora: "12:50 - 13:40", tipo: "clase", index: 6 },
  ];

  const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes"];

  useEffect(() => {
    const datosGuardados = localStorage.getItem("horarioConsulta");
    if (datosGuardados) {
      const parsed = JSON.parse(datosGuardados);
      setConsulta(parsed);

      const horarioGuardado = localStorage.getItem(`horarioPersonalizado_${parsed.id_curso}`);
      if (horarioGuardado) {
        setGrillaHorario(JSON.parse(horarioGuardado));
      }

      verificarDirectorYCargarMaterias(parsed.id_curso);
    } else {
      setCargando(false);
    }
  }, []);

  const verificarDirectorYCargarMaterias = async (idCurso) => {
    try {
      setCargando(true);
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "{}");
      const idUsuarioActual = Number(usuarioLogueado.id_usuario || usuarioLogueado.id || usuarioLogueado.id_persona);

      // 1. Consultamos los cursos reales para ver quién es el director de este curso
      const resCursos = await obtenerCursos();
      const listaCursos = Array.isArray(resCursos) ? resCursos : (resCursos?.cursos || []);
      const cursoActual = listaCursos.find((c) => Number(c.id_curso) === Number(idCurso));

      if (cursoActual && idUsuarioActual) {
        // Comparamos contra los posibles nombres de columna del director en tu tabla cursos
        const idDirectorCurso = Number(
          cursoActual.id_director || 
          cursoActual.id_docente || 
          cursoActual.id_usuario || 
          cursoActual.director_id
        );
        
        setEsDirectorDelCurso(idDirectorCurso === idUsuarioActual);
      } else {
        setEsDirectorDelCurso(false);
      }

      // 2. Cargamos las materias asignadas a ese curso
      const respuesta = await API.get(`/asignaturas/curso/${idCurso}`);
      let lista = Array.isArray(respuesta.data) ? respuesta.data : [];
      setMateriasCurso(lista);
      
      const horarioGuardado = localStorage.getItem(`horarioPersonalizado_${idCurso}`);
      if (!horarioGuardado && lista.length > 0) {
        const initialGrid = {};
        diasSemana.forEach((dia, dIdx) => {
          bloquesHorarios.forEach((bloque) => {
            if (bloque.tipo === "clase") {
              const matIndex = (dIdx * 2 + bloque.index) % lista.length;
              initialGrid[`${dia}-${bloque.index}`] = lista[matIndex].id_asignatura_curso;
            }
          });
        });
        setGrillaHorario(initialGrid);
      }
    } catch (error) {
      console.error("Error al cargar datos del curso y horario:", error);
      setMateriasCurso([]);
      setEsDirectorDelCurso(false);
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarMateriaCelda = (dia, bloqueIndex, idAsignaturaCurso) => {
    setGrillaHorario((prev) => ({
      ...prev,
      [`${dia}-${bloqueIndex}`]: idAsignaturaCurso === "" ? null : Number(idAsignaturaCurso)
    }));
  };

  const guardarHorarioPersonalizado = () => {
    localStorage.setItem(`horarioPersonalizado_${consulta.id_curso}`, JSON.stringify(grillaHorario));
    setModoEdicion(false);
    alert("¡Horario del curso actualizado exitosamente!");
  };

  const obtenerDatosMateria = (idAsignaturaCurso) => {
    if (!idAsignaturaCurso) return null;
    return materiasCurso.find(m => Number(m.id_asignatura_curso) === Number(idAsignaturaCurso));
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />
      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />
          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Horario Semanal Institucional</h2>

            <div className="card shadow border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <div>
                  <h5 className="text-primary mb-0">
                    Curso: {consulta.nombre_curso || "Curso seleccionado"} — Año: {consulta.anio}
                  </h5>
                  {esDirectorDelCurso && (
                    <span className="badge bg-success mt-1">Eres Director de Grupo de este curso</span>
                  )}
                </div>
                <div>
                  {esDirectorDelCurso && (
                    <>
                      {!modoEdicion ? (
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => setModoEdicion(true)}
                        >
                          <i className="bi bi-pencil-square me-1"></i> Organizar mi Curso
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary btn-sm me-2"
                          onClick={guardarHorarioPersonalizado}
                        >
                          <i className="bi bi-save me-1"></i> Guardar Cambios
                        </button>
                      )}
                    </>
                  )}
                  <a href="/consultar-horario" className="btn btn-outline-primary btn-sm">
                    Nueva Consulta
                  </a>
                </div>
              </div>

              <div className="card-body p-3">
                {cargando ? (
                  <div className="text-center py-5">
                    <span className="spinner-border text-primary me-2"></span>
                    Cargando horario institucional...
                  </div>
                ) : materiasCurso.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                    No hay asignaturas registradas para este curso.
                  </div>
                ) : (
                  <div className="table-responsive">
                    {modoEdicion && (
                      <div className="alert alert-warning py-2 mb-3 small">
                        ✏️ <strong>Modo de Edición de Director de Grupo:</strong> Está organizando el horario oficial de su curso asignado.
                      </div>
                    )}
                    <table className="table table-bordered text-center align-middle">
                      <thead className="table-primary">
                        <tr>
                          <th style={{ width: "12%" }}>Hora</th>
                          <th>Lunes</th>
                          <th>Martes</th>
                          <th>Miércoles</th>
                          <th>Jueves</th>
                          <th>Viernes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bloquesHorarios.map((bloque, idx) => {
                          if (bloque.tipo === "receso") {
                            return (
                              <tr key={`receso-${idx}`} className="table-secondary">
                                <td className="fw-bold">{bloque.hora}</td>
                                <td colSpan="5" className="py-2 small fw-bold text-uppercase text-dark">
                                  ☕ Receso Estudiantil (10:20 - 11:10)
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={`bloque-${idx}`}>
                              <td className="fw-bold bg-light">{bloque.hora}</td>
                              {diasSemana.map((dia) => {
                                const idAsignada = grillaHorario[`${dia}-${bloque.index}`];
                                const materia = obtenerDatosMateria(idAsignada);

                                return (
                                  <td key={dia} style={{ height: "75px" }}>
                                    {modoEdicion ? (
                                      <select
                                        className="form-select form-select-sm"
                                        value={idAsignada || ""}
                                        onChange={(e) => handleCambiarMateriaCelda(dia, bloque.index, e.target.value)}
                                      >
                                        <option value="">-- Espacio Libre --</option>
                                        {materiasCurso.map((mat) => (
                                          <option key={mat.id_asignatura_curso} value={mat.id_asignatura_curso}>
                                            {mat.nombre_asignatura}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      materia ? (
                                        <div className="border-start border-success border-4 bg-white p-1 rounded text-start shadow-sm">
                                          <strong className="text-primary d-block text-truncate">
                                            {materia.nombre_asignatura}
                                          </strong>
                                          <small className="text-muted d-block text-truncate">
                                            {materia.nombre_docente || materia.docente || "Docente Asignado"}
                                          </small>
                                        </div>
                                      ) : (
                                        <span className="text-muted fst-italic small">Espacio Libre</span>
                                      )
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="card-footer d-flex justify-content-end">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    localStorage.removeItem("horarioConsulta");
                    window.location.href = "/consultar-horario";
                  }}
                >
                  Cambiar Consulta de Curso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Horario;