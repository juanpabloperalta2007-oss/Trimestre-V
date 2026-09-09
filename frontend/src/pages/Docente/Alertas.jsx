import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import AlertasTable from "../../components/AlertasTable";
import { obtenerInasistencias } from "../../services/api";

function Alertas() {
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    exceso: 0,
    perdida: 0,
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      const datos = await obtenerInasistencias();

      console.log("Datos de inasistencias:", datos);

      if (!Array.isArray(datos)) {
        return;
      }

      const estudiantes = {};

      datos.forEach((inasistencia) => {
        const idEstudiante =
          inasistencia.id_estudiante ||
          inasistencia.id ||
          inasistencia.id_estudiante_curso;

        if (!idEstudiante) {
          return;
        }

        if (!estudiantes[idEstudiante]) {
          estudiantes[idEstudiante] = 0;
        }

        estudiantes[idEstudiante]++;
      });

      const cantidades = Object.values(estudiantes);

      const exceso = cantidades.filter(
        (cantidad) => cantidad >= 5 && cantidad < 10
      ).length;

      const perdida = cantidades.filter(
        (cantidad) => cantidad >= 10
      ).length;

      setEstadisticas({
        total: exceso + perdida,
        exceso,
        perdida,
      });
    } catch (error) {
      console.error(
        "Error al cargar las estadísticas de alertas:",
        error
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Layout titulo="Alertas de Inasistencia">

      <div className="row mb-4">

        {/* TOTAL ALERTAS */}
        <div className="col-md-4 mb-3">
          <div className="card border-primary shadow-sm h-100">
            <div className="card-body text-center">

              <i className="bi bi-bell-fill text-primary fs-1"></i>

              <h3 className="mt-3">
                {cargando ? "..." : estadisticas.total}
              </h3>

              <p className="mb-0 fw-bold">
                Total Alertas
              </p>

            </div>
          </div>
        </div>

        {/* EXCESO */}
        <div className="col-md-4 mb-3">
          <div className="card border-warning shadow-sm h-100">
            <div className="card-body text-center">

              <i className="bi bi-exclamation-circle-fill text-warning fs-1"></i>

              <h3 className="mt-3">
                {cargando ? "..." : estadisticas.exceso}
              </h3>

              <p className="mb-0 fw-bold">
                Exceso de Inasistencias
              </p>

            </div>
          </div>
        </div>

        {/* PÉRDIDA */}
        <div className="col-md-4 mb-3">
          <div className="card border-danger shadow-sm h-100">
            <div className="card-body text-center">

              <i className="bi bi-x-circle-fill text-danger fs-1"></i>

              <h3 className="mt-3">
                {cargando ? "..." : estadisticas.perdida}
              </h3>

              <p className="mb-0 fw-bold">
                Pérdida de Materia
              </p>

            </div>
          </div>
        </div>

      </div>

      <AlertasTable />

    </Layout>
  );
}

export default Alertas;