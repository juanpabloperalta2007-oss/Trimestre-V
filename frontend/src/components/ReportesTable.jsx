import React, {
    useEffect,
    useState
} from "react";

import {
    obtenerReportes
} from "../services/api";


function ReportesTable() {

    const [
        reportes,
        setReportes
    ] = useState([]);

    const [
        cargando,
        setCargando
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");


    // ======================================================
    // CARGAR REPORTES
    // ======================================================

    useEffect(() => {

        cargarDatos();

    }, []);


    const cargarDatos = async () => {

        try {

            setCargando(true);

            setError("");


            const datos =
                await obtenerReportes();


            console.log(
                "REPORTES:",
                datos
            );


            if (!Array.isArray(datos)) {

                throw new Error(
                    "El servidor no devolvió una lista de reportes."
                );

            }


            setReportes(datos);


        } catch (error) {

            console.error(
                "ERROR REPORTES:",
                error
            );


            setError(

                error.response?.data?.error ||

                error.message ||

                "No fue posible cargar los reportes."

            );


        } finally {

            setCargando(false);

        }

    };


    // ======================================================
    // CARGANDO
    // ======================================================

    if (cargando) {

        return (

            <div className="card shadow-sm">

                <div className="card-body text-center p-5">

                    <div className="spinner-border text-primary">
                    </div>


                    <p className="mt-3">
                        Cargando reportes...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // ERROR
    // ======================================================

    if (error) {

        return (

            <div className="card shadow-sm">

                <div className="card-header bg-primary text-white">

                    <h5 className="mb-0">

                        <i className="bi bi-file-earmark-text me-2"></i>

                        Reporte mensual

                    </h5>

                </div>


                <div className="card-body">

                    <div className="alert alert-danger">

                        {error}

                    </div>


                    <button
                        className="btn btn-success w-100"
                        onClick={cargarDatos}
                    >

                        <i className="bi bi-arrow-clockwise me-2"></i>

                        Intentar nuevamente

                    </button>

                </div>

            </div>

        );

    }


    // ======================================================
    // VISTA PRINCIPAL
    // ======================================================

    return (

        <div className="card shadow">

            <div className="card-header bg-primary text-white">

                <h5 className="mb-0">

                    <i className="bi bi-file-earmark-text me-2"></i>

                    Reporte mensual

                </h5>

            </div>


            <div className="card-body">

                {reportes.length === 0 ? (

                    <div className="text-center py-5">

                        <i className="bi bi-file-earmark-text text-primary fs-1">
                        </i>


                        <h5 className="mt-3">
                            No hay reportes
                        </h5>


                        <p className="text-muted">

                            No existen reportes registrados.

                        </p>

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-hover">

                            <thead className="table-light">

                                <tr>

                                    <th>Curso</th>

                                    <th>Mes</th>

                                    <th>Asistencia</th>

                                    <th>Presentes</th>

                                    <th>Ausentes</th>

                                </tr>

                            </thead>


                            <tbody>

                                {reportes.map(
                                    (reporte, index) => (

                                        <tr
                                            key={
                                                index
                                            }
                                        >

                                            <td>

                                                {
                                                    reporte.curso ||
                                                    "Sin curso"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    reporte.mes ||
                                                    "Sin mes"
                                                }

                                            </td>


                                            <td>

                                                {
                                                    reporte.porcentaje ||
                                                    0
                                                }%

                                            </td>


                                            <td>

                                                {
                                                    reporte.presentes ||
                                                    0
                                                }

                                            </td>


                                            <td>

                                                {
                                                    reporte.ausentes ||
                                                    0
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

}


export default ReportesTable;