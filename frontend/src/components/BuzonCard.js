import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY_LEIDAS = "gae_notificaciones_leidas_v1";

function BuzonCard() {
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [leidasIds, setLeidasIds] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEIDAS);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const obtenerIdNotificacion = (n, index = null) => {
    return (
      n.id_correo ||
      n.id_notificacion ||
      n.id ||
      (index !== null ? `idx-${index}` : null)
    );
  };

  // ==========================================================
  // CARGAR NOTIFICACIONES
  // ==========================================================
  const cargarNotificaciones = async () => {
    try {
      setCargando(true);

      const respuesta = await axios.get(
        "http://localhost:5000/api/notificaciones"
      );

      let lista = [];

      if (Array.isArray(respuesta.data?.correos)) {
        lista = respuesta.data.correos;
      } else if (Array.isArray(respuesta.data)) {
        lista = respuesta.data;
      } else if (Array.isArray(respuesta.data?.notificaciones)) {
        lista = respuesta.data.notificaciones;
      }

      setNotificaciones(lista);
    } catch (error) {
      console.error("Error al cargar las notificaciones:", error);
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  // ==========================================================
  // DATOS
  // ==========================================================
  const obtenerAsunto = (n) =>
    n.asunto || n.tipo_notificacion || "Nueva notificación";

  const obtenerMensaje = (n) =>
    n.mensaje ||
    n.descripcion ||
    n.contenido ||
    "Se ha recibido una nueva notificación.";

  const obtenerNombre = (n) =>
    n.nombre_estudiante ||
    n.estudiante ||
    n.nombre_acudiente ||
    n.acudiente ||
    n.destinatario ||
    "Sistema GAE";

  const obtenerFecha = (n) =>
    n.fecha_envio || n.fecha || n.created_at || n.createdAt || null;

  const obtenerEstado = (n) => n.estado_envio || n.estado || "Enviado";

  // ==========================================================
  // ESTADOS
  // ==========================================================
  const esNoLeida = (n, index = null) => {
    const id = obtenerIdNotificacion(n, index);
    if (id && leidasIds.includes(String(id))) {
      return false;
    }

    const lectura = String(n.estado_lectura || "").toLowerCase();
    if (lectura === "leído" || lectura === "leido") {
      return false;
    }

    const estado = String(n.estado || n.estado_envio || "").toLowerCase();
    return (
      estado === "enviado" ||
      estado === "entregado" ||
      estado === "no leído" ||
      estado === "no leido" ||
      estado === "pendiente" ||
      estado === "no_leido"
    );
  };

  const esAlerta = (n) => {
    const texto = `${obtenerAsunto(n)} ${obtenerMensaje(n)}`.toLowerCase();
    return (
      texto.includes("inasistencia") ||
      texto.includes("alerta") ||
      texto.includes("pérdida") ||
      texto.includes("perdida") ||
      texto.includes("exceso")
    );
  };

  const obtenerTipo = (n) => {
    if (esAlerta(n)) {
      return "alerta";
    }

    const texto = `${obtenerAsunto(n)} ${obtenerMensaje(n)}`.toLowerCase();
    if (texto.includes("excusa") || texto.includes("justific")) {
      return "excusa";
    }

    if (texto.includes("enviado") || texto.includes("correo")) {
      return "enviado";
    }

    return "mensaje";
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    try {
      const f = new Date(fecha);
      if (Number.isNaN(f.getTime())) return fecha;
      return f.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  const formatearHora = (fecha) => {
    if (!fecha) return "";
    try {
      const f = new Date(fecha);
      if (Number.isNaN(f.getTime())) return "";
      return f.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // ==========================================================
  // ESTADÍSTICAS
  // ==========================================================
  const noLeidas = notificaciones.filter((n, idx) => esNoLeida(n, idx)).length;
  const alertas = notificaciones.filter(esAlerta).length;

  // ==========================================================
  // FILTROS
  // ==========================================================
  const notificacionesFiltradas = useMemo(() => {
    let resultado = [...notificaciones];

    if (filtro === "no_leidas") {
      resultado = resultado.filter((n, idx) => esNoLeida(n, idx));
    }

    if (filtro === "alertas") {
      resultado = resultado.filter(esAlerta);
    }

    if (filtro === "mensajes") {
      resultado = resultado.filter((n) => obtenerTipo(n) === "mensaje");
    }

    if (filtro === "enviadas") {
      resultado = resultado.filter((n) => {
        const estado = obtenerEstado(n).toLowerCase();
        return estado.includes("enviado") || estado.includes("entregado");
      });
    }

    if (busqueda.trim() !== "") {
      const texto = busqueda.toLowerCase();
      resultado = resultado.filter((n) => {
        const contenido = `${obtenerAsunto(n)} ${obtenerMensaje(n)} ${obtenerNombre(n)}`.toLowerCase();
        return contenido.includes(texto);
      });
    }

    return resultado;
  }, [notificaciones, filtro, busqueda, leidasIds]);

  const visibles = notificacionesFiltradas.slice(0, 5);

  // ==========================================================
  // MARCAR COMO LEÍDAS
  // ==========================================================
  const marcarTodasComoLeidas = () => {
    const idsActuales = notificaciones
      .map((n, idx) => obtenerIdNotificacion(n, idx))
      .filter(Boolean)
      .map(String);

    const fusionados = Array.from(new Set([...leidasIds, ...idsActuales]));
    setLeidasIds(fusionados);

    try {
      localStorage.setItem(STORAGE_KEY_LEIDAS, JSON.stringify(fusionados));
    } catch {
      // Ignorar errores de almacenamiento local
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <div className="w-100">
      {/* ESTADÍSTICAS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="text-secondary small">No leídas</div>
              <div className="fs-2 fw-bold text-primary mt-1">{noLeidas}</div>
              <div className="text-muted small">Notificaciones pendientes</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="text-secondary small">Total</div>
              <div className="fs-2 fw-bold mt-1">{notificaciones.length}</div>
              <div className="text-muted small">Notificaciones recibidas</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="text-secondary small">Alertas</div>
              <div className="fs-2 fw-bold text-danger mt-1">{alertas}</div>
              <div className="text-muted small">Alertas de asistencia</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="text-secondary small">Estado</div>
              <div className="fs-5 fw-bold text-success mt-2">
                {noLeidas === 0 ? "Todo al día" : "Pendientes"}
              </div>
              <div className="text-muted small mt-1">
                {noLeidas === 0
                  ? "Sin notificaciones pendientes"
                  : `${noLeidas} notificaciones pendientes`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BUZÓN */}
      <div className="card border-0 shadow-sm">
        {/* ENCABEZADO */}
        <div className="card-body p-4 border-bottom">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
            <div>
              <h4 className="fw-bold text-dark mb-1">
                Buzón de notificaciones
              </h4>
              <p className="text-muted small mb-0">
                Centro de mensajes y alertas de GAE
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="badge text-bg-danger rounded-pill px-3 py-2">
                {noLeidas} nuevas
              </span>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={marcarTodasComoLeidas}
              >
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="card-body p-4 border-bottom">
          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar notificación, estudiante o asunto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="col-12 col-lg-4">
              <select
                className="form-select"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="todas">Todas las notificaciones</option>
                <option value="no_leidas">No leídas</option>
                <option value="alertas">Alertas</option>
                <option value="mensajes">Mensajes</option>
                <option value="enviadas">Enviadas</option>
              </select>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className={`btn ${
                filtro === "todas" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFiltro("todas")}
            >
              Todas
            </button>

            <button
              type="button"
              className={`btn ${
                filtro === "no_leidas" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFiltro("no_leidas")}
            >
              No leídas
            </button>

            <button
              type="button"
              className={`btn ${
                filtro === "alertas" ? "btn-danger" : "btn-outline-danger"
              }`}
              onClick={() => setFiltro("alertas")}
            >
              Alertas
            </button>

            <button
              type="button"
              className={`btn ${
                filtro === "mensajes" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFiltro("mensajes")}
            >
              Mensajes
            </button>

            <button
              type="button"
              className={`btn ${
                filtro === "enviadas" ? "btn-success" : "btn-outline-success"
              }`}
              onClick={() => setFiltro("enviadas")}
            >
              Enviadas
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="list-group list-group-flush">
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted mt-3 mb-0">
                Cargando notificaciones
              </p>
            </div>
          ) : visibles.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-dark">No hay notificaciones</h5>
              <p className="text-muted mb-0">
                No se encontraron notificaciones con los filtros seleccionados
              </p>
            </div>
          ) : (
            visibles.map((n, index) => {
              const noLeida = esNoLeida(n, index);
              const tipo = obtenerTipo(n);

              let claseEstado = "text-bg-success";
              if (tipo === "alerta") {
                claseEstado = "text-bg-danger";
              } else if (tipo === "excusa") {
                claseEstado = "text-bg-warning text-dark";
              }

              return (
                <div
                  key={obtenerIdNotificacion(n, index)}
                  className={`list-group-item py-4 px-4 ${
                    noLeida ? "bg-primary bg-opacity-10" : ""
                  }`}
                >
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-5">
                      <div className="d-flex align-items-center gap-2">
                        {noLeida && (
                          <span
                            className="bg-primary rounded-circle d-inline-block"
                            style={{ width: "7px", height: "7px" }}
                          ></span>
                        )}
                        <strong className="text-dark">
                          {obtenerAsunto(n)}
                        </strong>
                      </div>

                      <div className="text-muted small mt-2">
                        {obtenerMensaje(n)}
                      </div>
                    </div>

                    <div className="col-12 col-md-4 col-lg-2">
                      <div className="text-secondary small">Persona</div>
                      <div className="fw-semibold small mt-1">
                        {obtenerNombre(n)}
                      </div>
                    </div>

                    <div className="col-12 col-md-4 col-lg-2">
                      <div className="text-secondary small">Fecha</div>
                      <div className="small mt-1">
                        {formatearFecha(obtenerFecha(n))}
                      </div>
                      <div className="text-muted small">
                        {formatearHora(obtenerFecha(n))}
                      </div>
                    </div>

                    <div className="col-12 col-md-4 col-lg-2">
                      <div className="text-secondary small mb-1">Estado</div>
                      <span className={`badge rounded-pill ${claseEstado}`}>
                        {obtenerEstado(n)}
                      </span>
                    </div>

                    <div className="col-lg-1 text-lg-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate("/notificaciones")}
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PIE */}
        <div className="card-footer bg-light border-0 p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <small className="text-muted">
              Mostrando <strong>{visibles.length}</strong> de{" "}
              <strong>{notificacionesFiltradas.length}</strong> notificaciones
            </small>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cargarNotificaciones}
              >
                Actualizar
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/notificaciones")}
              >
                Ver todas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuzonCard;