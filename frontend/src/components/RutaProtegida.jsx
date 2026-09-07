import React from "react";
import { Navigate } from "react-router-dom";

function RutaProtegida({ children, cargoPermitido }) {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return <Navigate to="/" replace />;
  }

  const usuario = JSON.parse(usuarioGuardado);

  if (cargoPermitido && parseInt(usuario.id_cargo) !== cargoPermitido) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;