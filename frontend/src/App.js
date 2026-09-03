import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ---------- AUTENTICACIÓN ----------
import Login from "./pages/Autenticacion/Login";
import Registro from "./pages/Autenticacion/Registro";
import EnviarPin from "./pages/Autenticacion/Enviar_pin";
import NuevaContrasena from "./pages/Autenticacion/Nueva_contrasena";

// ---------- ADMINISTRADOR ----------
import VistaAdmin from "./pages/Administrador/Vista_admin";
import EditarUsuario from './pages/Administrador/EditarUsuario';
import VerUsuario from './pages/Administrador/VerUsuario'

// ---------- DOCENTE ----------
import Inicio from "./pages/Docente/Inicio";
import ConsultarHorario from "./pages/Docente/ConsultarHorario";
import Horario from "./pages/Docente/Horario";
import ConsultarMaterias from "./pages/Docente/ConsultarMaterias";
import MateriasAgregadas from "./pages/Docente/MateriasAgregadas";
import Materias from "./pages/Docente/Materias";
import Alertas from "./pages/Docente/Alertas";
import Notificaciones from "./pages/Docente/Notificaciones";
import Reportes from "./pages/Docente/Reportes";

// ---------- COORDINADOR ----------
import InicioCoordinador from "./pages/Coordinador/InicioCoordinador";
import GestionExcusas from "./pages/Coordinador/GestionExcusas";
import Cursos from "./pages/Coordinador/Cursos";

// ---------- ACUDIENTE ----------
import InicioAcud from "./pages/Acudiente/InicioAcud";
import Excusas from "./pages/Acudiente/Excusas";
import ConsultarEstudianteAcud from "./pages/Acudiente/ConsultarEstudianteAcud";
import EstadisticaMensualAcud from "./pages/Acudiente/EstadisticaMensualAcud";
import GenerarExcusaAcud from "./pages/Acudiente/GenerarExcusaAcud";

function App() {
  // Estado para probar la conexión con el backend (como pidió el profesor)
  const [mensajeBackend, setMensajeBackend] = useState("");

  useEffect(() => {
    // Apunta al puerto donde corre tu backend Express (por ejemplo http://localhost:5000)
    fetch("http://localhost:5000/api/mensaje")
      .then((res) => res.json())
      .then((data) => setMensajeBackend(data.mensaje))
      .catch((err) => console.error("Error al conectar con el backend:", err));
  }, []);

  return (
    <BrowserRouter>
      {/* Banner superior opcional para verificar la conexión backend */}
      {mensajeBackend && (
        <div style={{ background: "#4caf50", color: "#fff", padding: "6px", textAlign: "center", fontSize: "14px" }}>
          Conexión Backend: {mensajeBackend}
        </div>
      )}

      <Routes>
        {/* AUTENTICACIÓN */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/enviar_pin" element={<EnviarPin />} />
        <Route path="/nueva_contrasena" element={<NuevaContrasena />} />

        {/* ADMINISTRADOR */}
        <Route path="/vista_admin" element={<VistaAdmin />} />
        <Route path="/editar_usuario" element={<EditarUsuario />} />
        <Route path="/ver_usuario" element={<VerUsuario />} />

        {/* DOCENTE */}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/consultar-horario" element={<ConsultarHorario />} />
        <Route path="/horario" element={<Horario />} />
        <Route path="/consultar-materias" element={<ConsultarMaterias />} />
        <Route path="/materias-agregadas" element={<MateriasAgregadas />} />
        <Route path="/materias" element={<Materias />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/reportes" element={<Reportes />} />

        {/* COORDINADOR */}
        <Route path="/coordinador" element={<InicioCoordinador />} />
        <Route path="/gestion-excusas" element={<GestionExcusas />} />
        <Route path="/cursos" element={<Cursos />} />

        {/* ACUDIENTE */}
        <Route path="/acudiente" element={<InicioAcud />} />
        <Route path="/excusas" element={<Excusas />} />
        <Route path="/consultar-estudiante" element={<ConsultarEstudianteAcud />} />
        <Route path="/estadistica-mensual" element={<EstadisticaMensualAcud />} />
        <Route path="/generar-excusa" element={<GenerarExcusaAcud />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;