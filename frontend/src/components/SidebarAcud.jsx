import { Link } from "react-router-dom";

function SidebarAcud() {

    return (

        <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">

            <h6 className="text-uppercase text-muted fw-bold mb-3 px-2">
                Acudiente
            </h6>

            <div className="list-group list-group-flush">

                <Link to="/acudiente" className="list-group-item list-group-item-action">
                    <i className="bi bi-house-door me-2"></i>
                    Inicio
                </Link>

                <Link to="/consultar-estudiante" className="list-group-item list-group-item-action">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Consultar Estudiante
                </Link>

                <Link to="/estadistica-mensual" className="list-group-item list-group-item-action">
                    <i className="bi bi-bar-chart-line-fill me-2"></i>
                    Estadísticas
                </Link>

                <Link to="/generar-excusa" className="list-group-item list-group-item-action">
                    <i className="bi bi-file-earmark-plus-fill me-2"></i>
                    Generar Excusa
                </Link>

            </div>

        </div>

    );

}

export default SidebarAcud;