import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function BuzonCard() {
  const { usuario } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

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
        console.error("Error al cargar las notificaciones:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarNotificaciones();
  }, [usuario]);

  // Filtro de mensajes sin leer
  const noLeidasCount = notificaciones.filter(
    (n) => n.estado_envio === "Pendiente" || n.estado_envio === "No leído"
  ).length;

  return (
    <div className="card border-0 shadow-sm p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0 text-secondary">Buzón - No leídos</h5>
        <span className="badge bg-danger rounded-pill px-3 py-2">
          {noLeidasCount} nuevos
        </span>
      </div>

      {cargando ? (
        <div className="text-center py-4 text-muted small">Cargando correos...</div>
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
                    No tienes correos o notificaciones registradas.
                  </td>
                </tr>
              ) : (
                notificaciones.map((item) => (
                  <tr key={item.id_correo}>
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
                        {item.rol || "Docente"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <button className="btn btn-success w-100 fw-bold mt-3">
        Ver todo
      </button>
    </div>
  );
}

export default BuzonCard;