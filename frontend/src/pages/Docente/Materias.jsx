import { useState } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";

function Materias() {
  const [nombreMateria, setNombreMateria] = useState("");
  const [estadoMateria, setEstadoMateria] = useState("");

  const guardarMateria = (e) => {
    e.preventDefault();

    if (!nombreMateria || !estadoMateria) {
      alert("Por favor, completa todos los campos");
      return;
    }

    let listaMaterias = JSON.parse(localStorage.getItem("misMaterias")) || [];
    listaMaterias.push({ nombre: nombreMateria, estado: estadoMateria });
    localStorage.setItem("misMaterias", JSON.stringify(listaMaterias));

    alert("Materia guardada con éxito");
    setNombreMateria("");
    setEstadoMateria("");
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />

          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Registro de Materias</h2>

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
                          placeholder="Ej: Programación"
                          value={nombreMateria}
                          onChange={(e) => setNombreMateria(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Estado</label>
                        <select
                          className="form-select"
                          value={estadoMateria}
                          onChange={(e) => setEstadoMateria(e.target.value)}
                        >
                          <option value="" disabled>Seleccione el estado</option>
                          <option value="1">Activo</option>
                          <option value="0">Inactivo</option>
                        </select>
                      </div>

                      <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">
                          Guardar Materia
                        </button>
                        <a href="/materias-agregadas" className="btn btn-outline-primary">
                          Ver materias registradas
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => { setNombreMateria(""); setEstadoMateria(""); }}
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