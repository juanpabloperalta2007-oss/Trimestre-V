import React from 'react';
import Header from '../../components/Header';
import SidebarDocen from '../../components/SidebarDocen';
import BuzonCard from '../../components/BuzonCard';
import Footer from '../../components/Footer';

function Inicio() {
  function obtenerFechaCompleta() {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  return (
    // w-100 asegura que el contenedor principal ocupe todo el ancho
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      {/* 1. Barra superior */}
      <Header />

      {/* Usamos container-fluid con px-0 para remover márgenes laterales automáticos */}
      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100"> 
          {/* g-0 elimina el espacio extra entre columnas de Bootstrap */}
          
          {/* 2. Menú lateral izquierdo */}
          <SidebarDocen />

          {/* Área del Contenido Central */}
          <div className="col-md-9 col-lg-10 p-4">
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-dark m-0">Inicio</h2>
                <p className="text-muted small mb-0">
                  <i className="bi bi-clock me-1"></i> <strong>Hoy:</strong> {obtenerFechaCompleta()}
                </p>
              </div>
              <button className="btn btn-outline-primary d-flex align-items-center gap-2">
                <i className="bi bi-journal-bookmark"></i> Agenda
              </button>
            </div>

            {/* 3. Tarjeta del Buzón */}
            <BuzonCard />

          </div>
        </div>
      </div>

      {/* 4. Pie de página */}
      <Footer />
    </div>
  );
}

export default Inicio;