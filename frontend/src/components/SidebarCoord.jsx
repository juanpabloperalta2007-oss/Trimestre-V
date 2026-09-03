import { Link } from "react-router-dom";

function SidebarCoordinador() {

    return (

        <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">

            <h6 className="text-uppercase text-muted fw-bold mb-3 px-2">
                Coordinador
            </h6>

            <div className="list-group list-group-flush">

                <Link to="/coordinador" className="list-group-item list-group-item-action">
                    <i className="bi bi-house-door me-2"></i>
                    Inicio
                </Link>

                <Link to="/gestion-excusas" className="list-group-item list-group-item-action">
                    <i className="bi bi-file-earmark-text-fill me-2"></i>
                    Revisar Excusas
                </Link>

                <Link to="/cursos" className="list-group-item list-group-item-action">
                    <i className="bi bi-journal-bookmark-fill me-2"></i>
                    Cursos
                </Link>

            </div>

        </div>

    );

}

export default SidebarCoordinador;