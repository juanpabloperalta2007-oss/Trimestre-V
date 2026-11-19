import { useEffect, useState } from "react";
import {
    obtenerExcusas,
    aprobarExcusa,
    rechazarExcusa
} from "../services/api";

function ExcusasTable() {
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesandoId, setProcesandoId] = useState(null);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {
        try {
            setCargando(true);
            setError("");

            const respuesta = await obtenerExcusas();

            if (Array.isArray(respuesta)) {
                setDatos(respuesta);
            } else {
                setDatos([]);
            }
        } catch (err) {
            console.error("Error al cargar excusas:", err);
            setError("No fue posible cargar las excusas.");
            setDatos([]);
        } finally {
            setCargando(false);
        }
    }

    async function aprobar(excusa) {
        try {
            setProcesandoId(excusa.id);
            setError("");
            setMensajeExito("");

            await aprobarExcusa(excusa.id);
            await cargarDatos();

            setMensajeExito(
                `Excusa aprobada: ${excusa.estudiante} quedó justificado para la fecha ${excusa.fecha}.`
            );
        } catch (err) {
            console.error("Error al aprobar excusa:", err);
            setError("No fue posible aprobar la excusa.");
        } finally {
            setProcesandoId(null);
        }
    }

    async function rechazar(excusa) {
        try {
            setProcesandoId(excusa.id);
            setError("");
            setMensajeExito("");

            await rechazarExcusa(excusa.id);
            await cargarDatos();

            setMensajeExito(
                `Excusa de ${excusa.estudiante} (${excusa.fecha}) marcada como rechazada.`
            );
        } catch (err) {
            console.error("Error al rechazar excusa:", err);
            setError("No fue posible rechazar la excusa.");
        } finally {
            setProcesandoId(null);
        }
    }

    if (cargando) {
        return (
            <div className="text-center py-4">
                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>
                <p className="mt-2 text-muted">
                    Cargando excusas...
                </p>
            </div>
        );
    }

    return (
        <div className="card shadow">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                    <i className="bi bi-folder-check me-2"></i>
                    Excusas Registradas
                </h5>
            </div>

            <div className="card-body">
                {mensajeExito && (
                    <div
                        className="alert alert-success alert-dismissible fade show"
                        role="alert"
                    >
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {mensajeExito}
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                            onClick={() => setMensajeExito("")}
                        ></button>
                    </div>
                )}

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
                                    <th>Estudiante</th>
                                    <th>Fecha</th>
                                    <th>Motivo</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {datos.map((e) => {
                                    const estaProcesando = procesandoId === e.id;
                                    const deshabilitado = e.estado !== "Pendiente" || estaProcesando;

                                    return (
                                        <tr key={e.id}>
                                            <td>{e.estudiante}</td>
                                            <td>{e.fecha}</td>
                                            <td>{e.motivo}</td>
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
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-sm"
                                                        disabled={deshabilitado}
                                                        onClick={() => aprobar(e)}
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i>
                                                        {estaProcesando ? "Procesando..." : "Aprobar"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        disabled={deshabilitado}
                                                        onClick={() => rechazar(e)}
                                                    >
                                                        <i className="bi bi-x-lg me-1"></i>
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExcusasTable;