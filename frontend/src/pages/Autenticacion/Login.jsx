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

      // Guardar los datos del usuario en la sesión local del navegador
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirección condicional según id_cargo
      switch (parseInt(usuario.id_cargo)) {
        case 1:
          navigate("/admin"); // Módulo Administrador
          break;
        case 2:
          navigate("/coordinador"); // Módulo Coordinador
          break;
        case 3:
          navigate("/docente"); // Módulo Docente
          break;
        case 4:
          navigate("/acudiente"); // Módulo Acudiente
          break;
        default:
          setError("El rol asignado no cuenta con una vista configurada.");
          break;
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("No se pudo conectar con el servidor. Verifique la conexión.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-3">
          <h3 className="fw-bold">Liceo Antonio De Toledo</h3>
          <p className="text-muted small">INICIO DE SESIÓN</p>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@gmail.com"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
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
          >
            {cargando ? "Cargando..." : "Iniciar Sesión"}
          </button>

          {error && (
            <div className="alert alert-info mt-3 p-2 text-center" role="alert">
              {error}
            </div>
          )}
        </form>

        <div className="text-center mt-3">
          <Link to="/recuperar" className="text-decoration-none small d-block mb-2">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link to="/registro" className="btn btn-outline-primary w-100 fw-bold">
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;