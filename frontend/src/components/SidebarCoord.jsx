import React from "react";
import { Link } from "react-router-dom";

function SidebarCoord() {
    return (
        <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">

            {/* TÍTULO */}
            <h6 className="text-uppercase text-muted fw-bold mb-3 px-2">
                Coordinador
            </h6>

            <div className="list-group list-group-flush">

                {/* INICIO */}
                <Link
                    to="/coordinador"
                    className="list-group-item list-group-item-action"
                >
                    <i className="bi bi-house-door me-2"></i>
                    Inicio
                </Link>

                {/* REVISAR EXCUSAS */}
                <Link
                    to="/gestion-excusas-coordinador"
                    className="list-group-item list-group-item-action"
                >
                    <i className="bi bi-file-earmark-text-fill me-2"></i>
                    Revisar Excusas
                </Link>

                {/* CURSOS */}
                <Link
                    to="/cursos"
                    className="list-group-item list-group-item-action"
                >
                    <i className="bi bi-journal-bookmark-fill me-2"></i>
                    Cursos
                </Link>

            </div>

        </div>
    );
}

export default SidebarCoord;