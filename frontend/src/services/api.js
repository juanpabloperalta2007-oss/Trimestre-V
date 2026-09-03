import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Ajusta la URL/puerto de tu backend si es diferente
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cursos e Inasistencias
export const obtenerCursos = async () => (await API.get('/cursos')).data;
export const obtenerInasistencias = async () => (await API.get('/inasistencias')).data;
export const eliminarInasistencia = async (id) => (await API.delete(`/inasistencias/${id}`)).data;

// Excusas
export const obtenerExcusas = async () => (await API.get('/excusas')).data;
export const aprobarExcusa = async (id) => (await API.put(`/excusas/aprobar/${id}`)).data;
export const rechazarExcusa = async (id) => (await API.put(`/excusas/rechazar/${id}`)).data;

// Notificaciones
export const obtenerNotificaciones = async () => (await API.get('/notificaciones')).data;
export const enviarCorreo = async (datos) => (await API.post('/notificaciones/enviar', datos)).data;

// Reportes
export const obtenerReportes = async () => (await API.get('/reportes')).data;

// Usuarios
export const obtenerUsuarios = async () => (await API.get('/usuarios')).data;
export const eliminarUsuario = async (id) => (await API.delete(`/usuarios/${id}`)).data;

export const actualizarUsuario = async (id, datos) => (await API.put(`/usuarios/${id}`, datos)).data;

export default API;