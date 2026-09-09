import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

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
import ConsultarMaterias from "./pages/Docente/ConsultarMaterias";
import MateriasAgregadas from "./pages/Docente/MateriasAgregadas";
import Materias from "./pages/Docente/Materias";
import Alertas from "./pages/Docente/Alertas";
import Notificaciones from "./pages/Docente/Notificaciones";
import Reportes from "./pages/Docente/Reportes";

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
// RUTA PROTEGIDA
// ======================================================

function RutaProtegida({ children, cargoPermitido }) {

  const usuarioRaw = localStorage.getItem("usuario");

  // No existe usuario
  if (!usuarioRaw || usuarioRaw === "undefined" || usuarioRaw === "null") {
    return <Navigate to="/" replace />;
  }

  let usuario;

  try {

    usuario = JSON.parse(usuarioRaw);

  } catch (error) {

    console.error(
      "Error al leer usuario de localStorage:",
      error
    );

    localStorage.removeItem("usuario");

    return <Navigate to="/" replace />;
  }

  // Verificar cargo
  if (cargoPermitido) {

    const cargoUsuario = parseInt(
      usuario?.id_cargo,
      10
    );

    if (cargoUsuario !== cargoPermitido) {

      console.error(
        "Acceso denegado. Cargo del usuario:",
        cargoUsuario,
        "Cargo requerido:",
        cargoPermitido
      );

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
          throw new Error(
            `Error HTTP ${res.status}`
          );
        }

        return res.json();

      })

      .then((data) => {

        setMensajeBackend(
          data.mensaje || ""
        );

      })

      .catch((error) => {

        console.error(
          "Error al conectar con el backend:",
          error
        );

      });

  }, []);


  return (

    <BrowserRouter>

      {/* ==============================
          MENSAJE DEL BACKEND
      ============================== */}

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


      {/* ==============================
          RUTAS
      ============================== */}

      <Routes>

        {/* ==========================
            AUTENTICACIÓN
        ========================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        <Route
          path="/enviar_pin"
          element={<EnviarPin />}
        />

        <Route
          path="/nueva_contrasena"
          element={<NuevaContrasena />}
        />


        {/* ==========================
            ADMINISTRADOR
        ========================== */}

        <Route
          path="/admin"
          element={
            <RutaProtegida cargoPermitido={1}>
              <VistaAdmin />
            </RutaProtegida>
          }
        />

        <Route
          path="/vista_admin"
          element={
            <RutaProtegida cargoPermitido={1}>
              <VistaAdmin />
            </RutaProtegida>
          }
        />

        <Route
          path="/registrar_usuario"
          element={
            <RutaProtegida cargoPermitido={1}>
              <RegistrarUsuario />
            </RutaProtegida>
          }
        />

        <Route
          path="/editar_usuario"
          element={
            <RutaProtegida cargoPermitido={1}>
              <EditarUsuario />
            </RutaProtegida>
          }
        />

        <Route
          path="/ver_usuario"
          element={
            <RutaProtegida cargoPermitido={1}>
              <VerUsuario />
            </RutaProtegida>
          }
        />


        {/* ==========================
            DOCENTE
        ========================== */}

        <Route
          path="/docente"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Inicio />
            </RutaProtegida>
          }
        />

        <Route
          path="/inicio"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Inicio />
            </RutaProtegida>
          }
        />

        <Route
          path="/consultar-horario"
          element={
            <RutaProtegida cargoPermitido={3}>
              <ConsultarHorario />
            </RutaProtegida>
          }
        />

        <Route
          path="/horario"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Horario />
            </RutaProtegida>
          }
        />

        <Route
          path="/consultar-materias"
          element={
            <RutaProtegida cargoPermitido={3}>
              <ConsultarMaterias />
            </RutaProtegida>
          }
        />

        <Route
          path="/materias-agregadas"
          element={
            <RutaProtegida cargoPermitido={3}>
              <MateriasAgregadas />
            </RutaProtegida>
          }
        />

        <Route
          path="/materias"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Materias />
            </RutaProtegida>
          }
        />

        <Route
          path="/alertas"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Alertas />
            </RutaProtegida>
          }
        />

        <Route
          path="/notificaciones"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Notificaciones />
            </RutaProtegida>
          }
        />

        <Route
          path="/reportes"
          element={
            <RutaProtegida cargoPermitido={3}>
              <Reportes />
            </RutaProtegida>
          }
        />


        {/* ==========================
            COORDINADOR
        ========================== */}

        <Route
          path="/coordinador"
          element={
            <RutaProtegida cargoPermitido={2}>
              <InicioCoordinador />
            </RutaProtegida>
          }
        />

        <Route
          path="/gestion-excusas"
          element={
            <RutaProtegida cargoPermitido={2}>
              <GestionExcusas />
            </RutaProtegida>
          }
        />

        <Route
          path="/cursos"
          element={
            <RutaProtegida cargoPermitido={2}>
              <Cursos />
            </RutaProtegida>
          }
        />


        {/* ==========================
            ACUDIENTE
        ========================== */}

        <Route
          path="/acudiente"
          element={
            <RutaProtegida cargoPermitido={4}>
              <InicioAcud />
            </RutaProtegida>
          }
        />

        <Route
          path="/excusas"
          element={
            <RutaProtegida cargoPermitido={4}>
              <Excusas />
            </RutaProtegida>
          }
        />

        <Route
          path="/consultar-estudiante"
          element={
            <RutaProtegida cargoPermitido={4}>
              <ConsultarEstudianteAcud />
            </RutaProtegida>
          }
        />

        <Route
          path="/estadistica-mensual"
          element={
            <RutaProtegida cargoPermitido={4}>
              <EstadisticaMensualAcud />
            </RutaProtegida>
          }
        />

        <Route
          path="/generar-excusa"
          element={
            <RutaProtegida cargoPermitido={4}>
              <GenerarExcusaAcud />
            </RutaProtegida>
          }
        />


        {/* ==========================
            CUALQUIER RUTA NO EXISTENTE
        ========================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;