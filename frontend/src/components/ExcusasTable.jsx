import { useEffect, useState } from "react";

import {
    obtenerExcusas,
    aprobarExcusa,
    rechazarExcusa
} from "../services/api";


function ExcusasTable() {

    const [datos, setDatos] =
        useState([]);

    const [cargando, setCargando] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
    ========================================================
    CARGAR EXCUSAS
    ========================================================
    */

    useEffect(() => {

        cargarDatos();

    }, []);


    async function cargarDatos() {

        try {

            setCargando(true);

            setError("");

            const respuesta =
                await obtenerExcusas();


            if (Array.isArray(respuesta)) {

                setDatos(respuesta);

            } else {

                setDatos([]);
            }


        } catch (error) {

            console.error(
                "Error al cargar excusas:",
                error
            );

            setError(
                "No fue posible cargar las excusas."
            );

            setDatos([]);

        } finally {

            setCargando(false);
        }
    }


    /*
    ========================================================
    APROBAR
    ========================================================
    */

    async function aprobar(id) {

        try {

            await aprobarExcusa(id);

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al aprobar excusa:",
                error
            );

            setError(
                "No fue posible aprobar la excusa."
            );
        }
    }


    /*
    ========================================================
    RECHAZAR
    ========================================================
    */

    async function rechazar(id) {

        try {

            await rechazarExcusa(id);

            await cargarDatos();

        } catch (error) {

            console.error(
                "Error al rechazar excusa:",
                error
            );

            setError(
                "No fue posible rechazar la excusa."
            );
        }
    }


    /*
    ========================================================
    CARGANDO
    ========================================================
    */

    if (cargando) {

        return (

            <div className="text-center py-4">

                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                </div>

                <p className="mt-2 text-muted">
                    Cargando excusas...
                </p>

            </div>
        );
    }


    /*
    ========================================================
    INTERFAZ
    ========================================================
    */

    return (

        <div className="card shadow">

            <div className="card-header bg-primary text-white">

                <h5 className="mb-0">

                    <i className="bi bi-folder-check me-2"></i>

                    Excusas Registradas

                </h5>

            </div>


            <div className="card-body">


                {error && (

                    <div
                        className="alert alert-danger"
                        role="alert"
                    >

                        <i className="bi bi-exclamation-triangle-fill me-2"></i>

                        {error}

                    </div>
                )}


                {datos.length === 0 ? (

                    <div
                        className="alert alert-info mb-0"
                    >

                        <i className="bi bi-info-circle-fill me-2"></i>

                        No hay excusas registradas.

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-light">

                                <tr>

                                    <th>
                                        Estudiante
                                    </th>

                                    <th>
                                        Fecha
                                    </th>

                                    <th>
                                        Motivo
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Acciones
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {datos.map((e) => (

                                    <tr key={e.id}>

                                        <td>
                                            {e.estudiante}
                                        </td>


                                        <td>
                                            {e.fecha}
                                        </td>


                                        <td>
                                            {e.motivo}
                                        </td>


                                        <td>

                                            {e.estado === "Pendiente" && (

                                                <span className="badge bg-warning text-dark">

                                                    Pendiente

                                                </span>
                                            )}


                                            {e.estado === "Aprobada" && (

                                                <span className="badge bg-success">

                                                    Aprobada

                                                </span>
                                            )}


                                            {e.estado === "Rechazada" && (

                                                <span className="badge bg-danger">

                                                    Rechazada

                                                </span>
                                            )}

                                        </td>


                                        <td>

                                            <button
                                                type="button"
                                                className="btn btn-success btn-sm me-2"
                                                disabled={
                                                    e.estado !== "Pendiente"
                                                }
                                                onClick={() =>
                                                    aprobar(e.id)
                                                }
                                            >

                                                <i className="bi bi-check-lg me-1"></i>

                                                Aprobar

                                            </button>


                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                disabled={
                                                    e.estado !== "Pendiente"
                                                }
                                                onClick={() =>
                                                    rechazar(e.id)
                                                }
                                            >

                                                <i className="bi bi-x-lg me-1"></i>

                                                Rechazar

                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}


export default ExcusasTable;