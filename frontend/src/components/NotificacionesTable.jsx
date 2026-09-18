import React, { useEffect, useState } from "react";
import {
    obtenerNotificaciones,
    eliminarNotificacion
} from "../services/api";

function NotificacionesTable() {

    const [notificaciones, setNotificaciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarNotificaciones = async () => {

        try {

            setCargando(true);
            setError("");

            const respuesta = await obtenerNotificaciones();

            console.log("RESPUESTA NOTIFICACIONES:", respuesta);

            let datos = [];

            // Caso 1: el backend devuelve directamente un arreglo
            if (Array.isArray(respuesta)) {

                datos = respuesta;

            }

            // Caso 2: el backend devuelve { correos: [...] }
            else if (
                respuesta &&
                Array.isArray(respuesta.correos)
            ) {

                datos = respuesta.correos;

            }

            // Caso 3: el backend devuelve { notificaciones: [...] }
            else if (
                respuesta &&
                Array.isArray(respuesta.notificaciones)
            ) {

                datos = respuesta.notificaciones;

            }

            // Caso 4: el backend devuelve { data: [...] }
            else if (
                respuesta &&
                Array.isArray(respuesta.data)
            ) {

                datos = respuesta.data;

            }

            else {

                console.error(
                    "Formato de respuesta no reconocido:",
                    respuesta
                );

                throw new Error(
                    "El servidor no devolvió una lista de notificaciones."
                );
            }

            console.log("NOTIFICACIONES RECIBIDAS:", datos);

            setNotificaciones(datos);

        } catch (error) {

            console.error(
                "ERROR NOTIFICACIONES:",
                error
            );

            setError(
                "No fue posible cargar las notificaciones."
            );

            setNotificaciones([]);

        } finally {

            setCargando(false);

        }
    };


    useEffect(() => {

        cargarNotificaciones();

    }, []);


    const obtenerId = (notificacion) => {

        return (
            notificacion.id_correo ||
            notificacion.id_notificacion ||
            notificacion.id ||
            null
        );
    };


    const eliminar = async (id) => {

        if (!id) {
            alert("No se encontró el identificador de la notificación.");
            return;
        }

        const confirmar = window.confirm(
            "¿Deseas eliminar esta notificación?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await eliminarNotificacion(id);

            setNotificaciones(
                notificaciones.filter(
                    (notificacion) =>
                        obtenerId(notificacion) !== id
                )
            );

        } catch (error) {

            console.error(
                "ERROR AL ELIMINAR:",
                error
            );

            alert(
                "No fue posible eliminar la notificación."
            );
        }
    };


    const formatearFecha = (fecha) => {

        if (!fecha) {
            return "Sin fecha";
        }

        const fechaObj = new Date(fecha);

        if (isNaN(fechaObj.getTime())) {
            return fecha;
        }

        return fechaObj.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    };


    if (cargando) {

        return (
            <div className="card border-0 shadow-sm">

                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        Notificaciones
                    </h5>
                </div>

                <div className="card-body text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Cargando...
                        </span>
                    </div>

                    <p className="mt-3 mb-0 text-muted">
                        Cargando notificaciones...
                    </p>

                </div>

            </div>
        );
    }


    if (error) {

        return (
            <div className="card border-0 shadow-sm">

                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        Notificaciones
                    </h5>
                </div>

                <div className="card-body">

                    <div className="alert alert-danger mb-0">
                        {error}
                    </div>

                    <button
                        className="btn btn-primary mt-3"
                        onClick={cargarNotificaciones}
                    >
                        Intentar nuevamente
                    </button>

                </div>

            </div>
        );
    }


    return (

        <div className="card border-0 shadow-sm">

            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">

                <h5 className="mb-0">
                    Notificaciones
                </h5>

                <span className="badge bg-light text-primary">
                    {notificaciones.length}
                </span>

            </div>


            <div className="card-body p-0">

                {notificaciones.length === 0 ? (

                    <div className="text-center py-5">

                        <h4 className="text-dark">
                            No hay notificaciones
                        </h4>

                        <p className="text-muted mb-0">
                            Actualmente no hay notificaciones registradas.
                        </p>

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">

                                <tr>

                                    <th>ID</th>

                                    <th>Asunto</th>

                                    <th>Mensaje</th>

                                    <th>Tipo</th>

                                    <th>Fecha</th>

                                    <th>Estado</th>

                                    <th>Acción</th>

                                </tr>

                            </thead>


                            <tbody>

                                {notificaciones.map(
                                    (notificacion) => {

                                        const id =
                                            obtenerId(
                                                notificacion
                                            );

                                        return (

                                            <tr key={id}>

                                                <td>
                                                    {id || "-"}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            notificacion.asunto ||
                                                            "Sin asunto"
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {notificacion.mensaje ||
                                                        "Sin mensaje"}
                                                </td>

                                                <td>

                                                    <span className="badge bg-info text-dark">

                                                        {
                                                            notificacion.tipo_notificacion ||
                                                            "General"
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    {
                                                        formatearFecha(
                                                            notificacion.fecha_envio
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            notificacion.estado_envio ===
                                                            "Enviado"
                                                                ? "badge bg-success"
                                                                : "badge bg-secondary"
                                                        }
                                                    >

                                                        {
                                                            notificacion.estado_envio ||
                                                            "Sin estado"
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            eliminar(id)
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            <div className="card-footer bg-white">

                <div className="d-flex justify-content-between align-items-center">

                    <small className="text-muted">

                        Total de notificaciones:
                        <strong className="ms-1">
                            {notificaciones.length}
                        </strong>

                    </small>


                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={cargarNotificaciones}
                    >
                        Actualizar
                    </button>

                </div>

            </div>

        </div>

    );
}

export default NotificacionesTable;