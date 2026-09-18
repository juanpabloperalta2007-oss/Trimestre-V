import React from "react";

function AlertasTable({
    alertas = [],
    recargar,
    cargando = false
}) {


    /*
    ========================================================
    SI ESTÁ CARGANDO
    ========================================================
    */

    if (cargando) {

        return (

            <div className="card shadow-sm">

                <div
                    className="card-header text-white"
                    style={{
                        backgroundColor: "#0d6efd"
                    }}
                >

                    <h5 className="mb-0">

                        Alertas de Inasistencia

                    </h5>

                </div>

                <div className="card-body text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                    </div>

                    <p className="mt-3 mb-0 text-muted">

                        Cargando alertas...

                    </p>

                </div>

            </div>

        );

    }


    /*
    ========================================================
    SI NO HAY ALERTAS
    ========================================================
    */

    if (!alertas || alertas.length === 0) {

        return (

            <div className="card shadow-sm">

                <div
                    className="card-header text-white"
                    style={{
                        backgroundColor: "#0d6efd"
                    }}
                >

                    <h5 className="mb-0">

                        Alertas de Inasistencia

                    </h5>

                </div>


                <div className="card-body text-center py-5">

                    <i
                        className="bi bi-check-circle-fill text-success"
                        style={{
                            fontSize: "45px"
                        }}
                    ></i>


                    <h5 className="mt-3 mb-2">

                        No hay alertas

                    </h5>


                    <p className="text-muted mb-0">

                        Actualmente no hay estudiantes
                        que superen el límite de inasistencias.

                    </p>

                </div>

            </div>

        );

    }


    /*
    ========================================================
    FUNCIÓN PARA EL ESTADO
    ========================================================
    */

    const obtenerClaseEstado = (estado) => {

        const valor =
            String(estado)
                .toLowerCase()
                .trim();


        if (
            valor === "pérdida" ||
            valor === "perdida"
        ) {

            return "badge bg-danger";

        }


        if (
            valor === "exceso"
        ) {

            return "badge bg-warning text-dark";

        }


        return "badge bg-secondary";

    };


    /*
    ========================================================
    VISTA
    ========================================================
    */

    return (

        <div className="card shadow-sm">

            {/* ============================================
                ENCABEZADO
            ============================================ */}

            <div
                className="card-header text-white"
                style={{
                    backgroundColor: "#0d6efd"
                }}
            >

                <div className="d-flex justify-content-between align-items-center">

                    <h5 className="mb-0">

                        Alertas de Inasistencia

                    </h5>


                    {recargar && (

                        <button
                            type="button"
                            className="btn btn-light btn-sm"
                            onClick={recargar}
                        >

                            <i className="bi bi-arrow-clockwise me-1"></i>

                            Actualizar

                        </button>

                    )}

                </div>

            </div>


            {/* ============================================
                TABLA
            ============================================ */}

            <div className="table-responsive">

                <table className="table table-hover table-bordered mb-0">

                    <thead className="table-light">

                        <tr>

                            <th>
                                Estudiante
                            </th>

                            <th>
                                Documento
                            </th>

                            <th>
                                Curso
                            </th>

                            <th className="text-center">
                                Inasistencias
                            </th>

                            <th className="text-center">
                                Tardanzas
                            </th>

                            <th className="text-center">
                                Total registros
                            </th>

                            <th className="text-center">
                                Estado
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {alertas.map(
                            (alerta) => {

                                return (

                                    <tr
                                        key={
                                            alerta.id_estudiante
                                        }
                                    >

                                        {/* ESTUDIANTE */}

                                        <td>

                                            <strong>

                                                {alerta.estudiante}

                                            </strong>

                                        </td>


                                        {/* DOCUMENTO */}

                                        <td>

                                            {alerta.documento}

                                        </td>


                                        {/* CURSO */}

                                        <td>

                                            {alerta.curso}

                                        </td>


                                        {/* INASISTENCIAS */}

                                        <td className="text-center">

                                            <span
                                                className={
                                                    alerta.inasistencias >= 10
                                                        ? "fw-bold text-danger"
                                                        : "fw-bold text-warning"
                                                }
                                            >

                                                {
                                                    alerta.inasistencias
                                                }

                                            </span>

                                        </td>


                                        {/* TARDANZAS */}

                                        <td className="text-center">

                                            {
                                                alerta.tardanzas
                                            }

                                        </td>


                                        {/* TOTAL */}

                                        <td className="text-center">

                                            {
                                                alerta.total_registros
                                            }

                                        </td>


                                        {/* ESTADO */}

                                        <td className="text-center">

                                            <span
                                                className={
                                                    obtenerClaseEstado(
                                                        alerta.estado
                                                    )
                                                }
                                            >

                                                {
                                                    alerta.estado
                                                }

                                            </span>

                                        </td>

                                    </tr>

                                );

                            }
                        )}

                    </tbody>

                </table>

            </div>


            {/* ============================================
                PIE
            ============================================ */}

            <div className="card-footer text-muted">

                Total de estudiantes con alerta:{" "}

                <strong>

                    {alertas.length}

                </strong>

            </div>

        </div>

    );

}

export default AlertasTable;