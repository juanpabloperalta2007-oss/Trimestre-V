import Header from "../../components/Header";
import SidebarCoord from "../../components/SidebarCoord";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

function InicioCoordinador() {

    return (

        <div className="d-flex flex-column min-vh-100 bg-light">

            <Header />

            <div className="container-fluid flex-grow-1">

                <div className="row">

                    <SidebarCoord />

                    <div className="col-md-9 col-lg-10 p-4">

                        <h2 className="fw-bold mb-3">

                            Panel del Coordinador

                        </h2>

                        <p className="text-muted">

                            Bienvenido al sistema de gestión académica.

                        </p>

                        <div className="row mt-4">

                            <div className="col-md-6 col-lg-3 mb-4">

                                <div className="card shadow h-100">

                                    <div className="card-body text-center">

                                        <i className="bi bi-journal-bookmark-fill display-5 text-primary"></i>

                                        <h5 className="mt-3">

                                            Cursos

                                        </h5>

                                        <Link
                                            to="/cursos"
                                            className="btn btn-primary mt-3"
                                        >
                                            Administrar
                                        </Link>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6 col-lg-3 mb-4">

                                <div className="card shadow h-100">

                                    <div className="card-body text-center">

                                        <i className="bi bi-exclamation-triangle-fill display-5 text-warning"></i>

                                        <h5 className="mt-3">

                                            Alertas

                                        </h5>

                                        <Link
                                            to="/alertas"
                                            className="btn btn-warning mt-3"
                                        >
                                            Consultar
                                        </Link>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6 col-lg-3 mb-4">

                                <div className="card shadow h-100">

                                    <div className="card-body text-center">

                                        <i className="bi bi-file-earmark-text-fill display-5 text-success"></i>

                                        <h5 className="mt-3">

                                            Excusas

                                        </h5>

                                        <Link
                                            to="/gestion-excusas"
                                            className="btn btn-success mt-3"
                                        >
                                            Gestionar
                                        </Link>

                                    </div>

                                </div>

                            </div>

                            <div className="col-md-6 col-lg-3 mb-4">

                                <div className="card shadow h-100">

                                    <div className="card-body text-center">

                                        <i className="bi bi-bar-chart-fill display-5 text-info"></i>

                                        <h5 className="mt-3">

                                            Reportes

                                        </h5>

                                        <Link
                                            to="/reportes"
                                            className="btn btn-info mt-3"
                                        >
                                            Ver
                                        </Link>

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

export default InicioCoordinador;