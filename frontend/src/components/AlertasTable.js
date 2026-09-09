import React, { useEffect, useState } from "react";
import { obtenerInasistencias } from "../services/api";

function AlertasTable() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerInasistencias();

      console.log("INASISTENCIAS:", datos);

      if (!Array.isArray(datos)) {
        throw new Error("El servidor no devolvió una lista.");
      }

      const agrupadas = {};

      datos.forEach((item) => {
        const idEstudiante =
          item.id_estudiante ||
          item.id_estudiante_curso ||
          item.id;

        if (!idEstudiante) {
          return;
        }

        if (!agrupadas[idEstudiante]) {
          const nombre =
            item.estudiante ||
            item.nombre_estudiante ||
            `${item.primer_nombre || ""} ${
              item.segundo_nombre || ""
            } ${item.primer_apellido || ""} ${
              item.segundo_apellido || ""
            }`.replace(/\s+/g, " ").trim();

          agrupadas[idEstudiante] = {
            id: idEstudiante,
            estudiante: nombre || "Estudiante",

            curso:
              item.curso ||
              item.nombre_curso ||
              item.codigo_curso ||
              "Sin curso",

            inasistencias: 0
          };
        }

        agrupadas[idEstudiante].inasistencias++;
      });

      const resultado = Object.values(agrupadas);

      const alertasGeneradas = resultado
        .filter((item) => item.inasistencias >= 5)
        .map((item) => ({
          ...item,
          estado:
            item.inasistencias >= 10
              ? "Pérdida"
              : "Exceso"
        }));

      setAlertas(alertasGeneradas);

    } catch (error) {
      console.error("ERROR ALERTAS:", error);

      setError(
        error.response?.data?.error ||
        error.message ||
        "No fue posible cargar las alertas."
      );
    } finally {
      setCargando(false);
    }
  };

  const enviarAviso = (estudiante) => {
    alert(
      `Aviso enviado al acudiente de ${estudiante}`
    );
  };

  if (cargando) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="mt-3">
            Cargando alertas...
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
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Alertas de Inasistencia
          </h5>
        </div>

        <div className="card-body">
          <div className="alert alert-danger">
            {error}
          </div>

          <button
            className="btn btn-primary"
            onClick={cargarAlertas}
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">

      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Alertas de Inasistencia
        </h5>
      </div>

      <div className="card-body">

        {alertas.length === 0 ? (

          <div className="text-center py-5">

            <i className="bi bi-check-circle-fill text-success fs-1"></i>

            <h5 className="mt-3">
              No hay alertas
            </h5>

            <p className="text-muted">
              Actualmente no hay estudiantes con exceso de inasistencias.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">
                <tr>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Inasistencias</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>

                {alertas.map((alerta) => (

                  <tr key={alerta.id}>

                    <td>{alerta.estudiante}</td>

                    <td>{alerta.curso}</td>

                    <td>
                      <strong>
                        {alerta.inasistencias}
                      </strong>
                    </td>

                    <td>
                      {alerta.estado === "Exceso" ? (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Exceso
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <i className="bi bi-x-circle me-1"></i>
                          Pérdida
                        </span>
                      )}
                    </td>

                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          enviarAviso(alerta.estudiante)
                        }
                      >
                        <i className="bi bi-send-fill me-1"></i>
                        Enviar aviso
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>
    </div>
  );
}

export default AlertasTable;