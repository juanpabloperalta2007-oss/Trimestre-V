import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

const MESES = [
  { id: "todos", nombre: "Todos los meses" },
  { id: 1, nombre: "Enero" },
  { id: 2, nombre: "Febrero" },
  { id: 3, nombre: "Marzo" },
  { id: 4, nombre: "Abril" },
  { id: 5, nombre: "Mayo" },
  { id: 6, nombre: "Junio" },
  { id: 7, nombre: "Julio" },
  { id: 8, nombre: "Agosto" },
  { id: 9, nombre: "Septiembre" },
  { id: 10, nombre: "Octubre" },
  { id: 11, nombre: "Noviembre" },
  { id: 12, nombre: "Diciembre" },
];

function clasificarEstado(estadoRaw) {
  const val = String(estadoRaw || "").toUpperCase().trim();
  if (val === "P" || val === "PRESENTE") {
    return {
      categoria: "asistencia",
      etiqueta: "Presente",
      badgeClass: "bg-success text-white",
    };
  }
  if (val === "A" || val === "AUSENTE" || val === "EXCUSA RECHAZADA") {
    return {
      categoria: "falla_sin_justificar",
      etiqueta: "Falla sin justificar",
      badgeClass: "bg-danger text-white",
    };
  }
  if (
    val === "J" ||
    val === "JUSTIFICADO" ||
    val === "FALLA JUSTIFICADA" ||
    val === "EXCUSA PENDIENTE"
  ) {
    return {
      categoria: "falla_justificada",
      etiqueta: val === "EXCUSA PENDIENTE" ? "Excusa pendiente" : "Justificado",
      badgeClass: "bg-info text-dark",
    };
  }
  if (val === "T" || val === "TARDE" || val === "TARDÍA" || val === "RETARDO") {
    return {
      categoria: "retardo",
      etiqueta: "Retardo / Tarde",
      badgeClass: "bg-warning text-dark",
    };
  }
  return {
    categoria: "otro",
    etiqueta: estadoRaw || "Sin estado",
    badgeClass: "bg-secondary text-white",
  };
}

function formatearFechaCompleta(fechaStr) {
  if (!fechaStr) return { diaSemana: "-", fechaCorta: "Sin fecha" };
  const texto = String(fechaStr).slice(0, 10);
  const partes = texto.split("-");
  if (partes.length === 3) {
    const fechaLocal = new Date(
      Number(partes[0]),
      Number(partes[1]) - 1,
      Number(partes[2])
    );
    if (!Number.isNaN(fechaLocal.getTime())) {
      const diaSemana = fechaLocal.toLocaleDateString("es-CO", {
        weekday: "long",
      });
      const fechaCorta = fechaLocal.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return { diaSemana, fechaCorta };
    }
  }
  return { diaSemana: "-", fechaCorta: fechaStr };
}

