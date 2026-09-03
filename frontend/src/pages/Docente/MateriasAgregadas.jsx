import { useState } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";

function MateriasAgregadas() {
  const [listaMaterias, setListaMaterias] = useState(
    JSON.parse(localStorage.getItem("misMaterias")) || []
  );

  const eliminarMateria = (indice) => {
    const nuevaLista = listaMaterias.filter((_, i) => i !== indice);
    localStorage.setItem("misMaterias", JSON.stringify(nuevaLista));
    setListaMaterias(nuevaLista);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />

          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Materias Registradas</h2>

            <div className="card shadow border-0">

              <div className="card-header bg-primary text-white text-center py-3">
                <h4 className="mb-0">Lista de Materias</h4>
              </div>

              <div className="card-body p-3">
                <div className="table-responsive">
                  <table className="table table-hover align-middle text-center">
                    <thead className="table-dark">
                      <tr>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Código</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaMaterias.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-muted">No hay materias registradas</td>
                        </tr>
                      ) : (
                        listaMaterias.map((materia, index) => (
                          <tr key={index}>
                            <td>{materia.nombre}</td>
                            <td>{materia.estado === "1" ? "Activo" : "Inactivo"}</td>
                            <td>{index + 1}</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => eliminarMateria(index)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <a href="/materias" className="btn btn-secondary">Volver</a>
                  <a href="/materias" className="btn btn-outline-primary">Nueva materia</a>
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

export default MateriasAgregadas;