import { Link } from "react-router-dom";

function SidebarDocente() {

    return (

        <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">

            <h6 className="text-uppercase text-muted fw-bold mb-3 px-2">
                Docente
            </h6>

            <div className="list-group list-group-flush">

                <Link to="/inicio" className="list-group-item list-group-item-action">
                    <i className="bi bi-house-door me-2"></i>
                    Inicio
                </Link>

                <Link to="/materias" className="list-group-item list-group-item-action">
                    <i className="bi bi-book me-2"></i>
                    Registrar Materias
                </Link>

                <Link to="/consultar-materias" className="list-group-item list-group-item-action">
                    <i className="bi bi-journal-bookmark me-2"></i>
                    Consultar Materias
                </Link>

                <Link to="/consultar-horario" className="list-group-item list-group-item-action">
                    <i className="bi bi-clock-history me-2"></i>
                    Horarios
                </Link>

                <Link to="/alertas" className="list-group-item list-group-item-action">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Alertas
                </Link>

                <Link to="/notificaciones" className="list-group-item list-group-item-action">
                    <i className="bi bi-envelope-fill me-2"></i>
                    Notificaciones
                </Link>

                <Link to="/reportes" className="list-group-item list-group-item-action">
                    <i className="bi bi-bar-chart-fill me-2"></i>
                    Reportes
                </Link>

            </div>

        </div>

    );

}

export default SidebarDocente;