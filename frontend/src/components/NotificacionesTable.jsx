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
            let datos = [];

            if (Array.isArray(respuesta)) {
                datos = respuesta;
            } else if (respuesta && Array.isArray(respuesta.correos)) {
                datos = respuesta.correos;
            } else if (respuesta && Array.isArray(respuesta.notificaciones)) {
                datos = respuesta.notificaciones;
            } else if (respuesta && Array.isArray(respuesta.data)) {
                datos = respuesta.data;
            } else {
                throw new Error("El servidor no devolvió una lista de notificaciones.");
            }

            setNotificaciones(datos);
        } catch (err) {
            console.error("ERROR NOTIFICACIONES:", err);
            setError("No fue posible cargar las notificaciones.");
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

    const obtenerEstudianteTexto = (n) => {
        const nombre =
            n.nombre_estudiante ||
            n.estudiante ||
            "";

        if (nombre && String(nombre).trim() !== "") {
            return String(nombre).trim();
        }

        if (n.id_estudiante) {
            return `Estudiante #${n.id_estudiante}`;
        }

        return "No especificado";
    };

    const obtenerAsuntoTexto = (n) => {
        return (
            n.asunto ||
            n.titulo ||
            n.tipo_notificacion ||
            n.tipo ||
            "Aviso de asistencia y excusas"
        );
    };

    const obtenerMensajeTexto = (n) => {
        const base =
            n.mensaje ||
            n.descripcion ||
            n.contenido ||
            n.observaciones ||
            "";

        if (base && String(base).trim() !== "") {
            return String(base).trim();
        }

        return "Revisa el registro de asistencia del estudiante correspondiente para verificar o justificar la novedad.";
    };

    const obtenerIndicacionDocente = (n) => {
        const estudiante = obtenerEstudianteTexto(n);
        const texto = `${obtenerAsuntoTexto(n)} ${obtenerMensajeTexto(n)}`.toLowerCase();

        if (texto.includes("aprobada") || texto.includes("justificada")) {
            return `Excusa aprobada para ${estudiante}: la asistencia de la fecha indicada ya figura como justificada en el sistema.`;
        }

        if (texto.includes("excusa") || texto.includes("inasistencia") || texto.includes("falla")) {
            return `Acción docente (${estudiante}): verifica la asistencia en esa fecha y justifica o actualiza el registro si corresponde.`;
        }

        return null;
    };

    const obtenerTipoTexto = (n) => {
        return n.tipo_notificacion || n.tipo || "General";
    };

    const obtenerFechaValor = (n) => {
        return n.fecha_envio || n.fecha || n.created_at || n.createdAt || null;
    };

    const obtenerEstadoTexto = (n) => {
        return n.estado_envio || n.estado || "Enviado";
    };

    const eliminar = async (id) => {
        if (!id) {
            alert("No se encontró el identificador de la notificación.");
            return;
        }

        const confirmar = window.confirm("¿Deseas eliminar esta notificación?");
        if (!confirmar) return;

        try {
            await eliminarNotificacion(id);
            setNotificaciones(
                notificaciones.filter((notificacion) => obtenerId(notificacion) !== id)
            );
        } catch (err) {
            console.error("ERROR AL ELIMINAR:", err);
            alert("No fue posible eliminar la notificación.");
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) return fecha;
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
                    <h5 className="mb-0">Notificaciones</h5>
                </div>
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 mb-0 text-muted">Cargando notificaciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Notificaciones</h5>
                </div>
                <div className="card-body">
                    <div className="alert alert-danger mb-0">{error}</div>
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
                <h5 className="mb-0">Notificaciones</h5>
                <span className="badge bg-light text-primary">
                    {notificaciones.length}
                </span>
            </div>

            <div className="card-body p-0">
                {notificaciones.length === 0 ? (
                    <div className="text-center py-5">
                        <h4 className="text-dark">No hay notificaciones</h4>
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
                                    <th>Estudiante</th>
                                    <th>Asunto</th>
                                    <th>Mensaje</th>
                                    <th>Tipo</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>

                            <tbody>
                                {notificaciones.map((notificacion) => {
                                    const id = obtenerId(notificacion);
                                    const estudiante = obtenerEstudianteTexto(notificacion);
                                    const asunto = obtenerAsuntoTexto(notificacion);
                                    const mensaje = obtenerMensajeTexto(notificacion);
                                    const indicacion = obtenerIndicacionDocente(notificacion);
                                    const tipo = obtenerTipoTexto(notificacion);
                                    const fecha = obtenerFechaValor(notificacion);
                                    const estado = obtenerEstadoTexto(notificacion);

                                    return (
                                        <tr key={id}>
                                            <td>{id || "-"}</td>
                                            <td>
                                                <span className="fw-semibold text-dark">
                                                    {estudiante}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>{asunto}</strong>
                                            </td>
                                            <td>
                                                <div>{mensaje}</div>
                                                {indicacion && (
                                                    <div className="small text-primary mt-1">
                                                        <i className="bi bi-info-circle me-1"></i>
                                                        {indicacion}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge bg-info text-dark">
                                                    {tipo}
                                                </span>
                                            </td>
                                            <td>{formatearFecha(fecha)}</td>
                                            <td>
                                                <span
                                                    className={
                                                        estado === "Enviado" || estado === "Aprobada"
                                                            ? "badge bg-success"
                                                            : "badge bg-secondary"
                                                    }
                                                >
                                                    {estado}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => eliminar(id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="card-footer bg-white">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        Total de notificaciones:
                        <strong className="ms-1">{notificaciones.length}</strong>
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