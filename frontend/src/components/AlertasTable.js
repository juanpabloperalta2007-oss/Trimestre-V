import { useState } from "react";

function AlertasTable() {
  const [alertas, setAlertas] = useState([
    {
      id: 1,
      estudiante: "Daniel Felipe Castellanos Díaz",
      curso: "10-01",
      inasistencias: 8,
      estado: "Exceso",
    },
    {
      id: 2,
      estudiante: "Juan Pérez",
      curso: "11-02",
      inasistencias: 12,
      estado: "Pérdida",
    },
    {
      id: 3,
      estudiante: "María Gómez",
      curso: "9-03",
      inasistencias: 9,
      estado: "Exceso",
    },
  ]);

  const enviarAviso = (estudiante) => {
    alert(`Aviso enviado al acudiente de ${estudiante}`);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Alertas de Inasistencia
        </h5>
      </div>

      <div className="card-body">

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

                  <td>{alerta.inasistencias}</td>

                  <td>

                    {alerta.estado === "Exceso" ? (

                      <span className="badge bg-warning text-dark">
                        ⚠ Exceso
                      </span>

                    ) : (

                      <span className="badge bg-danger">
                        ❌ Pérdida
                      </span>

                    )}

                  </td>

                  <td>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => enviarAviso(alerta.estudiante)}
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

      </div>

    </div>
  );
}

export default AlertasTable;