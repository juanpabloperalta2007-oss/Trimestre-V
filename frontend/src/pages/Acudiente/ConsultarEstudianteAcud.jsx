import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

function ConsultarEstudiante() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Control de tarjeta desplegada por ID
  const [estudianteAbierto, setEstudianteAbierto] = useState(null);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!usuario?.id_usuario) return;

      try {
        setCargando(true);
        const res = await axios.get(
          `http://localhost:5000/api/acudientes_estudiantes/mis-estudiantes/${usuario.id_usuario}`
        );
        setEstudiantes(res.data);
      } catch (err) {
        console.error("Error al obtener los estudiantes:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarEstudiantes();
  }, [usuario]);

  const toggleOpciones = (idEstudiante) => {
    if (estudianteAbierto === idEstudiante) {
      setEstudianteAbierto(null);
    } else {
      setEstudianteAbierto(idEstudiante);
    }
  };

  // Funciones de navegación hacia las vistas
  const irAEstadisticas = (estudiante) => {
    navigate("/acudiente/estadisticas", { state: { estudiante } });
  };

  const irAGenerarExcusa = (estudiante) => {
    navigate("/acudiente/generar-excusa", { state: { estudiante } });
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarAcud />

          <div className="col-md-9 col-lg-10 p-4">
            <h5 className="text-center fw-bold text-secondary mb-1">
              CONSULTAR ESTUDIANTES
            </h5>
            <p className="text-center text-muted small mb-4">
              Seleccione el estudiante para ver el reporte detallado o realizar gestiones.
            </p>

            {cargando ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                Cargando información...
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="card border-0 shadow-sm p-4 text-center text-muted col-md-8 mx-auto">
                No hay estudiantes asociados a tu cuenta de acudiente.
              </div>
            ) : (
              <div className="row justify-content-center g-4">
                {estudiantes.map((est) => {
                  const estaAbierto = estudianteAbierto === est.id_estudiante;
                  const iniciales = `${est.primer_nombre?.[0] || ""}${est.primer_apellido?.[0] || ""}`;

                  return (
                    <div className="col-12 col-md-8 col-lg-7" key={est.id_estudiante}>
                      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                        
                        {/* TARJETA PRINCIPAL DEL ESTUDIANTE */}
                        <div
                          className="card-body text-center p-4"
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleOpciones(est.id_estudiante)}
                        >
                          <div 
                            className="d-inline-flex align-items-center justify-content-center bg-light text-secondary rounded-circle fw-bold mb-2 shadow-sm"
                            style={{ width: "55px", height: "55px", fontSize: "1.2rem" }}
                          >
                            {iniciales}
                          </div>

                          <h5 className="fw-bold text-dark mb-0">
                            {est.primer_nombre} {est.segundo_nombre || ""}
                          </h5>
                          <h5 className="fw-bold text-dark mb-3">
                            {est.primer_apellido} {est.segundo_apellido || ""}
                          </h5>

                          <div className="bg-primary text-white py-2 rounded-2 fw-semibold d-flex align-items-center justify-content-center gap-2">
                            <span>Curso {est.nombre_curso || est.curso || "601"}</span>
                            <span style={{ fontSize: "0.8rem" }}>{estaAbierto ? "▲" : "▼"}</span>
                          </div>
                        </div>

                        {/* DESPLIEGUE CON REDIRECCIÓN A RUTAS */}
                        {estaAbierto && (
                          <div className="bg-light p-3 border-top">
                            <p className="small text-muted mb-2 fw-bold text-center text-uppercase">
                              Opciones disponibles
                            </p>
                            
                            <div className="d-grid gap-2">
                              {/* Botón Estadísticas */}
                              <button
                                className="btn btn-outline-primary text-start fw-semibold bg-white d-flex align-items-center justify-content-between py-2"
                                onClick={() => irAEstadisticas(est)}
                              >
                                <span>📊 Estadísticas Mensuales de Asistencia</span>
                                <span>&rarr;</span>
                              </button>

                              {/* Botón Generar Excusa */}
                              <button
                                className="btn btn-outline-success text-start fw-semibold bg-white d-flex align-items-center justify-content-between py-2"
                                onClick={() => irAGenerarExcusa(est)}
                              >
                                <span>📝 Radicar Excusa / Justificación</span>
                                <span>&rarr;</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ConsultarEstudiante;