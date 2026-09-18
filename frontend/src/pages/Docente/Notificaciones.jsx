import React from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import NotificacionesTable from "../../components/NotificacionesTable";

function Notificaciones() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">

      {/* HEADER */}
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">

          {/* SIDEBAR */}
          <SidebarDocen />

          {/* CONTENIDO */}
          <div className="col-md-9 col-lg-10 p-4">

            <div className="mb-4">
              <h2 className="fw-bold text-dark m-0">
                Notificaciones
              </h2>

              <p className="text-muted small mb-0">
                Consulta tus notificaciones y mensajes recibidos.
              </p>
            </div>

            <NotificacionesTable />

          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default Notificaciones;