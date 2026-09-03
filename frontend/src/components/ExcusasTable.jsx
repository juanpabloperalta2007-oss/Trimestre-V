import { useEffect, useState } from "react";
import {
  obtenerExcusas,
  aprobarExcusa,
  rechazarExcusa,
} from "../services/api";

function ExcusasTable() {

  const [datos, setDatos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    const respuesta = await obtenerExcusas();
    setDatos(respuesta);
  }

  async function aprobar(id) {
    await aprobarExcusa(id);
    cargarDatos();
  }

  async function rechazar(id) {
    await rechazarExcusa(id);
    cargarDatos();
  }

  return (
    <div className="card shadow">

      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-folder-check me-2"></i>
          Excusas Registradas
        </h5>
      </div>

      <div className="card-body">

        <table className="table table-hover">

          <thead className="table-light">

            <tr>
              <th>Estudiante</th>
              <th>Fecha</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>

          </thead>

          <tbody>

            {datos.map((e) => (

              <tr key={e.id}>

                <td>{e.estudiante}</td>

                <td>{e.fecha}</td>

                <td>{e.motivo}</td>

                <td>

                  {e.estado === "Pendiente" && (
                    <span className="badge bg-warning text-dark">
                      Pendiente
                    </span>
                  )}

                  {e.estado === "Aprobada" && (
                    <span className="badge bg-success">
                      Aprobada
                    </span>
                  )}

                  {e.estado === "Rechazada" && (
                    <span className="badge bg-danger">
                      Rechazada
                    </span>
                  )}

                </td>

                <td>

                  <button
                    className="btn btn-success btn-sm me-2"
                    disabled={e.estado !== "Pendiente"}
                    onClick={() => aprobar(e.id)}
                  >
                    Aprobar
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    disabled={e.estado !== "Pendiente"}
                    onClick={() => rechazar(e.id)}
                  >
                    Rechazar
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ExcusasTable;