import React, { useEffect, useState, useMemo } from "react";
import { obtenerReportes } from "../services/api";

// Convierte fechas ISO/SQL (YYYY-MM-DD...), DD/MM/YYYY o Date a YYYY-MM-DD en hora local
function normalizarFechaISO(valorFecha) {
    if (!valorFecha) return "";

    if (valorFecha instanceof Date && !Number.isNaN(valorFecha.getTime())) {
        return valorFecha.toLocaleDateString("en-CA");
    }

    const str = String(valorFecha).trim();

    // Si viene como YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss...
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return str.slice(0, 10);
    }

    // Si viene como DD/MM/YYYY
    const partesSlash = str.split("/");
    if (partesSlash.length === 3) {
        const [dd, mm, yyyy] = partesSlash;
        return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    const fechaObj = new Date(str);
    if (!Number.isNaN(fechaObj.getTime())) {
        return fechaObj.toLocaleDateString("en-CA");
    }

    return str;
}

function esAsistencia(estado) {
    const val = String(estado || "").trim().toLowerCase();
    return val === "p" || val === "presente" || val === "asistencia" || val.includes("asistencia");
}

function esInasistencia(estado) {
    const val = String(estado || "").trim().toLowerCase();
    return (
        val === "a" ||
        val === "ausente" ||
        val === "inasistencia" ||
        val.includes("falla") ||
        val.includes("inasistencia") ||
        val.includes("sin justificar")
    );
}

function ReportesTable({ fecha = "", onLimpiarFecha }) {
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
            let datos = [];

            if (Array.isArray(respuesta)) {
                datos = respuesta;
            } else if (respuesta && Array.isArray(respuesta.reportes)) {
                datos = respuesta.reportes;
            } else if (respuesta && Array.isArray(respuesta.data)) {
                datos = respuesta.data;
            } else {
                throw new Error("El servidor no devolvió una lista de reportes.");
            }

            setReportes(datos);
        } catch (err) {
            console.error("ERROR REPORTES:", err);
            setError("No fue posible cargar los reportes.");
            setReportes([]);
        } finally {
            setCargando(false);
        }
    };

    const reportesFiltrados = useMemo(() => {
        const fechaObjetivo = normalizarFechaISO(fecha);
        if (!fechaObjetivo) return reportes;

        return reportes.filter((rep) => {
            const fechaRep = normalizarFechaISO(rep.fecha || rep.Fecha);
            return fechaRep === fechaObjetivo;
        });
    }, [reportes, fecha]);

    const resumen = useMemo(() => {
        let asistencias = 0;
        let inasistencias = 0;

        reportesFiltrados.forEach((rep) => {
            const est = rep.estado || rep.Estado;
            if (esAsistencia(est)) {
                asistencias += 1;
            } else if (esInasistencia(est)) {
                inasistencias += 1;
            }
        });

        return {
            total: reportesFiltrados.length,
            asistencias,
            inasistencias
        };
    }, [reportesFiltrados]);

    const formatearFecha = (valor) => {
        if (!valor) return "Sin fecha";
        const iso = normalizarFechaISO(valor);
        if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            const [yyyy, mm, dd] = iso.split("-");
            return `${dd}/${mm}/${yyyy}`;
        }
        return String(valor);
    };

    const obtenerNombre = (reporte) => {
        if (reporte.nombre_estudiante) {
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

    const obtenerClaseEstado = (estado) => {
        const valor = String(estado || "").trim().toLowerCase();

        if (esAsistencia(valor)) {
            return "bg-success";
        }

        if (valor.includes("justificada")) {
            return "bg-info";
        }

        if (valor.includes("retardo") || valor.includes("tarde") || valor === "t") {
            return "bg-warning text-dark";
        }

        if (esInasistencia(valor)) {
            return "bg-danger";
        }

        return "bg-secondary";
    };

    if (cargando) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted mt-3 mb-0">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                {/* ENCABEZADO */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">Reportes de asistencia</h5>
                        <p className="text-muted mb-0 small">
                            Consulta de registros de asistencia de los estudiantes
                            {fecha ? ` — Día: ${formatearFecha(fecha)}` : " — Todos los días"}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={cargarDatos}
                    >
                        Actualizar
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {/* RESUMEN */}
                {!error && (
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <small className="text-muted">Total de registros</small>
                                <h3 className="fw-bold mb-0">{resumen.total}</h3>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <small className="text-muted">Asistencias</small>
                                <h3 className="fw-bold text-success mb-0">{resumen.asistencias}</h3>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="border rounded p-3">
                                <small className="text-muted">Inasistencias</small>
                                <h3 className="fw-bold text-danger mb-0">{resumen.inasistencias}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIN REGISTROS */}
                {!error && reportesFiltrados.length === 0 && (
                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                        <span>
                            {fecha
                                ? `No existen registros de asistencia para el día ${formatearFecha(fecha)}.`
                                : "No existen registros de asistencia para mostrar."}
                        </span>
                        {fecha && onLimpiarFecha && (
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={onLimpiarFecha}
                            >
                                Ver todos
                            </button>
                        )}
                    </div>
                )}

                {/* TABLA */}
                {!error && reportesFiltrados.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Documento</th>
                                    <th>Estudiante</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Observaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportesFiltrados.map((reporte, index) => (
                                    <tr key={reporte.id_asistencia || index}>
                                        <td>{reporte.numero_documento || "Sin documento"}</td>
                                        <td>
                                            <strong>{obtenerNombre(reporte)}</strong>
                                        </td>
                                        <td>{formatearFecha(reporte.fecha)}</td>
                                        <td>
                                            <span className={`badge ${obtenerClaseEstado(reporte.estado)}`}>
                                                {reporte.estado || "Sin estado"}
                                            </span>
                                        </td>
                                        <td>{reporte.observaciones || "Sin observaciones"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PIE */}
                {!error && reportesFiltrados.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <small className="text-muted">
                            Mostrando <strong>{reportesFiltrados.length}</strong> registros
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportesTable;