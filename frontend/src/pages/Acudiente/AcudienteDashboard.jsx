import React from "react";
import { useNavigate } from "react-router-dom";

function AcudienteDashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h2>Panel de Acudiente / Padre de Familia</h2>
        <p className="lead">Bienvenido, {usuario.nombre || "Acudiente"}</p>
        <p><strong>Rol:</strong> {usuario.rol}</p>
        <button onClick={cerrarSesion} className="btn btn-danger mt-3">Cerrar Sesión</button>
      </div>
    </div>
  );
}

export default AcudienteDashboard;