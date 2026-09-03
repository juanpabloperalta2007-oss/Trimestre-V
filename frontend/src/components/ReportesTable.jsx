import { useEffect, useState } from "react";
import { obtenerReportes } from "../services/api";

function ReportesTable() {

  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {

    try {

      const datos = await obtenerReportes();

      setReportes(datos);

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <div className="card shadow">

      <div className="card-header bg-primary text-white">

        <h5 className="mb-0">

          <i className="bi bi-table me-2"></i>

          Reporte mensual

        </h5>

      </div>

      <div className="card-body">

        <table className="table table-hover">

          <thead className="table-light">

            <tr>

              <th>Curso</th>

              <th>Mes</th>

              <th>Asistencia</th>

              <th>Presentes</th>

              <th>Ausentes</th>

            </tr>

          </thead>

          <tbody>

            {reportes.map((r) => (

              <tr key={r.id}>

                <td>{r.curso}</td>

                <td>{r.mes}</td>

                <td>{r.porcentaje}%</td>

                <td>{r.presentes}</td>

                <td>{r.ausentes}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default ReportesTable;