import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import AlertasTable from "../../components/AlertasTable";
import { obtenerInasistencias } from "../../services/api";

function Alertas() {

    const [alertas, setAlertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");


    const cargarAlertas = async () => {

        try {

            setCargando(true);
            setError("");

            const respuesta =
                await obtenerInasistencias();

            console.log(
                "RESPUESTA DE ALERTAS:",
                respuesta
            );


            let datos = [];


            /*
            ============================================
            LA API PUEDE DEVOLVER UN ARRAY DIRECTAMENTE
            ============================================
            */

            if (Array.isArray(respuesta)) {

                datos = respuesta;

            }


            /*
            ============================================
            POR SI LA API DEVUELVE { alertas: [...] }
            ============================================
            */

            else if (
                respuesta &&
                Array.isArray(respuesta.alertas)
            ) {

                datos = respuesta.alertas;

            }


            /*
            ============================================
            POR SI DEVUELVE { asistencias: [...] }
            ============================================
            */

            else if (
                respuesta &&
                Array.isArray(respuesta.asistencias)
            ) {

                datos = respuesta.asistencias;

            }


            /*
            ============================================
            NORMALIZAR LOS DATOS
            ============================================
            */

            const datosNormalizados =
                datos.map((alerta) => {

                    const inasistencias =
                        Number(
                            alerta.inasistencias
                        ) || 0;


                    let estado =
                        alerta.estado;


                    /*
                    Si el backend no manda estado,
                    lo calculamos aquí.
                    */

                    if (!estado) {

                        if (inasistencias >= 10) {

                            estado = "Pérdida";

                        } else if (
                            inasistencias >= 5
                        ) {

                            estado = "Exceso";

                        } else {

                            estado = "Normal";
                        }
                    }


                    return {

                        id_estudiante:
                            alerta.id_estudiante,

                        estudiante:
                            alerta.estudiante ||
                            "Sin nombre",

                        documento:
                            alerta.documento ||
                            alerta.numero_documento ||
                            "Sin documento",

                        curso:
                            alerta.curso ||
                            "Sin curso",

                        inasistencias:
                            inasistencias,

                        tardanzas:
                            Number(
                                alerta.tardanzas
                            ) || 0,

                        total_registros:
                            Number(
                                alerta.total_registros
                            ) || 0,

                        estado:
                            estado
                    };

                });


            /*
            ============================================
            MOSTRAR DATOS EN CONSOLA
            ============================================
            */

            console.log(
                "ALERTAS NORMALIZADAS:",
                datosNormalizados
            );


            setAlertas(
                datosNormalizados
            );


        } catch (error) {

            console.error(
                "Error al cargar las alertas:",
                error
            );

            setError(
                "No fue posible cargar las alertas."
            );

            setAlertas([]);

        } finally {

            setCargando(false);
        }
    };


    useEffect(() => {

        cargarAlertas();

    }, []);


    /*
    ================================================
    CONTADORES
    ================================================
    */

    const totalAlertas =
        alertas.length;


    const excesoInasistencias =
        alertas.filter((alerta) => {

            const estado =
                String(
                    alerta.estado || ""
                )
                .toLowerCase()
                .trim();

            return (
                estado === "exceso"
            );

        }).length;


    const perdidaMateria =
        alertas.filter((alerta) => {

            const estado =
                String(
                    alerta.estado || ""
                )
                .toLowerCase()
                .trim();

            return (
                estado === "pérdida" ||
                estado === "perdida"
            );

        }).length;


    return (

        <Layout titulo="Alertas de Inasistencia">

            {/* =========================================
                TARJETAS DE RESUMEN
            ========================================= */}

            <div className="row mb-4">

                {/* TOTAL */}

                <div className="col-md-4">

                    <div className="card border-primary shadow-sm">

                        <div className="card-body text-center">

                            <i className="bi bi-bell-fill text-primary fs-1"></i>

                            <h3 className="mt-3">

                                {cargando
                                    ? "..."
                                    : totalAlertas}

                            </h3>

                            <p className="mb-0 fw-bold">

                                Total Alertas

                            </p>

                        </div>

                    </div>

                </div>


                {/* EXCESO */}

                <div className="col-md-4">

                    <div className="card border-warning shadow-sm">

                        <div className="card-body text-center">

                            <i className="bi bi-exclamation-circle-fill text-warning fs-1"></i>

                            <h3 className="mt-3">

                                {cargando
                                    ? "..."
                                    : excesoInasistencias}

                            </h3>

                            <p className="mb-0 fw-bold">

                                Exceso de Inasistencias

                            </p>

                        </div>

                    </div>

                </div>


                {/* PÉRDIDA */}

                <div className="col-md-4">

                    <div className="card border-danger shadow-sm">

                        <div className="card-body text-center">

                            <i className="bi bi-x-circle-fill text-danger fs-1"></i>

                            <h3 className="mt-3">

                                {cargando
                                    ? "..."
                                    : perdidaMateria}

                            </h3>

                            <p className="mb-0 fw-bold">

                                Pérdida de Materia

                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                    {error}

                </div>

            )}


            {/* TABLA */}

            <AlertasTable
                alertas={alertas}
                recargar={cargarAlertas}
                cargando={cargando}
            />

        </Layout>
    );
}


export default Alertas;