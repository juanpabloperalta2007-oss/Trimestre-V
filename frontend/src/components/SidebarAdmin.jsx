import { Link } from "react-router-dom";

function SidebarAdmin() {

    return (

        <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">

            <h6 className="text-uppercase text-muted fw-bold mb-3 px-2">
                Administrador
            </h6>

            <div className="list-group list-group-flush">

                <Link to="/vista_admin" className="list-group-item list-group-item-action">
                    <i className="bi bi-house-door me-2"></i>
                    Inicio
                </Link>

                <Link to="/usuarios" className="list-group-item list-group-item-action">
                    <i className="bi bi-people-fill me-2"></i>
                    Usuarios
                </Link>

                <Link to="/registrar-usuario" className="list-group-item list-group-item-action">
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Registrar Usuario
                </Link>

                <Link to="/permisos" className="list-group-item list-group-item-action">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Permisos
                </Link>

            </div>

        </div>

    );

}

export default SidebarAdmin;