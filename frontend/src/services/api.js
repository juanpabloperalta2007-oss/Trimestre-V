import axios from "axios";


// ======================================================
// CONFIGURACIÓN
// ======================================================

const API = axios.create({

  baseURL: "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },

});


// ======================================================
// TOKEN
// ======================================================

API.interceptors.request.use(

  (config) => {

    const token = localStorage.getItem("token");

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

  const response = await API.get("/cursos");

  const data = response.data;

  console.log(
    "RESPUESTA DE /api/cursos:",
    data
  );

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.cursos)
  ) {

    return data.cursos;

  }

  return [];

};


// ======================================================
// ASISTENCIAS
// ======================================================

export const obtenerInasistencias = async () => {

  const response = await API.get(
    "/asistencias?limit=1000"
  );

  const data = response.data;

  console.log(
    "RESPUESTA DE /api/asistencias:",
    data
  );

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.asistencias)
  ) {

    return data.asistencias;

  }

  return [];

};


// ======================================================
// ELIMINAR INASISTENCIA
// ======================================================

export const eliminarInasistencia = async (id) => {

  const response = await API.delete(
    `/asistencias/${id}`
  );

  return response.data;

};


// ======================================================
// CREAR ASISTENCIA
// ======================================================

export const crearAsistencia = async (datos) => {

  const response = await API.post(
    "/asistencias",
    datos
  );

  return response.data;

};


// ======================================================
// ACTUALIZAR ASISTENCIA
// ======================================================

export const actualizarAsistencia = async (
  id,
  datos
) => {

  const response = await API.put(
    `/asistencias/${id}`,
    datos
  );

  return response.data;

};


// ======================================================
// EXCUSAS
// ======================================================

export const obtenerExcusas = async () => {

  try {

    const response = await API.get(
      "/excusas"
    );

    const data = response.data;

    if (Array.isArray(data)) {

      return data;

    }

    if (
      data &&
      Array.isArray(data.excusas)
    ) {

      return data.excusas;

    }

    return [];

  } catch (error) {

    console.error(
      "ERROR OBTENIENDO EXCUSAS:",
      error
    );

    if (
      error.response?.status === 404
    ) {

      return [];

    }

    throw error;

  }

};


// ======================================================
// APROBAR EXCUSA
// ======================================================

export const aprobarExcusa = async (id) => {

  const response = await API.put(
    `/excusas/aprobar/${id}`
  );

  return response.data;

};


// ======================================================
// RECHAZAR EXCUSA
// ======================================================

export const rechazarExcusa = async (id) => {

  const response = await API.put(
    `/excusas/rechazar/${id}`
  );

  return response.data;

};


// ======================================================
// NOTIFICACIONES
// ======================================================

export const obtenerNotificaciones = async () => {

  const response = await API.get(
    "/correos_notificaciones"
  );

  const data = response.data;

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.notificaciones)
  ) {

    return data.notificaciones;

  }

  return [];

};


// ======================================================
// ELIMINAR NOTIFICACIÓN
// ======================================================

export const eliminarNotificacion = async (id) => {

  const response = await API.delete(
    `/correos_notificaciones/${id}`
  );

  return response.data;

};


// ======================================================
// ENVIAR NOTIFICACIÓN
// ======================================================

export const enviarCorreo = async (datos) => {

  const response = await API.post(
    "/correos_notificaciones",
    datos
  );

  return response.data;

};


// ======================================================
// REPORTES
// ======================================================

export const obtenerReportes = async () => {

  const response = await API.get(
    "/reportes"
  );

  const data = response.data;

  console.log(
    "RESPUESTA DE /api/reportes:",
    data
  );

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.reportes)
  ) {

    return data.reportes;

  }

  return [];

};


// ======================================================
// USUARIOS
// ======================================================

export const obtenerUsuarios = async () => {

  const response = await API.get(
    "/usuarios"
  );

  const data = response.data;

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.usuarios)
  ) {

    return data.usuarios;

  }

  return [];

};


// ======================================================
// ELIMINAR USUARIO
// ======================================================

export const eliminarUsuario = async (id) => {

  const response = await API.delete(
    `/usuarios/${id}`
  );

  return response.data;

};


// ======================================================
// ACTUALIZAR USUARIO
// ======================================================

export const actualizarUsuario = async (
  id,
  datos
) => {

  const response = await API.put(
    `/usuarios/${id}`,
    datos
  );

  return response.data;

};


// ======================================================
// CREAR USUARIO
// ======================================================

export const crearUsuario = async (datos) => {

  const response = await API.post(
    "/usuarios",
    datos
  );

  return response.data;

};


// ======================================================
// ESTUDIANTES
// ======================================================

export const obtenerEstudiantes = async () => {

  const response = await API.get(
    "/estudiantes"
  );

  const data = response.data;

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.estudiantes)
  ) {

    return data.estudiantes;

  }

  return [];

};


// ======================================================
// DOCENTES
// ======================================================

export const obtenerDocentes = async () => {

  const response = await API.get(
    "/docentes"
  );

  const data = response.data;

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.docentes)
  ) {

    return data.docentes;

  }

  return [];

};


// ======================================================
// ACUDIENTES
// ======================================================

export const obtenerAcudientes = async () => {

  const response = await API.get(
    "/acudientes"
  );

  const data = response.data;

  if (Array.isArray(data)) {

    return data;

  }

  if (
    data &&
    Array.isArray(data.acudientes)
  ) {

    return data.acudientes;

  }

  return [];

};


// ======================================================
// EXPORTACIÓN
// ======================================================

export default API;