import { useState } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";

function ConsultarHorario() {
  const [curso, setCurso] = useState("");
  const [anio, setAnio] = useState("2026");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("12:00");

  const consultar = (e) => {
    e.preventDefault();
    if (!curso) {
      alert("Por favor, seleccione un curso");
      return;
    }
    localStorage.setItem("horarioConsulta", JSON.stringify({ curso, anio, horaInicio, horaFin }));
    window.location.href = "/horario";
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />

          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Consultar Horario</h2>

            <div className="row justify-content-center">
              <div className="col-12 col-md-6">
                <div className="card shadow border-0">

                  <div className="card-header bg-primary text-white text-center py-3">
                    <h4 className="mb-0">Consultar Horario</h4>
                  </div>

                  <div className="card-body p-4">
                    <form onSubmit={consultar}>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Curso</label>
                        <select
                          className="form-select"
                          value={curso}
                          onChange={(e) => setCurso(e.target.value)}
                          required
                        >
                          <option value="" disabled>Seleccione curso</option>
                          <option value="10-01">10-01</option>
                          <option value="11-01">11-01</option>
                        </select>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-4">
                          <label className="form-label fw-bold">Año</label>
                          <input
                            type="number"
                            className="form-control"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-bold">Inicio</label>
                          <input
                            type="time"
                            className="form-control"
                            value={horaInicio}
                            onChange={(e) => setHoraInicio(e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-bold">Fin</label>
                          <input
                            type="time"
                            className="form-control"
                            value={horaFin}
                            onChange={(e) => setHoraFin(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="d-grid">
                        <a href="/Horario" className="btn btn-primary btn-lg text-center text-decoration-none">
                        Ver Horario
                        </a>
                      </div>

                    </form>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ConsultarHorario;