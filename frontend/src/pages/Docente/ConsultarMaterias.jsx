import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import { obtenerAsignaturasPorCursoDocente } from "../../services/api";

function ConsultarMaterias() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario") || "{}");
    const idUsuario = usuarioLogueado.id_usuario || usuarioLogueado.id || usuarioLogueado.id_persona;

    if (idUsuario) {
      cargarMateriasDocente(idUsuario);
    } else {
      setCargando(false);
      setError("No se encontró el usuario en la sesión.");
    }
  }, []);

  const cargarMateriasDocente = async (idUsuario) => {
    try {
      setCargando(true);
      setError("");
      
      const res = await obtenerAsignaturasPorCursoDocente(idUsuario);
      
      let lista = [];
      if (Array.isArray(res)) {
        lista = res;
      } else if (res && Array.isArray(res.asignaturas)) {
        lista = res.asignaturas;
      }

      setMaterias(lista);
    } catch (err) {
      console.error("Error al cargar las materias asignadas:", err);
      setError("No fue posible cargar las materias asignadas.");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light w-100">
        <Header />
        <div className="container-fluid flex-grow-1 d-flex justify-content-center align-items-center">
          <p className="fw-bold text-muted">Cargando materias asignadas...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />

          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Consultar Materias y Cursos Asignados</h2>

            <div className="alert alert-info shadow-sm mb-4">
              ℹ️ Estas son las materias y cursos que te han sido asignados institucionalmente por el coordinador.
            </div>

            {error && (
              <div className="alert alert-danger shadow-sm mb-4">
                {error}
              </div>
            )}

            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Carga Académica Registrada</h5>
              </div>
              <div className="card-body p-0">
                {materias.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-journal-x fs-1 d-block mb-2"></i>
                    No tienes materias o cursos asignados actualmente.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="text-center">#</th>
                          <th>Asignatura</th>
                          <th>Área</th>
                          <th className="text-center">Curso Asignado</th>
                          <th className="text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materias.map((mat, index) => {
                          const nombreCurso = mat.nombre_curso || mat.nombre || mat.grado || `Curso ${mat.id_curso || ""}`;
                          const nombreMateria = mat.nombre_asignatura || "Sin nombre";
                          const nombreArea = mat.nombre_area || "General";
                          const estado = mat.estado || "Activo";

                          return (
                            <tr key={mat.id_asignatura_curso || index}>
                              <td className="text-center fw-bold">{index + 1}</td>
                              <td>
                                <span className="fw-bold text-primary">{nombreMateria}</span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{nombreArea}</span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-success fs-6 px-3 py-2">
                                  {nombreCurso}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className={`badge bg-${estado === 'Activo' ? 'success' : 'secondary'}`}>
                                  {estado}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ConsultarMaterias;