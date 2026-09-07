import React from "react";
import { useNavigate } from "react-router-dom";

function DocenteDashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h2>Panel de Docente</h2>
        <p className="lead">Bienvenido, {usuario.nombre || "Docente"}</p>
        <p><strong>Rol:</strong> {usuario.rol}</p>
        <button onClick={cerrarSesion} className="btn btn-danger mt-3">Cerrar Sesión</button>
      </div>
    </div>
  );
}

export default DocenteDashboard;