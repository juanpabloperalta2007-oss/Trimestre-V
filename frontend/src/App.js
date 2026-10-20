import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// ==============================
// CONTEXTO DE AUTENTICACIÓN
// ==============================
import { AuthProvider } from "./context/AuthContext";

// ==============================
// AUTENTICACIÓN
// ==============================
import Login from "./pages/Autenticacion/Login";
import Registro from "./pages/Autenticacion/Registro";
import EnviarPin from "./pages/Autenticacion/Enviar_pin";
import NuevaContrasena from "./pages/Autenticacion/Nueva_contrasena";

// ==============================
// ADMINISTRADOR
// ==============================
import VistaAdmin from "./pages/Administrador/Vista_admin";
import EditarUsuario from "./pages/Administrador/EditarUsuario";
import RegistrarUsuario from "./pages/Administrador/RegistrarUsuario";
import VerUsuario from "./pages/Administrador/VerUsuario";

// ==============================
// DOCENTE
// ==============================
import Inicio from "./pages/Docente/Inicio";
import ConsultarHorario from "./pages/Docente/ConsultarHorario";
import Horario from "./pages/Docente/Horario";
import MateriasAgregadas from "./pages/Docente/MateriasAgregadas";
import Materias from "./pages/Docente/Materias";
import Alertas from "./pages/Docente/Alertas";
import Notificaciones from "./pages/Docente/Notificaciones";
import Reportes from "./pages/Docente/Reportes";
import LlamarLista from "./pages/Docente/LlamarLista"; // <--- INCLUIDO

// ==============================
// COORDINADOR
// ==============================
import InicioCoordinador from "./pages/Coordinador/InicioCoordinador";
import GestionExcusas from "./pages/Coordinador/GestionExcusas";
import Cursos from "./pages/Coordinador/Cursos";

// ==============================
// ACUDIENTE
// ==============================
import InicioAcud from "./pages/Acudiente/InicioAcud";
import Excusas from "./pages/Acudiente/Excusas";
import ConsultarEstudianteAcud from "./pages/Acudiente/ConsultarEstudianteAcud";
import EstadisticaMensualAcud from "./pages/Acudiente/EstadisticaMensualAcud";
import GenerarExcusaAcud from "./pages/Acudiente/GenerarExcusaAcud";

// ======================================================
// OBTENER USUARIO DE LA SESIÓN
// ======================================================

function obtenerUsuarioSesion() {
  const usuarioRaw = localStorage.getItem("usuario");

  if (
    !usuarioRaw ||
    usuarioRaw === "undefined" ||
    usuarioRaw === "null"
  ) {
    return null;
  }

  try {
    const usuario = JSON.parse(usuarioRaw);
    return usuario;
  } catch (error) {
    console.error("Error leyendo usuario:", error);
    localStorage.removeItem("usuario");
    return null;
  }
}

// ======================================================
// OBTENER CARGO DEL USUARIO
// ======================================================

function obtenerCargoUsuario(usuario) {
  if (!usuario) {
    return null;
  }

  if (usuario.id_cargo !== undefined) {
    return parseInt(usuario.id_cargo, 10);
  }

  if (usuario.usuario && usuario.usuario.id_cargo !== undefined) {
    return parseInt(usuario.usuario.id_cargo, 10);
  }

  if (usuario.cargo !== undefined && typeof usuario.cargo !== "object") {
    return parseInt(usuario.cargo, 10);
  }

  if (usuario.cargo && typeof usuario.cargo === "object") {
    if (usuario.cargo.id_cargo !== undefined) {
      return parseInt(usuario.cargo.id_cargo, 10);
    }
  }

  return null;
}

// ======================================================
// RUTA PROTEGIDA
// ======================================================

function RutaProtegida({ children, cargoPermitido }) {
  const usuario = obtenerUsuarioSesion();

  if (!usuario) {
    console.log("Ruta protegida: no existe sesión.");
    return <Navigate to="/" replace />;
  }

  const cargoUsuario = obtenerCargoUsuario(usuario);

  if (cargoPermitido !== undefined) {
    if (cargoUsuario === null || Number.isNaN(cargoUsuario)) {
      console.error("El usuario no tiene un id_cargo válido.");
      return <Navigate to="/" replace />;
    }

    const cargosPermitidos = Array.isArray(cargoPermitido)
      ? cargoPermitido.map(Number)
      : [Number(cargoPermitido)];

    const tienePermiso = cargosPermitidos.includes(Number(cargoUsuario));

    if (!tienePermiso) {
      console.error("Acceso denegado. Cargo usuario:", cargoUsuario, "Cargos permitidos:", cargosPermitidos);
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

// ======================================================
// APP
// ======================================================

function App() {
  const [mensajeBackend, setMensajeBackend] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/mensaje")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setMensajeBackend(data.mensaje || "");
      })
      .catch((error) => {
        console.error("Error al conectar con el backend:", error);
      });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>

        {mensajeBackend && (
          <div
            style={{
              background: "#4caf50",
              color: "white",
              padding: "6px",
              textAlign: "center",
              fontSize: "14px"
            }}
          >
            Conexión Backend: {mensajeBackend}
          </div>
        )}

        <Routes>

          {/* AUTENTICACIÓN */}
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/enviar_pin" element={<EnviarPin />} />
          <Route path="/nueva_contrasena" element={<NuevaContrasena />} />

          {/* ADMINISTRADOR (CARGO = 1) */}
          <Route path="/admin" element={<RutaProtegida cargoPermitido={1}><VistaAdmin /></RutaProtegida>} />
          <Route path="/vista_admin" element={<RutaProtegida cargoPermitido={1}><VistaAdmin /></RutaProtegida>} />
          <Route path="/registrar_usuario" element={<RutaProtegida cargoPermitido={1}><RegistrarUsuario /></RutaProtegida>} />
          <Route path="/editar_usuario" element={<RutaProtegida cargoPermitido={1}><EditarUsuario /></RutaProtegida>} />
          <Route path="/ver_usuario" element={<RutaProtegida cargoPermitido={1}><VerUsuario /></RutaProtegida>} />

          {/* DOCENTE (CARGO = 3) */}
          <Route path="/docente" element={<RutaProtegida cargoPermitido={3}><Inicio /></RutaProtegida>} />
          <Route path="/inicio" element={<RutaProtegida cargoPermitido={3}><Inicio /></RutaProtegida>} />
          <Route path="/llamar-lista" element={<RutaProtegida cargoPermitido={3}><LlamarLista /></RutaProtegida>} /> {/* <--- RUTA HABILITADA */}
          <Route path="/consultar-horario" element={<RutaProtegida cargoPermitido={3}><ConsultarHorario /></RutaProtegida>} />
          <Route path="/horario" element={<RutaProtegida cargoPermitido={3}><Horario /></RutaProtegida>} />
          <Route path="/materias-agregadas" element={<RutaProtegida cargoPermitido={3}><MateriasAgregadas /></RutaProtegida>} />
          <Route path="/materias-registradas" element={<RutaProtegida cargoPermitido={3}><MateriasAgregadas /></RutaProtegida>} />
          <Route path="/consultar-materias" element={<RutaProtegida cargoPermitido={3}><MateriasAgregadas /></RutaProtegida>} />
          <Route path="/materias" element={<RutaProtegida cargoPermitido={3}><Materias /></RutaProtegida>} />

          {/* ALERTAS, NOTIFICACIONES Y REPORTES */}
          <Route path="/alertas" element={<RutaProtegida cargoPermitido={[2, 3]}><Alertas /></RutaProtegida>} />
          <Route path="/notificaciones" element={<RutaProtegida cargoPermitido={3}><Notificaciones /></RutaProtegida>} />
          <Route path="/reportes" element={<RutaProtegida cargoPermitido={[2, 3]}><Reportes /></RutaProtegida>} />

          {/* COORDINADOR (CARGO = 2) */}
          <Route path="/coordinador" element={<RutaProtegida cargoPermitido={2}><InicioCoordinador /></RutaProtegida>} />
          <Route path="/gestion-excusas" element={<RutaProtegida cargoPermitido={2}><GestionExcusas /></RutaProtegida>} />
          <Route path="/cursos" element={<RutaProtegida cargoPermitido={2}><Cursos /></RutaProtegida>} />

          {/* ACUDIENTE (CARGO = 4) */}
          <Route path="/acudiente" element={<RutaProtegida cargoPermitido={4}><InicioAcud /></RutaProtegida>} />
          <Route path="/excusas" element={<RutaProtegida cargoPermitido={4}><Excusas /></RutaProtegida>} />
          <Route path="/consultar-estudiante" element={<RutaProtegida cargoPermitido={4}><ConsultarEstudianteAcud /></RutaProtegida>} />
          <Route path="/estadistica-mensual" element={<RutaProtegida cargoPermitido={4}><EstadisticaMensualAcud /></RutaProtegida>} />
          <Route path="/generar-excusa" element={<RutaProtegida cargoPermitido={4}><GenerarExcusaAcud /></RutaProtegida>} />
          <Route path="/acudiente/estadisticas" element={<RutaProtegida cargoPermitido={4}><EstadisticaMensualAcud /></RutaProtegida>} />
          <Route path="/acudiente/generar-excusa" element={<RutaProtegida cargoPermitido={4}><GenerarExcusaAcud /></RutaProtegida>} />

          {/* RUTA NO EXISTENTE */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;