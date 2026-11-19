import Header from "../../components/Header";
import SidebarCoord from "../../components/SidebarCoord";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

const estiloBotonIgual = {
    boxSizing: "border-box",
    width: "150px",
    minWidth: "150px",
    maxWidth: "150px",
    height: "38px",
    padding: 0,
    lineHeight: "38px",
    textAlign: "center"
};

function InicioCoordinador() {
    const tarjetas = [
        {
            titulo: "Cursos",
            textoBoton: "Administrar",
            to: "/cursos",
            claseBtn: "btn-success",
            claseIcono: "bi-journal-bookmark-fill text-primary"
        },
        {
            titulo: "Materias",
            textoBoton: "Asignar",
            to: "/asignaturas-coordinador",
            claseBtn: "btn-secondary",
            claseIcono: "bi-book-fill text-secondary"
        },
        {
            titulo: "Excusas",
            textoBoton: "Gestionar",
            to: "/gestion-excusas-coordinador",
            claseBtn: "btn-success",
            claseIcono: "bi-file-earmark-text-fill text-success"
        },
        {
            titulo: "Alertas",
            textoBoton: "Consultar",
            to: "/alertas",
            claseBtn: "btn-warning text-white",
            claseIcono: "bi-exclamation-triangle-fill text-warning"
        }
    ];

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Header />

            <div className="container-fluid flex-grow-1">
                <div className="row">
                    <SidebarCoord />

                    <div className="col-md-9 col-lg-10 p-4">
                        <h2 className="fw-bold mb-3">Panel del Coordinador</h2>
                        <p className="text-muted">Bienvenido al sistema de gestión académica.</p>

                        <div className="row mt-4">
                            {tarjetas.map((item) => (
                                <div key={item.titulo} className="col-md-6 col-lg-3 mb-4">
                                    <div className="card shadow h-100">
                                        <div className="card-body text-center d-flex flex-column justify-content-between align-items-center py-4">
                                            <div>
                                                <i className={`bi ${item.claseIcono} display-5`}></i>
                                                <h5 className="mt-3 mb-0">{item.titulo}</h5>
                                            </div>

                                            <Link
                                                to={item.to}
                                                className={`btn ${item.claseBtn} fw-semibold mt-4`}
                                                style={estiloBotonIgual}
                                            >
                                                {item.textoBoton}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default InicioCoordinador;