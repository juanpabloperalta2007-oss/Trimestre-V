import React, { useEffect, useState } from "react";
import { obtenerReportes } from "../services/api";

function ReportesTable() {

    const [reportes, setReportes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {

        try {

            setCargando(true);
            setError("");

            const respuesta = await obtenerReportes();

            console.log("REPORTES:", respuesta);

            /*
            ==================================================
            NORMALIZAR RESPUESTA DEL BACKEND
            ==================================================
            */

            let datos = [];

            // Si el backend devuelve directamente un array
            if (Array.isArray(respuesta)) {

                datos = respuesta;

            }

            // Si el backend devuelve:
            // { reportes: [...], total: 8 }
            else if (
                respuesta &&
                Array.isArray(respuesta.reportes)
            ) {

                datos = respuesta.reportes;

            }

            // Por si otro endpoint devuelve:
            // { data: [...] }
            else if (
                respuesta &&
                Array.isArray(respuesta.data)
            ) {

                datos = respuesta.data;

            }

            else {

                throw new Error(
                    "El servidor no devolvió una lista de reportes."
                );

            }

            console.log(
                "REPORTES PROCESADOS:",
                datos
            );

            setReportes(datos);

        } catch (error) {

            console.error(
                "ERROR REPORTES:",
                error
            );

            setError(
                "No fue posible cargar los reportes."
            );

            setReportes([]);

        } finally {

            setCargando(false);

        }

    };


    /*
    ==================================================
    FORMATEAR FECHA
    ==================================================
    */

    const formatearFecha = (fecha) => {

        if (!fecha) {
            return "Sin fecha";
        }

        const fechaConvertida = new Date(fecha);

        if (
            Number.isNaN(
                fechaConvertida.getTime()
            )
        ) {

            return String(fecha);

        }

        return fechaConvertida.toLocaleDateString(
            "es-CO",
            {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }
        );

    };


    /*
    ==================================================
    OBTENER NOMBRE DEL ESTUDIANTE
    ==================================================
    */

    const obtenerNombre = (reporte) => {

        if (
            reporte.nombre_estudiante
        ) {

            return reporte.nombre_estudiante;

        }

        const nombre = [
            reporte.primer_nombre,
            reporte.segundo_nombre,
            reporte.primer_apellido,
            reporte.segundo_apellido
        ]
            .filter(Boolean)
            .join(" ");

        return nombre || "Sin nombre";

    };


    /*
    ==================================================
    CLASE DEL ESTADO
    ==================================================
    */

    const obtenerClaseEstado = (estado) => {

        const valor = String(
            estado || ""
        ).toLowerCase();

        if (
            valor.includes("asistencia") ||
            valor === "presente"
        ) {

            return "bg-success";

        }

        if (
            valor.includes("justificada")
        ) {

            return "bg-info";

        }

        if (
            valor.includes("retardo") ||
            valor.includes("tarde")
        ) {

            return "bg-warning text-dark";

        }

        if (
            valor.includes("falla") ||
            valor.includes("inasistencia") ||
            valor.includes("sin justificar")
        ) {

            return "bg-danger";

        }

        return "bg-secondary";

    };


    /*
    ==================================================
    CARGANDO
    ==================================================
    */

    if (cargando) {

        return (

            <div className="card border-0 shadow-sm">

                <div className="card-body text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    />

                    <p className="text-muted mt-3 mb-0">
                        Cargando reportes...
                    </p>

                </div>

            </div>

        );

    }


    /*
    ==================================================
    VISTA
    ==================================================
    */

    return (

        <div className="card border-0 shadow-sm">

            <div className="card-body">


                {/* ENCABEZADO */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <h5 className="fw-bold mb-1">
                            Reportes de asistencia
                        </h5>

                        <p className="text-muted mb-0 small">
                            Consulta de registros de asistencia
                            de los estudiantes
                        </p>

                    </div>


                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={cargarDatos}
                    >
                        Actualizar
                    </button>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="alert alert-danger">

                        {error}

                    </div>

                )}


                {/* RESUMEN */}

                {!error && (

                    <div className="row mb-4">

                        <div className="col-md-4">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Total de registros
                                </small>

                                <h3 className="fw-bold mb-0">
                                    {reportes.length}
                                </h3>

                            </div>

                        </div>

                        <div className="col-md-4">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Asistencias
                                </small>

                                <h3 className="fw-bold text-success mb-0">

                                    {
                                        reportes.filter(
                                            (reporte) => {

                                                const estado =
                                                    String(
                                                        reporte.estado || ""
                                                    ).toLowerCase();

                                                return (
                                                    estado.includes(
                                                        "asistencia"
                                                    ) ||
                                                    estado ===
                                                        "presente"
                                                );

                                            }
                                        ).length
                                    }

                                </h3>

                            </div>

                        </div>


                        <div className="col-md-4">

                            <div className="border rounded p-3">

                                <small className="text-muted">
                                    Inasistencias
                                </small>

                                <h3 className="fw-bold text-danger mb-0">

                                    {
                                        reportes.filter(
                                            (reporte) => {

                                                const estado =
                                                    String(
                                                        reporte.estado || ""
                                                    ).toLowerCase();

                                                return (
                                                    estado.includes(
                                                        "falla"
                                                    ) ||
                                                    estado.includes(
                                                        "inasistencia"
                                                    ) ||
                                                    estado.includes(
                                                        "sin justificar"
                                                    )
                                                );

                                            }
                                        ).length
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>

                )}


                {/* SIN REGISTROS */}

                {!error &&
                    reportes.length === 0 && (

                        <div className="alert alert-info">

                            No existen registros de asistencia
                            para mostrar.

                        </div>

                    )}


                {/* TABLA */}

                {!error &&
                    reportes.length > 0 && (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle">

                                <thead className="table-light">

                                    <tr>

                                        <th>
                                            Documento
                                        </th>

                                        <th>
                                            Estudiante
                                        </th>

                                        <th>
                                            Fecha
                                        </th>

                                        <th>
                                            Estado
                                        </th>

                                        <th>
                                            Observaciones
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {reportes.map(
                                        (reporte, index) => (

                                            <tr
                                                key={
                                                    reporte.id_asistencia ||
                                                    index
                                                }
                                            >

                                                <td>

                                                    {
                                                        reporte.numero_documento ||
                                                        "Sin documento"
                                                    }

                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            obtenerNombre(
                                                                reporte
                                                            )
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        formatearFecha(
                                                            reporte.fecha
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `badge ${obtenerClaseEstado(
                                                                reporte.estado
                                                            )}`
                                                        }
                                                    >

                                                        {
                                                            reporte.estado ||
                                                            "Sin estado"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        reporte.observaciones ||
                                                        "Sin observaciones"
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                {/* PIE */}

                {!error &&
                    reportes.length > 0 && (

                        <div className="d-flex justify-content-between align-items-center mt-3">

                            <small className="text-muted">

                                Mostrando{" "}
                                <strong>
                                    {reportes.length}
                                </strong>{" "}
                                registros

                            </small>

                        </div>

                    )}

            </div>

        </div>

    );

}

export default ReportesTable;