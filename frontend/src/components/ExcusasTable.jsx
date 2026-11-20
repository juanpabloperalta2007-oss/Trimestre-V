import { useEffect, useState } from "react";
import {
    obtenerExcusas,
    aprobarExcusa,
    rechazarExcusa
} from "../services/api";

const API_BASE_URL = "http://localhost:5000";

function extraerDescripcionLimpia(observaciones = "") {
    if (!observaciones) return "Sin descripción";
    let texto = String(observaciones).trim();
    texto = texto.replace(/^\[EXCUSA\s*-\s*[^\]]*\]:\s*/i, "");
    texto = texto.replace(/\s*\[Soporte:\s*[^\]]*\]\s*$/i, "");
    return texto.trim() || "Sin descripción";
}

function extraerComentarioCoordinador(observaciones = "") {
    if (!observaciones) return null;
    const match = String(observaciones).match(/\[Coord\.\s*(?:Aprobada|Rechazada):\s*([^\]]+)\]/i);
    return match && match[1] ? match[1].trim() : null;
}

function ExcusasTable() {
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [procesandoId, setProcesandoId] = useState(null);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    // Estado para el cuadro de motivo del coordinador
    const [accionPendiente, setAccionPendiente] = useState(null); // { id, tipo: 'aprobar' | 'rechazar', estudiante, fecha }
    const [comentarioCoord, setComentarioCoord] = useState("");

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

    function abrirConfirmacion(excusa, tipo) {
        setError("");
        setMensajeExito("");
        setAccionPendiente({
            id: excusa.id,
            tipo,
            estudiante: excusa.estudiante,
            fecha: excusa.fecha
        });
        setComentarioCoord("");
    }

    function cancelarConfirmacion() {
        if (procesandoId) return;
        setAccionPendiente(null);
        setComentarioCoord("");
    }

    async function confirmarDecision() {
        if (!accionPendiente) return;

        const { id, tipo, estudiante, fecha } = accionPendiente;
        const comentarioLimpio = comentarioCoord.trim();

        try {
            setProcesandoId(id);
            setError("");
            setMensajeExito("");

            if (tipo === "aprobar") {
                await aprobarExcusa(id, { comentario: comentarioLimpio });
                setMensajeExito(
                    `Excusa aprobada: ${estudiante} quedó justificado para la fecha ${fecha}.` +
                    (comentarioLimpio ? ` Motivo: "${comentarioLimpio}".` : "")
                );
            } else {
                await rechazarExcusa(id, { comentario: comentarioLimpio });
                setMensajeExito(
                    `Excusa de ${estudiante} (${fecha}) marcada como rechazada.` +
                    (comentarioLimpio ? ` Motivo: "${comentarioLimpio}".` : "")
                );
            }

            setAccionPendiente(null);
            setComentarioCoord("");
            await cargarDatos();
        } catch (err) {
            console.error(`Error al ${tipo} excusa:`, err);
            setError(
                err?.response?.data?.error ||
                `No fue posible ${tipo === "aprobar" ? "aprobar" : "rechazar"} la excusa.`
            );
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

                {accionPendiente && (
                    <div
                        className={`alert ${
                            accionPendiente.tipo === "aprobar"
                                ? "alert-success"
                                : "alert-danger"
                        } border shadow-sm mb-4`}
                        role="alert"
                    >
                        <div className="fw-bold mb-1">
                            {accionPendiente.tipo === "aprobar"
                                ? `Aprobar excusa de ${accionPendiente.estudiante} (${accionPendiente.fecha})`
                                : `Rechazar excusa de ${accionPendiente.estudiante} (${accionPendiente.fecha})`}
                        </div>
                        <label className="form-label small fw-semibold mb-1">
                            Mensaje / motivo del coordinador (opcional)
                        </label>
                        <textarea
                            className="form-control form-control-sm mb-2"
                            rows="2"
                            placeholder={
                                accionPendiente.tipo === "aprobar"
                                    ? "Ej: Certificado médico verificado, se justifica la inasistencia."
                                    : "Ej: El soporte adjunto no es legible o no corresponde a la fecha."
                            }
                            value={comentarioCoord}
                            onChange={(e) => setComentarioCoord(e.target.value)}
                            disabled={procesandoId === accionPendiente.id}
                        />
                        <div className="d-flex flex-wrap gap-2">
                            <button
                                type="button"
                                className={`btn btn-sm ${
                                    accionPendiente.tipo === "aprobar"
                                        ? "btn-success"
                                        : "btn-danger"
                                }`}
                                style={{
                                    backgroundColor:
                                        accionPendiente.tipo === "aprobar"
                                            ? "#198754"
                                            : "#dc3545",
                                    color: "#ffffff",
                                    border: "none",
                                    fontWeight: 600,
                                    opacity: 1,
                                    visibility: "visible"
                                }}
                                disabled={procesandoId === accionPendiente.id}
                                onClick={confirmarDecision}
                            >
                                {procesandoId === accionPendiente.id
                                    ? "Guardando..."
                                    : accionPendiente.tipo === "aprobar"
                                    ? "Confirmar aprobación"
                                    : "Confirmar rechazo"}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{
                                    backgroundColor: "#6c757d",
                                    color: "#ffffff",
                                    border: "none",
                                    fontWeight: 600,
                                    opacity: 1,
                                    visibility: "visible"
                                }}
                                disabled={procesandoId === accionPendiente.id}
                                onClick={cancelarConfirmacion}
                            >
                                Cancelar
                            </button>
                        </div>
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
                                    <th>Descripción</th>
                                    <th>Soporte</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {datos.map((e) => {
                                    const estaProcesando = procesandoId === e.id;
                                    const deshabilitado = e.estado !== "Pendiente" || estaProcesando;
                                    const descripcionLimpia = extraerDescripcionLimpia(e.observaciones);
                                    const comentarioCoordGuardado = extraerComentarioCoordinador(e.observaciones);
                                    const urlCompletaSoporte = e.soporte_url
                                        ? `${API_BASE_URL}${e.soporte_url}`
                                        : null;

                                    return (
                                        <tr key={e.id}>
                                            <td className="fw-semibold">{e.estudiante}</td>
                                            <td>{e.fecha}</td>
                                            <td>{e.motivo}</td>
                                            <td style={{ maxWidth: "300px" }}>
                                                <div className="small text-dark">
                                                    {descripcionLimpia}
                                                </div>
                                                {comentarioCoordGuardado && (
                                                    <div className="small text-primary mt-1">
                                                        <strong>Coordinación:</strong> {comentarioCoordGuardado}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {urlCompletaSoporte ? (
                                                    <a
                                                        href={urlCompletaSoporte}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                                                        style={{
                                                            backgroundColor: "#ffffff",
                                                            color: "#0d6efd",
                                                            border: "1px solid #0d6efd",
                                                            fontWeight: 600,
                                                            opacity: 1,
                                                            visibility: "visible"
                                                        }}
                                                    >
                                                        <i className="bi bi-file-earmark-arrow-down"></i>
                                                        <span>Ver soporte</span>
                                                    </a>
                                                ) : e.soporte_archivo ? (
                                                    <span className="badge bg-light text-dark border">
                                                        {e.soporte_archivo}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted small">
                                                        Sin adjunto
                                                    </span>
                                                )}
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
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success btn-sm"
                                                        style={{
                                                            backgroundColor: "#198754",
                                                            color: "#ffffff",
                                                            border: "1px solid #198754",
                                                            fontWeight: 600,
                                                            opacity: deshabilitado ? 0.55 : 1,
                                                            visibility: "visible"
                                                        }}
                                                        disabled={deshabilitado}
                                                        onClick={() => abrirConfirmacion(e, "aprobar")}
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i>
                                                        {estaProcesando ? "Procesando..." : "Aprobar"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        style={{
                                                            backgroundColor: "#dc3545",
                                                            color: "#ffffff",
                                                            border: "1px solid #dc3545",
                                                            fontWeight: 600,
                                                            opacity: deshabilitado ? 0.55 : 1,
                                                            visibility: "visible"
                                                        }}
                                                        disabled={deshabilitado}
                                                        onClick={() => abrirConfirmacion(e, "rechazar")}
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