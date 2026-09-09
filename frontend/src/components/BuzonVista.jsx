import React, { useState, useEffect } from "react";
import axios from "axios";

function BuzonVista({ endpoint, titulo = "Buzón de Notificaciones" }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarNotificaciones = async () => {
      if (!endpoint) return;

      try {
        setCargando(true);
        const res = await axios.get(endpoint);
        // Si la API responde con un objeto o un array directo:
        const data = Array.isArray(res.data) ? res.data : res.data.correos || [];
        setNotificaciones(data);
      } catch (err) {
        console.error("Error al cargar los correos:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarNotificaciones();
  }, [endpoint]);

  // Filtro de búsqueda
  const correosFiltrados = notificaciones.filter(
    (item) =>
      item.asunto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.remitente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.mensaje?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-100">
      <div className="mb-4">
        <h2 className="fw-bold text-dark m-0">{titulo}</h2>
        <p className="text-muted small mb-0">
          Historial completo de mensajes e interacciones registradas.
        </p>
      </div>

      {/* Buscador */}
      <div className="card border-0 shadow-sm p-3 mb-4">
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

      {/* Tabla de Correos */}
      <div className="card border-0 shadow-sm p-3">
        {cargando ? (
          <div className="text-center py-4 text-muted small">Cargando correos...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Asunto</th>
                  <th>Remitente / Destinatario</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {correosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted small">
                      No se encontraron correos registrados.
                    </td>
                  </tr>
                ) : (
                  correosFiltrados.map((item) => (
                    <tr
                      key={item.id_correo}
                      style={{ cursor: "pointer" }}
                      onClick={() => setCorreoSeleccionado(item)}
                    >
                      <td className="fw-bold text-dark">{item.asunto}</td>
                      <td>
                        <div>{item.remitente_nombre || item.destinatario_nombre || "Usuario"}</div>
                        <small className="text-muted">{item.rol || "Institución"}</small>
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
        )}
      </div>

      {/* Modal para ver detalle del correo */}
      {correoSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
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
                    <small className="text-muted d-block">De/Para:</small>
                    <strong>
                      {correoSeleccionado.remitente_nombre || correoSeleccionado.destinatario_nombre}
                    </strong>{" "}
                    ({correoSeleccionado.rol || "Usuario"})
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
    </div>
  );
}

export default BuzonVista;