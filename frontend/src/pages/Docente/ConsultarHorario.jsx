import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";
import { obtenerCursos } from "../../services/api";

function ConsultarHorario() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [anio, setAnio] = useState("2026");
  const [horaInicio, setHoraInicio] = useState("07:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCursosReales();
  }, []);

  const cargarCursosReales = async () => {
    try {
      setCargando(true);
      const data = await obtenerCursos();
      let listaCursos = [];
      
      if (Array.isArray(data)) {
        listaCursos = data;
      } else if (data && Array.isArray(data.cursos)) {
        listaCursos = data.cursos;
      }
      
      setCursos(listaCursos);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
      setCursos([]);
    } finally {
      setCargando(false);
    }
  };

  const consultar = (e) => {
    e.preventDefault();
    if (!cursoSeleccionado) {
      alert("Por favor, seleccione un curso");
      return;
    }
    
    // Buscamos el objeto curso seleccionado para guardar también su nombre legible
    const cursoObj = cursos.find(c => String(c.id_curso) === String(cursoSeleccionado));
    const nombreCurso = cursoObj ? (cursoObj.nombre_curso || cursoObj.nombre) : cursoSeleccionado;

    localStorage.setItem("horarioConsulta", JSON.stringify({ 
      id_curso: cursoSeleccionado, 
      nombre_curso: nombreCurso, 
      anio, 
      horaInicio, 
      horaFin 
    }));
    
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
                    <h4 className="mb-0">Consultar Horario por Curso</h4>
                  </div>
                  <div className="card-body p-4">
                    <form onSubmit={consultar}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Curso</label>
                        <select
                          className="form-select"
                          value={cursoSeleccionado}
                          onChange={(e) => setCursoSeleccionado(e.target.value)}
                          required
                          disabled={cargando}
                        >
                          <option value="" disabled>
                            {cargando ? "Cargando cursos..." : "Seleccione curso"}
                          </option>
                          {cursos.map((c) => {
                            const idCurso = c.id_curso;
                            const nombreCurso = c.nombre_curso || c.nombre || `Curso ${idCurso}`;
                            return (
                              <option key={idCurso} value={idCurso}>
                                {nombreCurso}
                              </option>
                            );
                          })}
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
                        <button type="submit" className="btn btn-primary btn-lg text-center">
                          Ver Horario
                        </button>
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