import axios from "axios";

// ======================================================
// CONFIGURACIÓN DE API
// ======================================================

const API = axios.create({
    baseURL: "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json"
    }
});


// ======================================================
// TOKEN DE AUTENTICACIÓN
// ======================================================

API.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }
);


// ======================================================
// CURSOS
// ======================================================

export const obtenerCursos = async () => {

    const respuesta =
        await API.get("/cursos");

    return respuesta.data;
};


// ======================================================
// ASISTENCIAS
// ======================================================

export const obtenerAsistencias = async () => {

    const respuesta =
        await API.get("/asistencias");

    return respuesta.data;
};


// ======================================================
// OBTENER LISTA DE ASISTENCIA
// ======================================================

export const obtenerListaAsistencia = async (
    idAsignaturaCurso,
    fecha
) => {

    const id =
        Number(idAsignaturaCurso);

    const respuesta =
        await API.get(
            `/asistencias/lista/${id}`,
            {
                params: {
                    fecha: fecha
                }
            }
        );

    return respuesta.data;
};


// ======================================================
// GUARDAR ASISTENCIA DESDE LLAMAR LISTA
// ======================================================

export const guardarAsistencia = async (
    datos
) => {

    const datosEnviar = {

        fecha:
            datos.fecha,

        estado:
            datos.estado,

        observaciones:
            datos.observaciones || null,

        id_estudiante:
            Number(datos.id_estudiante),

        id_asignatura_curso:
            Number(datos.id_asignatura_curso)

    };


    console.log(
        "DATOS ENVIADOS A POST /asistencias/lista:",
        datosEnviar
    );


    const respuesta =
        await API.post(
            "/asistencias/lista",
            datosEnviar
        );


    return respuesta.data;
};


// ======================================================
// ACTUALIZAR ASISTENCIA
// ======================================================

export const actualizarAsistencia = async (
    id,
    datos
) => {

    const respuesta =
        await API.put(
            `/asistencias/${id}`,
            datos
        );

    return respuesta.data;
};


// ======================================================
// ELIMINAR ASISTENCIA
// ======================================================

export const eliminarInasistencia = async (
    id
) => {

    const respuesta =
        await API.delete(
            `/asistencias/${id}`
        );

    return respuesta.data;
};


// ======================================================
// ALERTAS
// ======================================================

export const obtenerInasistencias = async () => {

    const respuesta =
        await API.get(
            "/asistencias/alertas"
        );

    return respuesta.data;
};


// ======================================================
// EXCUSAS
// ======================================================

export const obtenerExcusas = async () => {

    const respuesta =
        await API.get(
            "/excusas"
        );

    return respuesta.data;
};


export const aprobarExcusa = async (
    id
) => {

    const respuesta =
        await API.put(
            `/excusas/aprobar/${id}`
        );

    return respuesta.data;
};


export const rechazarExcusa = async (
    id
) => {

    const respuesta =
        await API.put(
            `/excusas/rechazar/${id}`
        );

    return respuesta.data;
};


// ======================================================
// NOTIFICACIONES
// ======================================================

export const obtenerNotificaciones = async () => {

    const respuesta =
        await API.get(
            "/notificaciones"
        );

    return respuesta.data;
};


export const eliminarNotificacion = async (
    id
) => {

    const respuesta =
        await API.delete(
            `/notificaciones/${id}`
        );

    return respuesta.data;
};


export const enviarCorreo = async (
    datos
) => {

    const respuesta =
        await API.post(
            "/notificaciones",
            datos
        );

    return respuesta.data;
};


// ======================================================
// REPORTES
// ======================================================

export const obtenerReportes = async () => {

    const respuesta =
        await API.get(
            "/reportes"
        );

    return respuesta.data;
};


// ======================================================
// USUARIOS
// ======================================================

export const obtenerUsuarios = async () => {

    const respuesta =
        await API.get(
            "/usuarios"
        );

    return respuesta.data;
};


export const eliminarUsuario = async (
    id
) => {

    const respuesta =
        await API.delete(
            `/usuarios/${id}`
        );

    return respuesta.data;
};


export const actualizarUsuario = async (
    id,
    datos
) => {

    const respuesta =
        await API.put(
            `/usuarios/${id}`,
            datos
        );

    return respuesta.data;
};


// ======================================================
// EXPORTACIÓN
// ======================================================

export default API;