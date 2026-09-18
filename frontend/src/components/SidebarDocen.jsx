import React from "react";
import { Link } from "react-router-dom";

function SidebarDocen() {
    return (
        <div
            className="col-md-3 col-lg-2 bg-white border-end"
            style={{
                minHeight: "calc(100vh - 70px)",
                padding: "0 16px"
            }}
        >

            {/* ==============================
                TÍTULO DEL MENÚ
            ============================== */}

            <div className="pt-3 pb-2">
                <h5
                    className="fw-bold text-secondary"
                    style={{
                        fontSize: "18px",
                        marginBottom: "15px"
                    }}
                >
                    DOCENTE
                </h5>
            </div>


            {/* ==============================
                INICIO
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/inicio"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-house-door me-2"></i>
                    Inicio
                </Link>
            </div>


            {/* ==============================
                REGISTRAR MATERIAS
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/materias"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-journal-plus me-2"></i>
                    Registrar Materias
                </Link>
            </div>


            {/* ==============================
                CONSULTAR MATERIAS
                RUTA CORRECTA:
                /materias-agregadas
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/materias-agregadas"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-journal-text me-2"></i>
                    Consultar Materias
                </Link>
            </div>


            {/* ==============================
                HORARIOS
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/consultar-horario"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-calendar3 me-2"></i>
                    Horarios
                </Link>
            </div>


            {/* ==============================
                LLAMAR LISTA
                NUEVA FUNCIÓN
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/llamar-lista"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-clipboard-check me-2"></i>
                    Llamar lista
                </Link>
            </div>


            {/* ==============================
                ALERTAS
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/alertas"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Alertas
                </Link>
            </div>


            {/* ==============================
                NOTIFICACIONES
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/notificaciones"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-bell me-2"></i>
                    Notificaciones
                </Link>
            </div>


            {/* ==============================
                REPORTES
            ============================== */}

            <div
                style={{
                    borderBottom: "1px solid #dee2e6"
                }}
            >
                <Link
                    to="/reportes"
                    className="nav-link text-dark"
                    style={{
                        padding: "10px 15px"
                    }}
                >
                    <i className="bi bi-bar-chart-line me-2"></i>
                    Reportes
                </Link>
            </div>

        </div>
    );
}

export default SidebarDocen;