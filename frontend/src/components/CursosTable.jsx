import { useEffect, useState } from "react";
import {
  obtenerCursos,
  obtenerInasistencias,
  eliminarInasistencia,
} from "../services/api";

function CursosTable() {
  const [cursos, setCursos] = useState([]);
  const [inasistencias, setInasistencias] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const [cursosData, inasistenciasData] = await Promise.all([
        obtenerCursos(),
        obtenerInasistencias(),
      ]);

      console.log("Cursos:", cursosData);
      console.log("Inasistencias:", inasistenciasData);

      setCursos(Array.isArray(cursosData) ? cursosData : []);
      setInasistencias(
        Array.isArray(inasistenciasData) ? inasistenciasData : []
      );
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("No fue posible cargar los cursos y las inasistencias.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminar(id) {
    if (!window.confirm("¿Está seguro de eliminar esta inasistencia?")) {
      return;
    }

    try {
      await eliminarInasistencia(id);
      await cargarDatos();
    } catch (error) {
      console.error("Error eliminando inasistencia:", error);
      alert("No fue posible eliminar la inasistencia.");
    }
  }

  const lista = inasistencias.filter(
    (inasistencia) =>
      String(inasistencia.nombre_curso) === String(cursoSeleccionado) &&
      inasistencia.estado === "Ausente"
  );

  return (
    <>
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Cursos</h5>
        </div>

        <div className="card-body">
          {cargando && (
            <div className="alert alert-secondary">
              Cargando cursos...
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {!cargando && !error && (
            <>
              <label className="form-label fw-bold">
                Seleccione un curso
              </label>

              <select
                className="form-select"
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
              >
                <option value="">
                  Seleccione un curso
                </option>

                {cursos.map((curso) => (
                  <option
                    key={curso.id_curso}
                    value={curso.nombre_curso}
                  >
                    {curso.nombre_curso}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {cursoSeleccionado && (
        <div className="card shadow">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              Inasistencias del curso {cursoSeleccionado}
            </h5>
          </div>

          <div className="card-body">
            {lista.length === 0 ? (
              <div className="alert alert-info mb-0">
                No hay inasistencias registradas para este curso.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Materia</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Observaciones</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lista.map((inasistencia) => (
                      <tr key={inasistencia.id_asistencia}>
                        <td>
                          {[
                            inasistencia.primer_nombre,
                            inasistencia.segundo_nombre,
                            inasistencia.primer_apellido,
                            inasistencia.segundo_apellido,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </td>

                        <td>
                          {inasistencia.nombre_asignatura}
                        </td>

                        <td>
                          {inasistencia.fecha}
                        </td>

                        <td>
                          <span className="badge bg-danger">
                            Ausente
                          </span>
                        </td>

                        <td>
                          {inasistencia.observaciones ||
                            "Sin observaciones"}
                        </td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              eliminar(inasistencia.id_asistencia)
                            }
                          >
                            Eliminar
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
      )}
    </>
  );
}

export default CursosTable;