import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

const MESES = [
  { id: 1, nombre: "Enero" },
  { id: 2, nombre: "Febrero" },
  { id: 3, nombre: "Marzo" },
  { id: 4, nombre: "Abril" },
  { id: 5, nombre: "Mayo" },
  { id: 6, nombre: "Junio" },
  { id: 7, nombre: "Julio" },
  { id: 8, nombre: "Agosto" },
  { id: 9, nombre: "Septiembre" },
  { id: 10, nombre: "Octubre" },
  { id: 11, nombre: "Noviembre" },
  { id: 12, nombre: "Diciembre" },
];

function EstadisticasAcud() {
  const { usuario } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);

  const [metricas, setMetricas] = useState({
    asistencias: 0,
    fallas_sin_justificar: 0,
    fallas_justificadas: 0,
    retardos: 0,
  });

  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);
  const [cargandoMetricas, setCargandoMetricas] = useState(false);

  // Obtener los estudiantes del acudiente
  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!usuario?.id_usuario) return;

      try {
        setCargandoEstudiantes(true);
        const res = await axios.get(
          `http://localhost:5000/api/acudientes_estudiantes/mis-estudiantes/${usuario.id_usuario}`
        );
        setEstudiantes(res.data);
        if (res.data.length > 0) {
          setEstudianteSeleccionado(res.data[0]);
        }
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
      } finally {
        setCargandoEstudiantes(false);
      }
    };

    cargarEstudiantes();
  }, [usuario]);

  // Consultar estadísticas según el estudiante y mes seleccionado
  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!estudianteSeleccionado) return;

      try {
        setCargandoMetricas(true);
        const res = await axios.get(
          `http://localhost:5000/api/asistencia/estadisticas/${estudianteSeleccionado.id_estudiante}?mes=${mesSeleccionado}`
        );
        setMetricas(res.data);
      } catch (err) {
        console.error("Error al cargar las métricas:", err);
      } finally {
        setCargandoMetricas(false);
      }
    };

    cargarEstadisticas();
  }, [estudianteSeleccionado, mesSeleccionado]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarAcud />

          <div className="col-md-9 col-lg-10 p-4">
            <h5 className="text-center fw-bold text-secondary mb-4">
              ESTADÍSTICA MENSUAL DE ASISTENCIA
            </h5>

            {cargandoEstudiantes ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                Cargando información del estudiante...
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="card border-0 shadow-sm p-4 text-center text-muted">
                No tienes estudiantes asociados para consultar.
              </div>
            ) : (
              <div>
                {/* Selector de estudiante si tiene más de uno */}
                {estudiantes.length > 1 && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary small me-2">
                      Estudiante:
                    </label>
                    <select
                      className="form-select d-inline-block w-auto"
                      value={estudianteSeleccionado?.id_estudiante}
                      onChange={(e) => {
                        const est = estudiantes.find(
                          (item) => item.id_estudiante === parseInt(e.target.value)
                        );
                        setEstudianteSeleccionado(est);
                      }}
                    >
                      {estudiantes.map((e) => (
                        <option key={e.id_estudiante} value={e.id_estudiante}>
                          {e.primer_nombre} {e.primer_apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subtítulo y selector de Mes */}
                <div className="mb-4">
                  <p className="mb-3 text-secondary">
                    Mostrando reporte para:{" "}
                    <strong className="text-primary">
                      {estudianteSeleccionado?.primer_nombre}{" "}
                      {estudianteSeleccionado?.segundo_nombre || ""}{" "}
                      {estudianteSeleccionado?.primer_apellido}{" "}
                      {estudianteSeleccionado?.segundo_apellido || ""}
                    </strong>
                  </p>

                  <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold text-dark m-0">Mes:</label>
                    <select
                      className="form-select w-auto shadow-sm"
                      value={mesSeleccionado}
                      onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                    >
                      {MESES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contención de Métricas */}
                {cargandoMetricas ? (
                  <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                    Actualizando estadísticas...
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="card border-0 shadow-sm p-3 h-100">
                        <span className="text-muted small fw-semibold">Asistencias</span>
                        <h1 className="fw-bold text-dark my-2">{metricas.asistencias}</h1>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="card border-0 shadow-sm p-3 h-100">
                        <span className="text-muted small fw-semibold">Fallas sin justificar</span>
                        <h1 className="fw-bold text-dark my-2">{metricas.fallas_sin_justificar}</h1>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="card border-0 shadow-sm p-3 h-100">
                        <span className="text-muted small fw-semibold">Fallas justificadas</span>
                        <h1 className="fw-bold text-dark my-2">{metricas.fallas_justificadas}</h1>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                      <div className="card border-0 shadow-sm p-3 h-100">
                        <span className="text-muted small fw-semibold">Retardos</span>
                        <h1 className="fw-bold text-dark my-2">{metricas.retardos}</h1>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EstadisticasAcud;