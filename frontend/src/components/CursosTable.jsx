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

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {

    const c = await obtenerCursos();
    const i = await obtenerInasistencias();

    setCursos(c);
    setInasistencias(i);

  }

  async function eliminar(id) {

    if (!window.confirm("¿Eliminar la inasistencia?")) return;

    await eliminarInasistencia(id);

    cargarDatos();

  }

  const lista = inasistencias.filter(
    (i) => i.curso === cursoSeleccionado
  );

  return (
    <>

      <div className="card shadow mb-4">

        <div className="card-header bg-primary text-white">

          <h5 className="mb-0">

            Cursos

          </h5>

        </div>

        <div className="card-body">

          <select
            className="form-select"
            value={cursoSeleccionado}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
          >

            <option value="">Seleccione un curso</option>

            {cursos.map((c) => (

              <option key={c.id} value={c.nombre}>

                {c.nombre}

              </option>

            ))}

          </select>

        </div>

      </div>

      {cursoSeleccionado && (

        <div className="card shadow">

          <div className="card-header bg-success text-white">

            Inasistencias del curso

          </div>

          <div className="card-body">

            <table className="table table-hover">

              <thead>

                <tr>

                  <th>Estudiante</th>

                  <th>Materia</th>

                  <th>Fecha</th>

                  <th>Justificada</th>

                  <th></th>

                </tr>

              </thead>

              <tbody>

                {lista.map((i) => (

                  <tr key={i.id}>

                    <td>{i.estudiante}</td>

                    <td>{i.materia}</td>

                    <td>{i.fecha}</td>

                    <td>

                      {i.justificada ? (

                        <span className="badge bg-success">

                          Sí

                        </span>

                      ) : (

                        <span className="badge bg-danger">

                          No

                        </span>

                      )}

                    </td>

                    <td>

                      {!i.justificada && (

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminar(i.id)}
                        >

                          Eliminar

                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </>

  );

}

export default CursosTable;