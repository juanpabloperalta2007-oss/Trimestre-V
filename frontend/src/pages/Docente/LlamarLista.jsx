import React, { useState } from "react";

import Layout from "../../components/Layout";

import {
    obtenerListaAsistencia,
    guardarAsistencia
} from "../../services/api";


// ======================================================
// COMPONENTE
// ======================================================

function LlamarLista() {

    // ==================================================
    // ESTADOS
    // ==================================================

    const [idAsignaturaCurso, setIdAsignaturaCurso] =
        useState("");

    const [fecha, setFecha] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );

    const [estudiantes, setEstudiantes] =
        useState([]);

    const [cargando, setCargando] =
        useState(false);

    const [guardando, setGuardando] =
        useState(false);

    const [error, setError] =
        useState("");

    const [mensaje, setMensaje] =
        useState("");


    // ==================================================
    // CONVERTIR ESTADO BD → TEXTO
    // ==================================================

    const convertirEstadoTexto = (
        estado
    ) => {

        const valor =
            String(estado || "")
                .toUpperCase()
                .trim();


        switch (valor) {

            case "P":
                return "Presente";

            case "A":
                return "Ausente";

            case "T":
                return "Tardía";

            case "J":
                return "Justificado";

            default:
                return "";

        }
    };


    // ==================================================
    // CONVERTIR TEXTO → ESTADO BD
    // ==================================================

    const convertirEstadoBD = (
        estado
    ) => {

        const valor =
            String(estado || "")
                .toLowerCase()
                .trim();


        switch (valor) {

            case "p":
            case "presente":
                return "P";


            case "a":
            case "ausente":
                return "A";


            case "t":
            case "tardia":
            case "tardía":
            case "tarde":
                return "T";


            case "j":
            case "justificado":
                return "J";


            default:
                return null;

        }
    };


    // ==================================================
    // OBTENER NOMBRE COMPLETO
    // ==================================================

    const obtenerNombreCompleto = (
        estudiante
    ) => {

        if (
            estudiante.nombre_completo
        ) {

            return estudiante.nombre_completo;

        }


        return [

            estudiante.primer_nombre,

            estudiante.segundo_nombre,

            estudiante.primer_apellido,

            estudiante.segundo_apellido

        ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

    };


    // ==================================================
    // CARGAR LISTA
    // ==================================================

    const cargarLista = async () => {

        try {

            setCargando(true);

            setError("");

            setMensaje("");

            setEstudiantes([]);


            // ------------------------------------------
            // VALIDAR ID
            // ------------------------------------------

            const id =
                Number(idAsignaturaCurso);


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                setError(
                    "Debe ingresar un código válido de materia o curso."
                );

                return;
            }


            // ------------------------------------------
            // CONSULTAR BACKEND
            // ------------------------------------------

            console.log(
                "Cargando lista:",
                {
                    idAsignaturaCurso: id,
                    fecha: fecha
                }
            );


            const respuesta =
                await obtenerListaAsistencia(
                    id,
                    fecha
                );


            console.log(
                "RESPUESTA DE LISTA:",
                respuesta
            );


            // ------------------------------------------
            // DETERMINAR ARRAY
            // ------------------------------------------

            let lista = [];


            if (
                Array.isArray(respuesta)
            ) {

                lista = respuesta;

            }

            else if (
                Array.isArray(
                    respuesta?.estudiantes
                )
            ) {

                lista =
                    respuesta.estudiantes;

            }


            // ------------------------------------------
            // NORMALIZAR ESTUDIANTES
            // ------------------------------------------

            const listaNormalizada =
                lista.map(
                    (estudiante) => {

                        const estadoTexto =
                            convertirEstadoTexto(
                                estudiante.estado
                            );


                        return {

                            ...estudiante,

                            id_estudiante:
                                Number(
                                    estudiante.id_estudiante
                                ),

                            id_asignatura_curso:
                                Number(
                                    estudiante.id_asignatura_curso ||
                                    id
                                ),

                            nombre_completo:
                                obtenerNombreCompleto(
                                    estudiante
                                ),

                            estado:
                                estadoTexto,

                            observaciones:
                                estudiante.observaciones ||
                                ""

                        };

                    }
                );


            setEstudiantes(
                listaNormalizada
            );


            if (
                listaNormalizada.length === 0
            ) {

                setMensaje(
                    "No se encontraron estudiantes para esta materia o curso."
                );

            }

        }

        catch (error) {

            console.error(
                "Error cargando lista:",
                error
            );


            const mensajeBackend =
                error?.response?.data?.mensaje ||
                error?.response?.data?.error ||
                "";


            setError(
                mensajeBackend ||
                "No fue posible cargar la lista de estudiantes."
            );

        }

        finally {

            setCargando(false);

        }
    };


    // ==================================================
    // CAMBIAR ESTADO
    // ==================================================

    const cambiarEstado = (
        idEstudiante,
        nuevoEstado
    ) => {

        setEstudiantes(
            (listaAnterior) => {

                return listaAnterior.map(
                    (estudiante) => {

                        if (
                            Number(
                                estudiante.id_estudiante
                            ) ===
                            Number(
                                idEstudiante
                            )
                        ) {

                            return {

                                ...estudiante,

                                estado:
                                    nuevoEstado

                            };

                        }


                        return estudiante;

                    }
                );

            }
        );
    };


    // ==================================================
    // CAMBIAR OBSERVACIÓN
    // ==================================================

    const cambiarObservacion = (
        idEstudiante,
        observacion
    ) => {

        setEstudiantes(
            (listaAnterior) => {

                return listaAnterior.map(
                    (estudiante) => {

                        if (
                            Number(
                                estudiante.id_estudiante
                            ) ===
                            Number(
                                idEstudiante
                            )
                        ) {

                            return {

                                ...estudiante,

                                observaciones:
                                    observacion

                            };

                        }


                        return estudiante;

                    }
                );

            }
        );
    };


    // ==================================================
    // TODOS PRESENTES
    // ==================================================

    const marcarTodosPresentes = () => {

        setEstudiantes(
            (listaAnterior) => {

                return listaAnterior.map(
                    (estudiante) => ({

                        ...estudiante,

                        estado: "Presente"

                    })
                );

            }
        );

    };


    // ==================================================
    // GUARDAR ASISTENCIA
    // ==================================================

    const guardarLista = async () => {

        try {

            setGuardando(true);

            setError("");

            setMensaje("");


            // ------------------------------------------
            // VALIDAR ID MATERIA
            // ------------------------------------------

            const idMateriaCurso =
                Number(idAsignaturaCurso);


            if (
                !Number.isInteger(
                    idMateriaCurso
                ) ||
                idMateriaCurso <= 0
            ) {

                setError(
                    "El código de la materia o curso no es válido."
                );

                return;
            }


            // ------------------------------------------
            // VALIDAR LISTA
            // ------------------------------------------

            if (
                !estudiantes ||
                estudiantes.length === 0
            ) {

                setError(
                    "No hay estudiantes para guardar."
                );

                return;
            }


            // ------------------------------------------
            // VALIDAR ESTADOS
            // ------------------------------------------

            const estudiantesSinEstado =
                estudiantes.filter(
                    (estudiante) => {

                        return !convertirEstadoBD(
                            estudiante.estado
                        );

                    }
                );


            if (
                estudiantesSinEstado.length > 0
            ) {

                setError(
                    "Todos los estudiantes deben tener un estado de asistencia."
                );

                return;
            }


            // ------------------------------------------
            // GUARDAR UNO POR UNO
            // ------------------------------------------

            for (
                const estudiante of estudiantes
            ) {

                const idEstudiante =
                    Number(
                        estudiante.id_estudiante
                    );


                const estadoBD =
                    convertirEstadoBD(
                        estudiante.estado
                    );


                if (
                    !Number.isInteger(
                        idEstudiante
                    ) ||
                    idEstudiante <= 0
                ) {

                    throw new Error(
                        `ID de estudiante inválido: ${idEstudiante}`
                    );

                }


                const datos = {

                    fecha:
                        fecha,

                    estado:
                        estadoBD,

                    observaciones:
                        estudiante.observaciones ||
                        null,

                    id_estudiante:
                        idEstudiante,

                    id_asignatura_curso:
                        idMateriaCurso

                };


                console.log(
                    "GUARDANDO:",
                    datos
                );


                await guardarAsistencia(
                    datos
                );

            }


            // ------------------------------------------
            // MENSAJE DE ÉXITO
            // ------------------------------------------

            setMensaje(
                "La asistencia fue guardada correctamente."
            );


            // ------------------------------------------
            // RECARGAR
            // ------------------------------------------

            await cargarLista();

        }

        catch (error) {

            console.error(
                "Error guardando asistencia:",
                error
            );


            const mensajeBackend =
                error?.response?.data?.mensaje ||
                error?.response?.data?.error ||
                error?.message ||
                "";


            setError(
                mensajeBackend ||
                "Ocurrió un error al guardar la asistencia."
            );

        }

        finally {

            setGuardando(false);

        }

    };


    // ==================================================
    // CONTADORES
    // ==================================================

    const total =
        estudiantes.length;


    const presentes =
        estudiantes.filter(
            (estudiante) =>
                convertirEstadoBD(
                    estudiante.estado
                ) === "P"
        ).length;


    const ausentes =
        estudiantes.filter(
            (estudiante) =>
                convertirEstadoBD(
                    estudiante.estado
                ) === "A"
        ).length;


    const tardias =
        estudiantes.filter(
            (estudiante) =>
                convertirEstadoBD(
                    estudiante.estado
                ) === "T"
        ).length;


    const justificados =
        estudiantes.filter(
            (estudiante) =>
                convertirEstadoBD(
                    estudiante.estado
                ) === "J"
        ).length;


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <Layout titulo="Llamar lista">

            {/* ==========================================
                FORMULARIO
            ========================================== */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header bg-primary text-white">

                    <h5 className="mb-0">
                        Registrar asistencia
                    </h5>

                </div>


                <div className="card-body">

                    <div className="row">

                        {/* MATERIA */}

                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">

                                Materia / Curso

                            </label>


                            <input
                                type="number"
                                className="form-control"
                                value={
                                    idAsignaturaCurso
                                }
                                onChange={(e) =>
                                    setIdAsignaturaCurso(
                                        e.target.value
                                    )
                                }
                                placeholder="Ej: 2"
                                min="1"
                            />

                        </div>


                        {/* FECHA */}

                        <div className="col-md-6 mb-3">

                            <label className="form-label fw-bold">

                                Fecha

                            </label>


                            <input
                                type="date"
                                className="form-control"
                                value={fecha}
                                onChange={(e) =>
                                    setFecha(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    <button
                        type="button"
                        className="btn btn-success w-100"
                        onClick={cargarLista}
                        disabled={cargando}
                    >

                        {cargando ? (

                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                ></span>

                                Cargando...

                            </>

                        ) : (

                            <>
                                <i className="bi bi-list-check me-2"></i>

                                Cargar lista

                            </>

                        )}

                    </button>

                </div>

            </div>


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                    {error}

                </div>

            )}


            {/* ==========================================
                ÉXITO
            ========================================== */}

            {mensaje && (

                <div className="alert alert-success">

                    <i className="bi bi-check-circle-fill me-2"></i>

                    {mensaje}

                </div>

            )}


            {/* ==========================================
                LISTA
            ========================================== */}

            {estudiantes.length > 0 && (

                <>

                    {/* CONTADORES */}

                    <div className="row mb-4">

                        <div className="col-md-3 mb-3">

                            <div className="card border-primary shadow-sm">

                                <div className="card-body text-center">

                                    <h2 className="text-primary">
                                        {total}
                                    </h2>

                                    <strong>
                                        Total estudiantes
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="col-md-3 mb-3">

                            <div className="card border-success shadow-sm">

                                <div className="card-body text-center">

                                    <h2 className="text-success">
                                        {presentes}
                                    </h2>

                                    <strong>
                                        Presentes
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="col-md-3 mb-3">

                            <div className="card border-danger shadow-sm">

                                <div className="card-body text-center">

                                    <h2 className="text-danger">
                                        {ausentes}
                                    </h2>

                                    <strong>
                                        Ausentes
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="col-md-3 mb-3">

                            <div className="card border-warning shadow-sm">

                                <div className="card-body text-center">

                                    <h2 className="text-warning">
                                        {tardias}
                                    </h2>

                                    <strong>
                                        Tardías
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* JUSTIFICADOS */}

                    <div className="alert alert-info">

                        <strong>
                            Justificados:
                        </strong>{" "}

                        {justificados}

                    </div>


                    {/* ENCABEZADO */}

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h4 className="mb-0">
                            Lista de estudiantes
                        </h4>


                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={
                                marcarTodosPresentes
                            }
                            disabled={guardando}
                        >

                            <i className="bi bi-check-all me-2"></i>

                            Todos presentes

                        </button>

                    </div>


                    {/* TABLA */}

                    <div className="card shadow-sm border-0">

                        <div className="card-header bg-primary text-white">

                            <div className="d-flex justify-content-between">

                                <strong>
                                    Lista de estudiantes
                                </strong>

                                <span>
                                    {fecha}
                                </span>

                            </div>

                        </div>


                        <div className="table-responsive">

                            <table className="table table-bordered table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th className="text-center">
                                            #
                                        </th>

                                        <th>
                                            Documento
                                        </th>

                                        <th>
                                            Estudiante
                                        </th>

                                        <th className="text-center">
                                            Estado
                                        </th>

                                        <th>
                                            Observaciones
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {estudiantes.map(
                                        (
                                            estudiante,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    estudiante.id_estudiante
                                                }
                                            >

                                                <td className="text-center">

                                                    {index + 1}

                                                </td>


                                                <td>

                                                    {
                                                        estudiante.numero_documento ||
                                                        "-"
                                                    }

                                                </td>


                                                <td>

                                                    <strong>

                                                        {
                                                            estudiante.nombre_completo
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    <div className="d-flex flex-wrap gap-1 justify-content-center">

                                                        <button
                                                            type="button"
                                                            className={
                                                                estudiante.estado ===
                                                                "Presente"
                                                                    ? "btn btn-success btn-sm"
                                                                    : "btn btn-outline-success btn-sm"
                                                            }
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    estudiante.id_estudiante,
                                                                    "Presente"
                                                                )
                                                            }
                                                            disabled={
                                                                guardando
                                                            }
                                                        >
                                                            Presente
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                estudiante.estado ===
                                                                "Ausente"
                                                                    ? "btn btn-danger btn-sm"
                                                                    : "btn btn-outline-danger btn-sm"
                                                            }
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    estudiante.id_estudiante,
                                                                    "Ausente"
                                                                )
                                                            }
                                                            disabled={
                                                                guardando
                                                            }
                                                        >
                                                            Ausente
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                estudiante.estado ===
                                                                "Tardía"
                                                                    ? "btn btn-warning btn-sm"
                                                                    : "btn btn-outline-warning btn-sm"
                                                            }
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    estudiante.id_estudiante,
                                                                    "Tardía"
                                                                )
                                                            }
                                                            disabled={
                                                                guardando
                                                            }
                                                        >
                                                            Tardía
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                estudiante.estado ===
                                                                "Justificado"
                                                                    ? "btn btn-info btn-sm"
                                                                    : "btn btn-outline-info btn-sm"
                                                            }
                                                            onClick={() =>
                                                                cambiarEstado(
                                                                    estudiante.id_estudiante,
                                                                    "Justificado"
                                                                )
                                                            }
                                                            disabled={
                                                                guardando
                                                            }
                                                        >
                                                            Justificado
                                                        </button>

                                                    </div>

                                                </td>


                                                <td>

                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        value={
                                                            estudiante.observaciones ||
                                                            ""
                                                        }
                                                        placeholder="Observación"
                                                        onChange={(e) =>
                                                            cambiarObservacion(
                                                                estudiante.id_estudiante,
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            guardando
                                                        }
                                                    />

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* GUARDAR */}

                        <div className="card-footer">

                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={guardarLista}
                                disabled={guardando}
                            >

                                {guardando ? (

                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                        ></span>

                                        Guardando asistencia...

                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-save me-2"></i>

                                        Guardar asistencia

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </>

            )}

        </Layout>

    );

}


export default LlamarLista;