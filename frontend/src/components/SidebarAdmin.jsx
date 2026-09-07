import { Link, useLocation } from "react-router-dom";

function SidebarAdmin() {
  const location = useLocation();

  return (
    <div 
      className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm" 
      style={{ minHeight: "100vh" }}
    >
      <h6 className="text-uppercase text-muted fw-bold mb-3 px-2">
        Administrador
      </h6>

      <div className="list-group list-group-flush">
        <Link 
          to="/vista_admin" 
          className={`list-group-item list-group-item-action ${
            location.pathname === '/vista_admin' ? 'active fw-bold' : ''
          }`}
        >
          <i className="bi bi-house-door me-2"></i>
          Inicio
        </Link>

        <Link 
          to="/registrar_usuario" 
          className={`list-group-item list-group-item-action ${
            location.pathname === '/registrar_usuario' ? 'active fw-bold' : ''
          }`}
        >
          <i className="bi bi-person-plus-fill me-2"></i>
          Registrar Usuario
        </Link>

        <Link 
          to="/permisos" 
          className={`list-group-item list-group-item-action ${
            location.pathname === '/permisos' ? 'active fw-bold' : ''
          }`}
        >
          <i className="bi bi-shield-lock-fill me-2"></i>
          Permisos
        </Link>
      </div>
    </div>
  );
}

export default SidebarAdmin;