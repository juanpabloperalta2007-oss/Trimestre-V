import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Registro.css";

function Registro() {
  const navigate = useNavigate();

  // Estado con la estructura requerida por la base de datos
  const [formData, setFormData] = useState({
    tipo_documento: "CC",
    numero_documento: "",
    primer_nombre: "",
    primer_apellido: "",
    correo: "",
    password: "",
    id_cargo: "4" // 4 = Acudiente (por defecto), 3 = Docente
  });

  const [registrado, setRegistrado] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setRegistrado(false);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/usuarios/registro-publico", formData);
      
      setRegistrado(true);

      // Redirección hacia la vista de Login despues de 1.5 segundos
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Error al realizar el registro. Intente de nuevo.");
    }
  };

  return (
    <div className="contenedor-form">
      <h1>Liceo Antonio De Toledo</h1>
      <h2>Registrar Usuario</h2>
      <hr />
      
      <form onSubmit={manejarRegistro}>
        {/* Documento de Identidad */}
        <div className="row mb-3">
          <div className="col-4">
            <label htmlFor="tipo_documento" className="form-label">Tipo Doc.</label>
            <select
              className="form-select"
              id="tipo_documento"
              name="tipo_documento"
              value={formData.tipo_documento}
              onChange={handleChange}
              required
            >
              <option value="CC">C.C.</option>
              <option value="CE">C.E.</option>
              <option value="TI">T.I.</option>
              <option value="PEP">PEP</option>
            </select>
          </div>
          <div className="col-8">
            <label htmlFor="numero_documento" className="form-label">N° Documento</label>
            <input
              type="text"
              className="form-control"
              id="numero_documento"
              name="numero_documento"
              placeholder="Ej: 1012345678"
              value={formData.numero_documento}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Nombres y Apellidos */}
        <div className="mb-3">
          <label htmlFor="primer_nombre" className="form-label">Primer Nombre</label>
          <input
            type="text"
            className="form-control"
            id="primer_nombre"
            name="primer_nombre"
            placeholder="Ingrese su primer nombre"
            value={formData.primer_nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="primer_apellido" className="form-label">Primer Apellido</label>
          <input
            type="text"
            className="form-control"
            id="primer_apellido"
            name="primer_apellido"
            placeholder="Ingrese su primer apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
            required
          />
        </div>

        {/* Correo Electrónico */}
        <div className="mb-3">
          <label htmlFor="correo" className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            id="correo"
            name="correo"
            placeholder="ejemplo@gmail.com"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>

        {/* Rol Restringido únicamente a Acudiente (4) y Docente (3) */}
        <div className="mb-3">
          <label htmlFor="id_cargo" className="form-label">Rol</label>
          <select
            className="form-select"
            id="id_cargo"
            name="id_cargo"
            value={formData.id_cargo}
            onChange={handleChange}
            required
          >
            <option value="4">Acudiente</option>
            <option value="3">Docente</option>
          </select>
        </div>

        {/* Contraseña */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Ingrese su contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="form-text">
            Entre 8 y 20 caracteres, letras y números, sin espacios ni caracteres especiales.
          </div>
        </div>

        <div className="mb-3">
          <button type="submit" className="btn btn-success w-100">Registrarse</button>
        </div>

        {registrado && (
          <div className="alert alert-success" role="alert">
            ¡Registro exitoso! Redirigiendo al inicio de sesión...
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default Registro;