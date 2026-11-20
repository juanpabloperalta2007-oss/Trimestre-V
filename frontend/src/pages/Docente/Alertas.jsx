import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import AlertasTable from "../../components/AlertasTable";
import { obtenerInasistencias } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Alertas() {
    const { usuario } = useAuth();

    const [alertas, setAlertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [enviandoAlertas, setEnviandoAlertas] = useState(false);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");

    const cargarAlertas = async () => {
        try {
            setCargando(true);
            setError("");

            const respuesta = await obtenerInasistencias();

            let datos = [];

            if (Array.isArray(respuesta)) {
                datos = respuesta;
            } else if (respuesta && Array.isArray(respuesta.alertas)) {
                datos = respuesta.alertas;
            } else if (respuesta && Array.isArray(respuesta.asistencias)) {
                datos = respuesta.asistencias;
            }

            const datosNormalizados = datos.map((alerta) => {
                const inasistencias = Number(alerta.inasistencias) || 0;
                let estado = alerta.estado;

                if (!estado) {
                    if (inasistencias >= 10) {
                        estado = "Pérdida";
                    } else if (inasistencias >= 5) {
                        estado = "Exceso";
                    } else {
                        estado = "Normal";
                    }
                }

                return {
                    id_estudiante: alerta.id_estudiante,
                    estudiante: alerta.estudiante || "Sin nombre",
                    documento:
                        alerta.documento ||
                        alerta.numero_documento ||
                        "Sin documento",
                    curso: alerta.curso || "Sin curso",
                    inasistencias,
                    tardanzas: Number(alerta.tardanzas) || 0,
                    total_registros: Number(alerta.total_registros) || 0,
                    estado
                };
            });

            setAlertas(datosNormalizados);
        } catch (err) {
            console.error("Error al cargar las alertas:", err);
            setError("No fue posible cargar las alertas.");
            setAlertas([]);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarAlertas();
    }, []);

    const enviarAlertasAPadres = async () => {
        if (alertas.length === 0 || enviandoAlertas) return;

        try {
            setEnviandoAlertas(true);
            setError("");
            setMensajeExito("");

            const res = await axios.post(
                "http://localhost:5000/api/asistencias/alertas/notificar",
                {
                    alertas,
                    id_usuario: usuario?.id_usuario || null
                }
            );

            setMensajeExito(
                res.data?.mensaje ||
                    `Alertas enviadas a los acudientes de ${alertas.length} estudiante(s).`
            );
        } catch (err) {
            console.error("Error al enviar alertas a padres:", err);
            setError(
                err.response?.data?.error ||
                    "No fue posible enviar las alertas a los acudientes."
            );
        } finally {
            setEnviandoAlertas(false);
        }
    };

    const totalAlertas = alertas.length;

    const excesoInasistencias = alertas.filter((alerta) => {
        const estado = String(alerta.estado || "").toLowerCase().trim();
        return estado === "exceso";
    }).length;

    const perdidaMateria = alertas.filter((alerta) => {
        const estado = String(alerta.estado || "").toLowerCase().trim();
        return estado === "pérdida" || estado === "perdida";
    }).length;

    return (
        <Layout titulo="Alertas de Inasistencia">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h5 className="fw-bold mb-1">Alertas de Inasistencia</h5>
                    <p className="text-muted small mb-0">
                        Estudiantes con exceso de inasistencias o riesgo de pérdida por faltas
                    </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-warning fw-semibold"
                        style={{
                            backgroundColor: "#ffc107",
                            color: "#000000",
                            border: "1px solid #ffc107",
                            fontWeight: 600,
                            opacity: alertas.length === 0 || enviandoAlertas ? 0.6 : 1,
                            visibility: "visible"
                        }}
                        disabled={alertas.length === 0 || enviandoAlertas || cargando}
                        onClick={enviarAlertasAPadres}
                    >
                        <i className="bi bi-send-fill me-1"></i>
                        {enviandoAlertas
                            ? "Enviando alertas..."
                            : `Enviar alertas a padres (${totalAlertas})`}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-primary fw-semibold"
                        style={{
                            backgroundColor: "#ffffff",
                            color: "#0d6efd",
                            border: "1px solid #0d6efd",
                            fontWeight: 600,
                            opacity: 1,
                            visibility: "visible"
                        }}
                        disabled={cargando || enviandoAlertas}
                        onClick={cargarAlertas}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Actualizar
                    </button>
                </div>
            </div>

            {/* TARJETAS DE RESUMEN */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card border-primary shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-bell-fill text-primary fs-1"></i>
                            <h3 className="mt-3">
                                {cargando ? "..." : totalAlertas}
                            </h3>
                            <p className="mb-0 fw-bold">Total Alertas</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-warning shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-exclamation-circle-fill text-warning fs-1"></i>
                            <h3 className="mt-3">
                                {cargando ? "..." : excesoInasistencias}
                            </h3>
                            <p className="mb-0 fw-bold">Exceso de Inasistencias</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-danger shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-x-circle-fill text-danger fs-1"></i>
                            <h3 className="mt-3">
                                {cargando ? "..." : perdidaMateria}
                            </h3>
                            <p className="mb-0 fw-bold">Pérdida de Materia</p>
                        </div>
                    </div>
                </div>
            </div>

            {mensajeExito && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
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
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            <AlertasTable
                alertas={alertas}
                recargar={cargarAlertas}
                cargando={cargando}
                onEnviarAlertas={enviarAlertasAPadres}
                enviandoAlertas={enviandoAlertas}
            />
        </Layout>
    );
}

export default Alertas;