function EstadisticasAcud() {
  const { usuario } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [filtroCategoria, setFiltroCategoria] = useState("todos");

  const [metricas, setMetricas] = useState({
    asistencias: 0,
    fallas_sin_justificar: 0,
    fallas_justificadas: 0,
    retardos: 0,
  });

  const [registros, setRegistros] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!usuario?.id_usuario) return;

      try {
        setCargandoEstudiantes(true);
        const res = await axios.get(
          `http://localhost:5000/api/acudientes_estudiantes/mis-estudiantes/${usuario.id_usuario}`
        );
        const lista = Array.isArray(res.data) ? res.data : [];
        setEstudiantes(lista);
        if (lista.length > 0) {
          setEstudianteSeleccionado(lista[0]);
        }
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
      } finally {
        setCargandoEstudiantes(false);
      }
    };

    cargarEstudiantes();
  }, [usuario]);

  useEffect(() => {
    const cargarEstadisticasYDetalle = async () => {
      if (!estudianteSeleccionado) return;

      try {
        setCargandoDatos(true);
        const queryMes =
          mesSeleccionado === "todos" || !mesSeleccionado ? "" : `?mes=${mesSeleccionado}`;

        const [resStats, resDetalle] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/asistencias/estadisticas/${estudianteSeleccionado.id_estudiante}${queryMes}`
          ),
          axios
            .get(
              `http://localhost:5000/api/asistencias/detalle/${estudianteSeleccionado.id_estudiante}${queryMes}`
            )
            .catch(() => ({ data: [] })),
        ]);

        setMetricas({
          asistencias: Number(resStats.data?.asistencias) || 0,
          fallas_sin_justificar: Number(resStats.data?.fallas_sin_justificar) || 0,
          fallas_justificadas: Number(resStats.data?.fallas_justificadas) || 0,
          retardos: Number(resStats.data?.retardos) || 0,
        });

        setRegistros(Array.isArray(resDetalle.data) ? resDetalle.data : []);
      } catch (err) {
        console.error("Error al cargar estadísticas y detalle:", err);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarEstadisticasYDetalle();
  }, [estudianteSeleccionado, mesSeleccionado]);

  const totalRegistros =
    metricas.asistencias +
    metricas.fallas_sin_justificar +
    metricas.fallas_justificadas +
    metricas.retardos;

  const porcentajeAsistencia =
    totalRegistros > 0
      ? Math.round(
          ((metricas.asistencias + metricas.fallas_justificadas) / totalRegistros) * 100
        )
      : 0;

  const registrosFiltrados = useMemo(() => {
    if (filtroCategoria === "todos") return registros;
    return registros.filter(
      (item) => clasificarEstado(item.estado).categoria === filtroCategoria
    );
  }, [registros, filtroCategoria]);

  const nombreEstudiante = estudianteSeleccionado
    ? [
        estudianteSeleccionado.primer_nombre,
        estudianteSeleccionado.segundo_nombre,
        estudianteSeleccionado.primer_apellido,
        estudianteSeleccionado.segundo_apellido,
      ]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";

  const nombreMesActual =
    MESES.find((m) => String(m.id) === String(mesSeleccionado))?.nombre || "Periodo";

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarAcud />

          <div className="col-md-9 col-lg-10 p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 pb-2 border-bottom">
              <div>
                <h4 className="fw-bold text-dark m-0">
                  Seguimiento de Asistencia del Estudiante
                </h4>
                <p className="text-muted small mb-0">
                  Resumen estadístico y registro detallado por día y asignatura
                </p>
              </div>
              {totalRegistros > 0 && (
                <span className="badge bg-primary fs-6 px-3 py-2">
                  Cumplimiento: {porcentajeAsistencia}%
                </span>
              )}
            </div>

            {cargandoEstudiantes ? (
              <div className="text-center py-5 text-muted">
                <div
                  className="spinner-border spinner-border-sm me-2 text-primary"
                  role="status"
                ></div>
                Cargando información del estudiante...
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="card border-0 shadow-sm p-4 text-center text-muted">
                No tienes estudiantes asociados para consultar.
              </div>
            ) : (
              <div>
                {/* CONTROLES DE FILTRO */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-3">
                    <div className="row g-3 align-items-end">
                      {estudiantes.length > 1 && (
                        <div className="col-md-4">
                          <label className="form-label fw-bold text-secondary small">
                            Estudiante
                          </label>
                          <select
                            className="form-select"
                            value={estudianteSeleccionado?.id_estudiante || ""}
                            onChange={(e) => {
                              const est = estudiantes.find(
                                (item) =>
                                  Number(item.id_estudiante) === Number(e.target.value)
                              );
                              setEstudianteSeleccionado(est);
                            }}
                          >
                            {estudiantes.map((e) => (
                              <option key={e.id_estudiante} value={e.id_estudiante}>
                                {e.primer_nombre} {e.primer_apellido}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={estudiantes.length > 1 ? "col-md-4" : "col-md-6"}>
                        <label className="form-label fw-bold text-secondary small">
                          Periodo / Mes
                        </label>
                        <select
                          className="form-select"
                          value={mesSeleccionado}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMesSeleccionado(val === "todos" ? "todos" : Number(val));
                          }}
                        >
                          {MESES.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={estudiantes.length > 1 ? "col-md-4" : "col-md-6"}>
                        <label className="form-label fw-bold text-secondary small">
                          Filtrar detalle por estado
                        </label>
                        <select
                          className="form-select"
                          value={filtroCategoria}
                          onChange={(e) => setFiltroCategoria(e.target.value)}
                        >
                          <option value="todos">Todos los registros</option>
                          <option value="asistencia">Solo asistencias</option>
                          <option value="falla_sin_justificar">
                            Solo fallas sin justificar
                          </option>
                          <option value="falla_justificada">Solo justificadas</option>
                          <option value="retardo">Solo retardos</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-top small text-secondary">
                      Mostrando reporte de{" "}
                      <strong className="text-primary">{nombreEstudiante}</strong> ·{" "}
                      <strong>{nombreMesActual}</strong> · Total registros:{" "}
                      <strong>{totalRegistros}</strong>
                    </div>
                  </div>
                </div>

                {cargandoDatos ? (
                  <div className="text-center py-5 text-muted">
                    <div
                      className="spinner-border spinner-border-sm me-2 text-primary"
                      role="status"
                    ></div>
                    Actualizando estadísticas y detalle...
                  </div>
                ) : (
                  <>
                    {/* TARJETAS DE MÉTRICAS */}
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 border-start border-4 border-success shadow-sm p-3 h-100">
                          <span className="text-muted small fw-semibold">Asistencias</span>
                          <h2 className="fw-bold text-success my-2">
                            {metricas.asistencias}
                          </h2>
                          <small className="text-muted">Clases asistidas</small>
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 border-start border-4 border-danger shadow-sm p-3 h-100">
                          <span className="text-muted small fw-semibold">
                            Fallas sin justificar
                          </span>
                          <h2 className="fw-bold text-danger my-2">
                            {metricas.fallas_sin_justificar}
                          </h2>
                          <small className="text-muted">Requieren atención</small>
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 border-start border-4 border-info shadow-sm p-3 h-100">
                          <span className="text-muted small fw-semibold">
                            Fallas justificadas
                          </span>
                          <h2 className="fw-bold text-info my-2">
                            {metricas.fallas_justificadas}
                          </h2>
                          <small className="text-muted">Con excusa o soporte</small>
                        </div>
                      </div>

                      <div className="col-12 col-sm-6 col-lg-3">
                        <div className="card border-0 border-start border-4 border-warning shadow-sm p-3 h-100">
                          <span className="text-muted small fw-semibold">Retardos</span>
                          <h2 className="fw-bold text-warning my-2">
                            {metricas.retardos}
                          </h2>
                          <small className="text-muted">Llegadas tarde</small>
                        </div>
                      </div>
                    </div>

                    {/* TABLA CRONOLÓGICA DÍA POR DÍA */}
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="fw-bold text-dark m-0">
                            Detalle cronológico de asistencia ({nombreMesActual})
                          </h6>
                          <small className="text-muted">
                            Consulta qué día, asignatura y motivo registró cada novedad
                          </small>
                        </div>
                        <span className="badge bg-light text-dark border">
                          {registrosFiltrados.length} registro(s)
                        </span>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Fecha</th>
                              <th>Día</th>
                              <th>Asignatura</th>
                              <th>Curso</th>
                              <th className="text-center">Estado</th>
                              <th>Observaciones / Motivo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {registrosFiltrados.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                  No hay registros detallados para el mes o filtro
                                  seleccionado.
                                </td>
                              </tr>
                            ) : (
                              registrosFiltrados.map((item, idx) => {
                                const infoEstado = clasificarEstado(item.estado);
                                const { diaSemana, fechaCorta } = formatearFechaCompleta(
                                  item.fecha
                                );

                                return (
                                  <tr key={item.id_asistencia || idx}>
                                    <td className="fw-semibold text-dark">
                                      {fechaCorta}
                                    </td>
                                    <td className="text-capitalize text-muted">
                                      {diaSemana}
                                    </td>
                                    <td>{item.nombre_asignatura || "Asignatura"}</td>
                                    <td>{item.nombre_curso || "-"}</td>
                                    <td className="text-center">
                                      <span className={`badge ${infoEstado.badgeClass}`}>
                                        {infoEstado.etiqueta}
                                      </span>
                                    </td>
                                    <td className="text-muted small">
                                      {item.observaciones || "Sin observaciones"}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EstadisticasAcud;