import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import SidebarDocen from '../../components/SidebarDocen';
import BuzonCard from '../../components/BuzonCard';
import Footer from '../../components/Footer';

function Inicio() {
  const navigate = useNavigate();

  function obtenerFechaCompleta() {
    const hoy = new Date();
    return hoy.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      {/* 1. Barra superior */}
      <Header />

      {/* 2. Contenido principal con menú lateral */}
      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />

          <div className="col-md-9 col-lg-10 p-4">
            {/* Encabezado y acciones rápidas */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
              <div>
                <h2 className="fw-bold text-dark m-0">Inicio</h2>
                <p className="text-muted small mb-0 text-capitalize">
                  <i className="bi bi-calendar3 me-1"></i>
                  <strong>Hoy:</strong> {obtenerFechaCompleta()}
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#0d6efd',
                    color: '#ffffff',
                    border: '1px solid #0d6efd',
                    fontWeight: 600,
                    opacity: 1,
                    visibility: 'visible'
                  }}
                  onClick={() => navigate('/llamar-lista')}
                >
                  <i className="bi bi-clipboard-check"></i>
                  <span>Llamar lista</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0d6efd',
                    border: '1px solid #0d6efd',
                    fontWeight: 600,
                    opacity: 1,
                    visibility: 'visible'
                  }}
                  onClick={() => navigate('/consultar-horario')}
                >
                  <i className="bi bi-journal-bookmark"></i>
                  <span>Agenda / Horario</span>
                </button>
              </div>
            </div>

            {/* 3. Buzón y resumen del docente */}
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