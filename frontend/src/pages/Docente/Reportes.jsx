import React, { useState } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import ReportesTable from "../../components/ReportesTable";

function Reportes() {
  // Fecha local en formato YYYY-MM-DD para iniciar en el día actual sin acumular otros días
  const hoyISO = new Date().toLocaleDateString("en-CA");
  const [fechaFiltro, setFechaFiltro] = useState(hoyISO);

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

            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
              <div>
                <h2 className="fw-bold text-dark m-0">
                  Reportes
                </h2>

                <p className="text-muted small mb-0">
                  Consulta y genera los reportes del sistema.
                </p>
              </div>

              {/* FILTRO POR DÍA */}
              <div className="d-flex flex-wrap align-items-end gap-2">
                <div>
                  <label
                    htmlFor="filtroFechaReporte"
                    className="form-label small fw-semibold text-dark mb-1"
                  >
                    Día
                  </label>
                  <input
                    id="filtroFechaReporte"
                    type="date"
                    className="form-control form-control-sm bg-white text-dark"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-sm fw-semibold"
                  style={{
                    backgroundColor: "#495057",
                    color: "#ffffff",
                    border: "1px solid #495057"
                  }}
                  onClick={() => setFechaFiltro(hoyISO)}
                >
                  Hoy
                </button>

                <button
                  type="button"
                  className="btn btn-sm fw-semibold"
                  style={{
                    backgroundColor: "#0d6efd",
                    color: "#ffffff",
                    border: "1px solid #0d6efd"
                  }}
                  onClick={() => setFechaFiltro("")}
                >
                  Ver todos
                </button>
              </div>
            </div>

            <ReportesTable
              fecha={fechaFiltro}
              onLimpiarFecha={() => setFechaFiltro("")}
            />

          </div>

        </div>
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default Reportes;