import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await axios.post("http://localhost:5000/api/usuarios/login", {
        correo,
        password
      });

      const { usuario } = respuesta.data;

      // Guardar sesión en localStorage
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirección condicional según el id_cargo
      switch (parseInt(usuario.id_cargo)) {
        case 1:
          navigate("/vista_admin"); // O /admin según la ruta de App.jsx
          break;
        case 2:
          navigate("/coordinador");
          break;
        case 3:
          navigate("/inicio"); // O /docente según la ruta de App.jsx
          break;
        case 4:
          navigate("/acudiente");
          break;
        default:
          setError("El rol asignado no cuenta con una vista configurada.");
          break;
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%", backgroundColor: "#ffffff" }}>
        <div className="text-center mb-3">
          <h3 className="fw-bold" style={{ color: "#000000" }}>Liceo Antonio De Toledo</h3>
          <p className="text-muted small">INICIO DE SESIÓN</p>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small" style={{ color: "#333333" }}>Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@gmail.com"
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold small" style={{ color: "#333333" }}>Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <small className="form-text text-muted">Entre 8 y 20 caracteres.</small>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 fw-bold my-2"
            disabled={cargando}
            style={{ backgroundColor: "#198754", borderColor: "#198754", color: "#ffffff" }}
          >
            {cargando ? "Cargando..." : "Iniciar Sesión"}
          </button>

          {error && (
            <div className="alert alert-info mt-3 p-2 text-center small" role="alert">
              {error}
            </div>
          )}
        </form>

        <div className="text-center mt-3">
          <Link 
            to="/enviar_pin" 
            className="small d-block mb-3"
            style={{ color: "#0d6efd", textDecoration: "none" }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
          
          {/* BOTÓN REGISTRARSE VISIBLE Y CON ESTILOS FORZADOS */}
          <Link 
            to="/registro" 
            className="btn w-100 fw-bold d-block text-center"
            style={{ 
              backgroundColor: "#ffffff", 
              color: "#0d6efd", 
              border: "2px solid #0d6efd",
              textDecoration: "none",
              padding: "8px 0"
            }}
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;