import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SidebarAdmin from "../../components/SidebarAdmin";
import "../../styles/GestionUsuario.css";
import { useLocation, useNavigate } from "react-router-dom";

function VerUsuario() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recupera el usuario pasado por la navegación
  const usuario = location.state || {};

  return (
    <>
      <Header />

      <div className="d-flex" style={{ minHeight: "80vh" }}>
        <SidebarAdmin />

        <div className="container p-4" style={{ flex: 1 }}>
          <div className="card shadow-sm p-4 bg-white rounded">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2>Detalles del Usuario</h2>
                <p className="text-muted">Información detallada registrada en el sistema.</p>
              </div>
              <i className="bi bi-person-lines-fill fs-1 text-primary"></i>
            </div>

            <hr />

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">ID del Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  value={usuario.id_usuario || usuario.id || "N/A"}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Correo / Login</label>
                <input
                  type="email"
                  className="form-control"
                  value={usuario.login || "N/A"}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Rol</label>
                <input
                  type="text"
                  className="form-control"
                  value={usuario.rol || "Profesor"}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Estado</label>
                <div>
                  <span
                    className={`badge ${
                      usuario.estado === "Activo" ? "bg-success" : "bg-danger"
                    } fs-6`}
                  >
                    {usuario.estado || "Activo"}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/vista_admin")}
              >
                Volver
              </button>

              <button
                className="btn btn-primary"
                onClick={() => navigate("/editar_usuario", { state: usuario })}
              >
                Ir a Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default VerUsuario;