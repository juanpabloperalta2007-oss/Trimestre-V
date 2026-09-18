import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const estiloEnlace = ({ isActive }) =>
    `list-group-item list-group-item-action rounded mb-1 d-flex align-items-center ${
      isActive ? "active" : "text-secondary"
    }`;

  return (
    <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">

      <h6
        className="text-uppercase text-muted fw-bold mb-3 px-2"
        style={{
          fontSize: "0.75rem",
          letterSpacing: "1px",
        }}
      >
        Menú de Navegación
      </h6>

      <div className="list-group list-group-flush">

        <NavLink
          to="/inicio"
          end
          className={estiloEnlace}
        >
          <i className="bi bi-house-door me-2"></i>
          <span>Inicio</span>
        </NavLink>

        <NavLink
          to="/materias"
          className={estiloEnlace}
        >
          <i className="bi bi-journal-text me-2"></i>
          <span>Registrar Materias</span>
        </NavLink>

        <NavLink
          to="/materias-agregadas"
          className={estiloEnlace}
        >
          <i className="bi bi-book me-2"></i>
          <span>Consultar Materias</span>
        </NavLink>

        <NavLink
          to="/consultar-horario"
          className={estiloEnlace}
        >
          <i className="bi bi-clock-history me-2"></i>
          <span>Horarios</span>
        </NavLink>

        <NavLink
          to="/alertas"
          className={estiloEnlace}
        >
          <i className="bi bi-exclamation-triangle me-2"></i>
          <span>Alertas</span>
        </NavLink>

        <NavLink
          to="/notificaciones"
          className={estiloEnlace}
        >
          <i className="bi bi-bell me-2"></i>
          <span>Notificaciones</span>
        </NavLink>

        <NavLink
          to="/reportes"
          className={estiloEnlace}
        >
          <i className="bi bi-bar-chart me-2"></i>
          <span>Reportes</span>
        </NavLink>

      </div>
    </div>
  );
}

export default Sidebar;