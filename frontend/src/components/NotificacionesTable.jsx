import React, { useEffect, useState } from "react";
import {
  obtenerNotificaciones,
  enviarCorreo
} from "../services/api";

function NotificacionesTable() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await obtenerNotificaciones();

      console.log("NOTIFICACIONES:", respuesta);

      if (!Array.isArray(respuesta)) {
        throw new Error(
          "El servidor no devolvió una lista de notificaciones."
        );
      }

      setDatos(respuesta);

    } catch (error) {
      console.error(
        "ERROR NOTIFICACIONES:",
        error
      );

      setError(
        error.response?.data?.error ||
        error.message ||
        "No fue posible cargar las notificaciones."
      );

    } finally {
      setCargando(false);
    }
  };

  const enviar = async (id) => {
    try {

      await enviarCorreo(id);

      alert("Correo enviado correctamente.");

      cargarDatos();

    } catch (error) {

      console.error(
        "ERROR AL ENVIAR:",
        error
      );

      alert(
        error.response?.data?.error ||
        "No fue posible enviar el correo."
      );
    }
  };

  if (cargando) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-5">

          <div className="spinner-border text-primary"></div>

          <p className="mt-3">
            Cargando notificaciones...
          </p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm">

        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-envelope-fill me-2"></i>
            Notificaciones
          </h5>
        </div>

        <div className="card-body">

          <div className="alert alert-danger">
            {error}
          </div>

          <button
            className="btn btn-primary"
            onClick={cargarDatos}
          >
            Intentar nuevamente
          </button>

        </div>

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

        <div className="table-responsive">

          <table className="table table-hover table-bordered align-middle">

            <thead className="table-light">

              <tr>
                <th>Estudiante</th>
                <th>Acudiente</th>
                <th>Correo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>

            </thead>

            <tbody>

              {datos.length > 0 ? (

                datos.map((n) => (

                  <tr key={n.id}>

                    <td>
                      {n.estudiante || "Sin información"}
                    </td>

                    <td>
                      {n.acudiente || "Sin información"}
                    </td>

                    <td>
                      {n.correo || "Sin correo"}
                    </td>

                    <td>
                      {n.fecha || "Sin fecha"}
                    </td>

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
    </div>
  );
}

export default NotificacionesTable;