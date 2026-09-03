import { useEffect, useState } from "react";
import { obtenerNotificaciones, enviarCorreo } from "../services/api";

function NotificacionesTable() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const respuesta = await obtenerNotificaciones();

      console.log("Notificaciones:", respuesta);

      setDatos(respuesta);
    } catch (error) {
      console.error("Error al cargar las notificaciones:", error);
    } finally {
      setCargando(false);
    }
  }

  async function enviar(id) {
    try {
      await enviarCorreo(id);

      alert("Correo enviado correctamente.");

      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("No fue posible enviar el correo.");
    }
  }

  if (cargando) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="card shadow">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-envelope-fill me-2"></i>
          Notificaciones
        </h5>
      </div>

      <div className="card-body">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Estudiante</th>
              <th>Acudiente</th>
              <th>Correo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th width="150">Acción</th>
            </tr>
          </thead>

          <tbody>
            {datos.length > 0 ? (
              datos.map((n) => (
                <tr key={n.id}>
                  <td>{n.estudiante}</td>

                  <td>{n.acudiente}</td>

                  <td>{n.correo}</td>

                  <td>{n.fecha}</td>

                  <td>
                    {n.estado === "Pendiente" ? (
                      <span className="badge bg-warning text-dark">
                        Pendiente
                      </span>
                    ) : (
                      <span className="badge bg-success">
                        Enviado
                      </span>
                    )}
                  </td>

                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      disabled={n.estado === "Enviado"}
                      onClick={() => enviar(n.id)}
                    >
                      <i className="bi bi-send-fill me-1"></i>

                      {n.estado === "Pendiente"
                        ? "Enviar"
                        : "Enviado"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-muted py-4"
                >
                  No hay notificaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default NotificacionesTable;