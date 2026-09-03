import React from 'react';

function Sidebar() {
  return (
    <div className="col-md-3 col-lg-2 bg-white p-3 border-end shadow-sm">
      <h6 className="text-uppercase text-muted fw-bold mb-3 px-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
        Menú de Navegación
      </h6>
      
      {/* Añadimos d-flex y align-items-center a los enlaces para obligar al icono y al texto a ir en la misma línea */}
      <div className="list-group list-group-flush">
        <a href="#" className="list-group-item list-group-item-action active rounded mb-1 d-flex align-items-center">
          <i className="bi bi-house-door me-2"></i> <span>Inicio</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-calendar3 me-2"></i> <span>Calendario</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-envelope me-2"></i> <span>Correo</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-journal-text me-2"></i> <span>Cursos</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-clock-history me-2"></i> <span>Consultar horarios</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-book me-2"></i> <span>Consultar materias</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-people me-2"></i> <span>Consultar Estudiantes</span>
        </a>
        <a href="#" className="list-group-item list-group-item-action rounded mb-1 text-secondary d-flex align-items-center">
          <i className="bi bi-check2-square me-2"></i> <span>Registrar asistencia</span>
        </a>
      </div>
    </div>
  );
}

export default Sidebar;