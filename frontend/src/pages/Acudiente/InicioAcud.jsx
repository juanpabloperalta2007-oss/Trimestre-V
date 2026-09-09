import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

function InicioAcud() {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de control para la vista
  const [mostrarBuzonCompleto, setMostrarBuzonCompleto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);

  function obtenerFechaCompleta() {
    const hoy = new Date();
    return hoy.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  useEffect(() => {
    const cargarNotificaciones = async () => {
      const idAcudiente = usuario?.id_acudiente || usuario?.id_usuario;

      if (!idAcudiente) return;

      try {
        setCargando(true);
        const res = await axios.get(
          `http://localhost:5000/api/correos_notificaciones/acudiente/${idAcudiente}`
        );
        setNotificaciones(res.data);
      } catch (err) {
        console.error("Error al obtener notificaciones:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarNotificaciones();
  }, [usuario]);

  // Conteo de no leídos
  const noLeidasCount = notificaciones.filter(
    (n) => n.estado_envio === "Pendiente" || n.estado_envio === "No leído"
  ).length;

  // Correos filtrados para el buscador cuando está activada la vista completa
  const correosFiltrados = notificaciones.filter(
    (item) =>
      item.asunto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.remitente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.mensaje?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarAcud />

          <div className="col-md-9 col-lg-10 p-4">
            
            {/* Encabezado Principal */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-dark m-0">
                  {mostrarBuzonCompleto ? "Buzón Completo" : "Inicio"}
                </h2>
                <p className="text-muted small mb-0">
                  <i className="bi bi-clock me-1"></i> <strong>Hoy:</strong>{" "}
                  {obtenerFechaCompleta()}
                </p>
              </div>
              
              {/* Botón dinámico según el modo de vista */}
              {mostrarBuzonCompleto ? (
                <button
                  className="btn btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() => setMostrarBuzonCompleto(false)}
                >
                  <i className="bi bi-arrow-left"></i> Volver al Inicio
                </button>
              ) : (
                <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                  <i className="bi bi-journal-bookmark"></i> Agenda
                </button>
              )}
            </div>

            {/* ========================================================= */}
            {/* VISTA 1: RESUMEN DEL BUZÓN (Vista Por Defecto)            */}
            {/* ========================================================= */}
            {!mostrarBuzonCompleto ? (
              <div className="card border-0 shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold m-0 text-secondary">Buzón - Resumen</h5>
                  <span className="badge bg-danger rounded-pill px-3 py-2">
                    {noLeidasCount} nuevos
                  </span>
                </div>

                {cargando ? (
                  <div className="text-center py-4 text-muted small">
                    Cargando correos...
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre</th>
                          <th>Fecha</th>
                          <th>Rol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notificaciones.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center py-4 text-muted small">
                              No tienes correos ni notificaciones registradas.
                            </td>
                          </tr>
                        ) : (
                          // Muestra solo los primeros 5 en el resumen
                          notificaciones.slice(0, 5).map((item) => (
                            <tr
                              key={item.id_correo}
                              style={{ cursor: "pointer" }}
                              onClick={() => setCorreoSeleccionado(item)}
                            >
                              <td className="fw-bold text-dark">
                                {item.remitente_nombre || "Docente"}
                              </td>
                              <td className="text-muted small">
                                {item.fecha_envio
                                  ? new Date(item.fecha_envio).toLocaleDateString("es-ES")
                                  : "Sin fecha"}
                              </td>
                              <td>
                                <span className="badge bg-light text-dark border px-2 py-1 small">
                                  {item.rol || "Profesor"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Botón que activa la vista completa dentro de la misma pantalla */}
                <button
                  className="btn btn-success w-100 fw-bold mt-3"
                  onClick={() => setMostrarBuzonCompleto(true)}
                >
                  Ver todo
                </button>
              </div>
            ) : (

              /* ========================================================= */
              /* VISTA 2: LISTADO COMPLETO CON BUSCADOR (Al dar "Ver todo")*/
              /* ========================================================= */
              <div>
                {/* Buscador */}
                <div className="card border-0 shadow-sm p-3 mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Buscar por asunto, remitente o mensaje..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tabla Extendida */}
                <div className="card border-0 shadow-sm p-3">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Asunto</th>
                          <th>Remitente</th>
                          <th>Tipo</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {correosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-4 text-muted small">
                              No se encontraron coincidencias.
                            </td>
                          </tr>
                        ) : (
                          correosFiltrados.map((item) => (
                            <tr
                              key={item.id_correo}
                              style={{ cursor: "pointer" }}
                              onClick={() => setCorreoSeleccionado(item)}
                            >
                              <td className="fw-bold text-dark">{item.asunto || "Sin asunto"}</td>
                              <td>
                                <div>{item.remitente_nombre || "Docente"}</div>
                                <small className="text-muted">{item.rol || "Profesor"}</small>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {item.tipo_notificacion || "General"}
                                </span>
                              </td>
                              <td className="text-muted small">
                                {item.fecha_envio
                                  ? new Date(item.fecha_envio).toLocaleDateString("es-ES")
                                  : "Sin fecha"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL PARA VER EL CONTENIDO DEL CORREO                     */}
      {/* ========================================================= */}
      {correoSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold m-0">
                  {correoSeleccionado.asunto || "Notificación"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCorreoSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <div>
                    <small className="text-muted d-block">De:</small>
                    <strong>{correoSeleccionado.remitente_nombre}</strong> (
                    {correoSeleccionado.rol || "Profesor"})
                  </div>
                  <div className="text-end">
                    <small className="text-muted d-block">Fecha:</small>
                    <small className="fw-bold">
                      {new Date(correoSeleccionado.fecha_envio).toLocaleDateString("es-ES")}
                    </small>
                  </div>
                </div>

                <div className="p-3 bg-light rounded border">
                  <p className="m-0 text-dark" style={{ whiteSpace: "pre-line" }}>
                    {correoSeleccionado.mensaje}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary fw-bold"
                  onClick={() => setCorreoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default InicioAcud;