import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import SidebarAcud from "../../components/SidebarAcud";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

function GenerarExcusa() {
  const { usuario } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [idEstudiante, setIdEstudiante] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fechaInasistencia, setFechaInasistencia] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    const cargarEstudiantes = async () => {
      if (!usuario?.id_usuario) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/acudientes_estudiantes/mis-estudiantes/${usuario.id_usuario}`
        );
        setEstudiantes(res.data);
        if (res.data.length > 0) {
          setIdEstudiante(res.data[0].id_estudiante);
        }
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
      }
    };

    cargarEstudiantes();
  }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: "", texto: "" });

    if (!idEstudiante || !motivo || !fechaInasistencia || !descripcion) {
      setMensaje({
        tipo: "danger",
        texto: "Por favor diligencie todos los campos requeridos.",
      });
      return;
    }

    try {
      setCargando(true);

      const res = await axios.post("http://localhost:5000/api/asistencias/excusa", {
        id_estudiante: idEstudiante,
        motivo,
        fecha_inasistencia: fechaInasistencia,
        descripcion,
      });

      setMensaje({
        tipo: "success",
        texto: res.data.mensaje || "Excusa radicada con éxito.",
      });

      setMotivo("");
      setFechaInasistencia("");
      setDescripcion("");
    } catch (err) {
      console.error("Error al radicar excusa:", err);
      setMensaje({
        tipo: "danger",
        texto: err.response?.data?.error || "Error al radicar la excusa.",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarAcud />

          <div className="col-md-9 col-lg-10 p-4">
            <h5 className="text-center fw-bold text-secondary mb-4">
              GENERAR EXCUSA
            </h5>

            <div className="row">
              <div className="col-12 col-md-6 col-lg-5">
                <div className="card border-0 shadow-sm p-4 bg-white rounded-3">
                  {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo} py-2 small mb-3`} role="alert">
                      {mensaje.texto}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-bold text-secondary small">
                        Estudiante asociado
                      </label>
                      {estudiantes.length > 1 ? (
                        <select
                          className="form-select bg-light"
                          value={idEstudiante}
                          onChange={(e) => setIdEstudiante(e.target.value)}
                        >
                          {estudiantes.map((est) => (
                            <option key={est.id_estudiante} value={est.id_estudiante}>
                              {est.primer_nombre} {est.primer_apellido}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={
                            estudiantes.length > 0
                              ? `${estudiantes[0].primer_nombre} ${estudiantes[0].primer_apellido}`
                              : "Cargando estudiante..."
                          }
                          disabled
                        />
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-secondary small">
                        Motivo / Tipo de novedad
                      </label>
                      <select
                        className="form-select"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        required
                      >
                        <option value="">-- Seleccione un motivo --</option>
                        <option value="Cita Médica">Cita Médica</option>
                        <option value="Incapacidad Médica">Incapacidad Médica</option>
                        <option value="Calamidad Doméstica">Calamidad Doméstica</option>
                        <option value="Trámite Personal / Familiar">Trámite Personal / Familiar</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-secondary small">
                        Fecha de la inasistencia
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={fechaInasistencia}
                        onChange={(e) => setFechaInasistencia(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-secondary small">
                        Descripción detallada
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Escriba el motivo aquí..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success w-100 fw-bold py-2 mt-2"
                      disabled={cargando}
                    >
                      {cargando ? "Radicando..." : "Radicar Excusa"}
                    </button>
                  </form>
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

export default GenerarExcusa;