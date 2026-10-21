import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import { obtenerCursoDocente, crearAsignaturaDocente } from "../../services/api";

function Materias() {
  const [nombreMateria, setNombreMateria] = useState("");
  const [estadoMateria, setEstadoMateria] = useState("Activo");
  const [cursoDocente, setCursoDocente] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLogueado?.id_usuario) {
      cargarCursoDirector(usuarioLogueado.id_usuario);
    } else {
      setCargando(false);
    }
  }, []);

  const cargarCursoDirector = async (idUsuario) => {
    try {
      const curso = await obtenerCursoDocente(idUsuario);
      setCursoDocente(curso);
    } catch (err) {
      console.error("El docente no tiene un curso asignado como director:", err);
    } finally {
      setCargando(false);
    }
  };

  const guardarMateria = async (e) => {
    e.preventDefault();

    if (!cursoDocente) {
      alert("No estás asignado como director de ningún curso, por lo que no puedes registrar materias.");
      return;
    }

    if (!nombreMateria || !estadoMateria) {
      alert("Por favor, completa todos los campos");
      return;
    }

    try {
      await crearAsignaturaDocente({
        nombre_asignatura: nombreMateria,
        estado: estadoMateria,
        id_curso: cursoDocente.id_curso
      });

      alert("Materia guardada con éxito en tu curso.");
      setNombreMateria("");
      setEstadoMateria("Activo");
    } catch (error) {
      console.error("Error al guardar la materia:", error);
      alert("Hubo un error al registrar la materia en la base de datos.");
    }
  };

  if (cargando) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light w-100">
        <Header />
        <div className="container-fluid flex-grow-1 d-flex justify-content-center align-items-center">
          <p className="fw-bold text-muted">Cargando información del curso...</p>
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
            <h2 className="fw-bold text-dark mb-4">Registro de Materias</h2>

            {cursoDocente ? (
              <div className="alert alert-info shadow-sm mb-4">
                Registrando materias para tu curso dirigido: <strong>{cursoDocente.nombre_curso}</strong>
              </div>
            ) : (
              <div className="alert alert-warning shadow-sm mb-4">
                ⚠️ No tienes un curso asignado como director por el coordinador. No podrás registrar materias hasta que se te asigne uno.
              </div>
            )}

            <div className="row justify-content-center">
              <div className="col-12 col-md-6 col-lg-5">
                <div className="card shadow border-0">
                  <div className="card-header bg-primary text-white text-center py-3">
                    <h4 className="mb-0">Nueva Materia</h4>
                  </div>

                  <div className="card-body p-4">
                    <form onSubmit={guardarMateria}>
                      <div className="mb-3">
                        <label className="form-label">Nombre de la Materia</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Matemáticas"
                          value={nombreMateria}
                          onChange={(e) => setNombreMateria(e.target.value)}
                          required
                          disabled={!cursoDocente}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Estado</label>
                        <select
                          className="form-select"
                          value={estadoMateria}
                          onChange={(e) => setEstadoMateria(e.target.value)}
                          disabled={!cursoDocente}
                        >
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>

                      <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary" disabled={!cursoDocente}>
                          Guardar Materia
                        </button>
                        {/* Asegúrate de que esta ruta coincida con la que tienes en tu App.js / Router */}
                        <a href="/materias-agregadas" className="btn btn-outline-primary">
                          Ver materias registradas
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => { setNombreMateria(""); setEstadoMateria("Activo"); }}
                        >
                          Limpiar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Materias;