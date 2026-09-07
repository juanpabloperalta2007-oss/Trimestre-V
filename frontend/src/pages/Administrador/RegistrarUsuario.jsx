import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SidebarAdmin from "../../components/SidebarAdmin";

function RegistrarUsuario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    tipo_documento: "CC",
    numero_documento: "",
    telefono: "",
    correo: "",
    password: "",
    id_cargo: 2 // Por defecto Coordinador
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      await axios.post("http://localhost:5000/api/usuarios/registro-admin", formData);
      alert("¡Usuario registrado con éxito!");
      navigate("/vista_admin");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Error al conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Header />

      <div className="d-flex" style={{ backgroundColor: "#ffffff", minHeight: "calc(100vh - 120px)" }}>
        <SidebarAdmin />

        <div className="flex-grow-1 p-4">
          <div className="card p-4 border-0 shadow-sm mx-auto" style={{ maxWidth: "850px" }}>
            <h4 className="fw-bold mb-1" style={{ color: "#333333" }}>REGISTRAR NUEVO USUARIO</h4>
            <p className="text-muted small mb-4">Ingrese los datos para dar de alta a un Coordinador, Docente o Administrador.</p>

            {error && <div className="alert alert-danger p-2 small text-center fw-bold">{error}</div>}

            <form onSubmit={manejarSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Primer Nombre *</label>
                  <input type="text" name="primer_nombre" className="form-control" onChange={manejarCambio} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Segundo Nombre</label>
                  <input type="text" name="segundo_nombre" className="form-control" onChange={manejarCambio} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Primer Apellido *</label>
                  <input type="text" name="primer_apellido" className="form-control" onChange={manejarCambio} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Segundo Apellido</label>
                  <input type="text" name="segundo_apellido" className="form-control" onChange={manejarCambio} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Tipo Documento *</label>
                  <select name="tipo_documento" className="form-select" value={formData.tipo_documento} onChange={manejarCambio}>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Número Documento *</label>
                  <input type="text" name="numero_documento" className="form-control" onChange={manejarCambio} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Teléfono</label>
                  <input type="text" name="telefono" className="form-control" onChange={manejarCambio} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Correo / Login *</label>
                  <input type="email" name="correo" className="form-control" onChange={manejarCambio} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Contraseña *</label>
                  <input type="password" name="password" className="form-control" onChange={manejarCambio} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small">Cargo / Rol a Asignar *</label>
                  <select name="id_cargo" className="form-select" value={formData.id_cargo} onChange={manejarCambio}>
                    <option value={2}>Coordinador</option>
                    <option value={1}>Administrador</option>
                    <option value={3}>Docente</option>
                    <option value={4}>Acudiente</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-success w-100 fw-bold mt-4" disabled={cargando}>
                {cargando ? "Registrando..." : "Registrar Usuario"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default RegistrarUsuario;