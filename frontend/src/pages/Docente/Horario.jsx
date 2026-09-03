import Header from "../../components/Header";
import SidebarDocen from "../../components/SidebarDocen";
import Footer from "../../components/Footer";

const horario = [
  {
    hora: "07:00 - 08:30",
    lunes:     { materia: "Matemáticas",  docente: "Dr. Roberto Nazario" },
    martes:    { materia: "Inglés",        docente: "Lic. Ana Maria"      },
    miercoles: { materia: "Matemáticas",  docente: "Dr. Roberto Nazario" },
    jueves:    { materia: "Sistemas",      docente: "Ing. Admin"          },
    viernes:   { materia: "Matemáticas",  docente: "Dr. Roberto Nazario" },
  },
  {
    hora: "08:30 - 10:00",
    lunes:     { materia: "Programación", docente: "Ing. Jose Lopez"     },
    martes:    null,
    miercoles: { materia: "Programación", docente: "Ing. Jose Lopez"     },
    jueves:    { materia: "Matemáticas",  docente: "Dr. Roberto Nazario" },
    viernes:   null,
  },
  {
    hora: "10:30 - 12:00",
    lunes:     { materia: "Sociología",   docente: "Dra. Marta Diaz"     },
    martes:    { materia: "Sociología",   docente: "Dra. Marta Diaz"     },
    miercoles: { materia: "Inglés",        docente: "Lic. Ana Maria"      },
    jueves:    { materia: "Programación", docente: "Ing. Jose Lopez"     },
    viernes:   { materia: "Sociología",   docente: "Dra. Marta Diaz"     },
  },
];

function Horario() {
  const consulta = JSON.parse(localStorage.getItem("horarioConsulta")) || { curso: "10-01", anio: "2026" };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light w-100">
      <Header />

      <div className="container-fluid flex-grow-1 px-0">
        <div className="row g-0 min-vh-100">
          <SidebarDocen />

          <div className="col-md-9 col-lg-10 p-4">
            <h2 className="fw-bold text-dark mb-4">Horario Semanal</h2>

            <div className="card shadow border-0">

              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h5 className="text-primary mb-0">Curso: {consulta.curso} — {consulta.anio}</h5>
                <a href="/consultar-horario" className="btn btn-outline-primary btn-sm">
                  Nueva Consulta
                </a>
              </div>

              <div className="card-body p-3">
                <div className="table-responsive">
                  <table className="table table-bordered text-center align-middle">
                    <thead className="table-primary">
                      <tr>
                        <th style={{ width: "10%" }}>Hora</th>
                        <th>Lunes</th>
                        <th>Martes</th>
                        <th>Miércoles</th>
                        <th>Jueves</th>
                        <th>Viernes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {horario.map((fila, i) => (
                        <>
                          {i === 2 && (
                            <tr key="receso" className="table-secondary">
                              <td colSpan="6" className="py-1 small fw-bold text-uppercase">
                                Receso Estudiantil
                              </td>
                            </tr>
                          )}
                          <tr key={i}>
                            <td className="fw-bold bg-light">{fila.hora}</td>
                            {["lunes", "martes", "miercoles", "jueves", "viernes"].map((dia) => (
                              <td key={dia} style={{ height: "80px" }}>
                                {fila[dia] ? (
                                  <div className="border-start border-success border-4 bg-light p-1 rounded text-start">
                                    <strong>{fila[dia].materia}</strong><br />
                                    <small>{fila[dia].docente}</small>
                                  </div>
                                ) : (
                                  <span className="text-muted fst-italic small">Espacio Libre</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-end">
                <button
                  className="btn btn-danger"
                  onClick={() => { if (window.confirm("¿Eliminar este horario?")) alert("Horario eliminado (simulado)"); }}
                >
                  Eliminar Horario
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Horario;
