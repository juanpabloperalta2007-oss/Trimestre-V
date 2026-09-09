import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { usuario, logout } = useAuth();

  const manejarCerrarSesion = () => {
    if (window.confirm("¿Está seguro de que desea cerrar la sesión?")) {
      logout();
    }
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Título Principal */}
        <Link to="/" className="navbar-brand fw-bold text-white fs-4 text-decoration-none">
          Liceo Antonio de Toledo
        </Link>

        {/* Zona Derecha: Usuario + Botón Salir + Insignia GAE */}
        <div className="d-flex align-items-center gap-3">
          {usuario && (
            <span className="text-white small fw-bold d-none d-md-inline">
              {usuario.login || usuario.correo || "Usuario"}
            </span>
          )}

          <button
            onClick={manejarCerrarSesion}
            className="btn btn-outline-light btn-sm fw-bold px-3 d-flex align-items-center gap-1"
            title="Cerrar Sesión"
          >
            <span>Cerrar Sesión</span>
          </button>

          {/* Botón / Insignia GAE recuperada */}
          <span className="btn btn-light btn-sm text-primary fw-bold ms-2 px-3 shadow-sm">
            GAE
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;