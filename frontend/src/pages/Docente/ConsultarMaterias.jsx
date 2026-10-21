import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import { obtenerCursoDocente, obtenerAsignaturasPorCursoDocente, actualizarEstadoAsignaturaCurso } from "../../services/api";

function ConsultarMaterias() {
  const [cursoDocente, setCursoDocente] = useState(null);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLogueado?.id_usuario) {
      cargarDatos(usuarioLogueado.id_usuario);
    } else {
      setCargando(false);
    }
  }, []);

  const cargarDatos = async (idUsuario) => {
    try {
      const curso = await obtenerCursoDocente(idUsuario);
      setCursoDocente(curso);

      if (curso?.id_curso) {
        const listaMaterias = await obtenerAsignaturasPorCursoDocente(curso.id_curso);
        setAsignaturas(listaMaterias);
      }
    } catch (err) {
      console.error("Error al cargar las materias asignadas:", err);
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstadoMateria = async (idAsignatura, estadoActual) => {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";
    try {
      await actualizarEstadoAsignaturaCurso({
        id_asignatura: idAsignatura,
        id_curso: cursoDocente.id_curso,
        estado: nuevoEstado
      });
      // Actualizamos localmente la vista
      setAsignaturas(asignaturas.map(m => 
        m.id_asignatura === idAsignatura ? { ...m, estado: nuevoEstado } : m
      ));
    } catch (error) {
      alert("Error al actualizar el estado de la materia");
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
            <h2 className="fw-bold text-dark mb-4">Materias Asignadas a mi Curso</h2>

            {cursoDocente ? (
              <>
                <div className="alert alert-info shadow-sm mb-4">
                  Curso Dirigido: <strong>{cursoDocente.nombre_curso}</strong> (Estas materias fueron asignadas por el coordinador).
                </div>

                <div className="row">
                  {asignaturas.map((mat) => (
                    <div className="col-md-4 mb-3" key={mat.id_asignatura}>
                      <div className="card shadow-sm h-100 border-0">
                        <div className="card-body d-flex flex-column justify-content-between">
                          <div>
                            <h5 className="card-title text-primary">{mat.nombre_asignatura}</h5>
                            <p className="card-text text-muted small">
                              Área: {mat.nombre_area || "General"} <br />
                              Estado: <span className={`badge bg-${mat.estado === 'Activo' ? 'success' : 'secondary'}`}>
                                {mat.estado || "Activo"}
                              </span>
                            </p>
                          </div>
                          <div className="d-grid gap-2 mt-3">
                            <button 
                              className={`btn btn-sm btn-outline-${mat.estado === 'Activo' ? 'danger' : 'success'}`}
                              onClick={() => cambiarEstadoMateria(mat.id_asignatura, mat.estado)}
                            >
                              {mat.estado === 'Activo' ? 'Desactivar para este curso' : 'Activar para este curso'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {asignaturas.length === 0 && (
                    <div className="col-12">
                      <div className="alert alert-warning text-center">
                        No tienes materias asignadas por el coordinador para este curso todavía.
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="alert alert-warning shadow-sm">
                ⚠️ No tienes un curso asignado como director.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ConsultarMaterias;