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

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  // ======================================================
  // REGLAS DE VALIDACIÓN EN CLIENTE
  // ======================================================
  const validarCampo = (nombre, valor) => {
    let mensajeError = "";

    switch (nombre) {
      case "primer_nombre":
        if (!valor.trim()) {
          mensajeError = "Por favor complete todos los campos obligatorios (*).";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          mensajeError = "El primer nombre solo puede contener letras.";
        }
        break;

      case "primer_apellido":
        if (!valor.trim()) {
          mensajeError = "Por favor complete todos los campos obligatorios (*).";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          mensajeError = "El primer apellido solo puede contener letras.";
        }
        break;

      case "segundo_nombre":
        if (valor && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          mensajeError = "El segundo nombre solo puede contener letras.";
        }
        break;

      case "segundo_apellido":
        if (valor && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor)) {
          mensajeError = "El segundo apellido solo puede contener letras.";
        }
        break;

      case "numero_documento":
        if (!valor.trim()) {
          mensajeError = "Por favor complete todos los campos obligatorios (*).";
        } else if (!/^\d+$/.test(valor)) {
          mensajeError = "El número de documento debe contener solo dígitos.";
        } else if (valor.length < 6 || valor.length > 15) {
          mensajeError = "El número de documento debe tener entre 6 y 15 dígitos.";
        }
        break;

      case "telefono":
        if (valor) {
          if (!/^\d+$/.test(valor)) {
            mensajeError = "El teléfono debe contener únicamente números.";
          } else if (valor.length < 7 || valor.length > 10) {
            mensajeError = "El teléfono debe tener entre 7 y 10 dígitos.";
          }
        }
        break;

      case "correo":
        if (!valor.trim()) {
          mensajeError = "Por favor complete todos los campos obligatorios (*).";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
          mensajeError = "Ingrese un correo electrónico válido.";
        }
        break;

      case "password":
        if (!valor) {
          mensajeError = "Por favor complete todos los campos obligatorios (*).";
        } else if (valor.length < 8 || valor.length > 20) {
          mensajeError = "La contraseña debe tener entre 8 y 20 caracteres.";
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(valor)) {
          mensajeError = "La contraseña debe contener letras y números, sin espacios ni caracteres especiales.";
        }
        break;

      default:
        break;
    }

    return mensajeError;
  };

  // MANEJO DE CAMBIOS E INSPECCIÓN EN TIEMPO REAL
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Validar el campo modificado
    const errorDetectado = validarCampo(name, value);
    setErrores((prevErrores) => ({
      ...prevErrores,
      [name]: errorDetectado
    }));
  };

  // VALIDACIÓN GENERAL ANTES DE ENVIAR
  const validarFormularioCompleto = () => {
    const nuevosErrores = {};

    Object.keys(formData).forEach((campo) => {
      const error = validarCampo(campo, formData[campo]);
      if (error) {
        nuevosErrores[campo] = error;
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor("");

    if (!validarFormularioCompleto()) {
      return;
    }

    setCargando(true);

    try {
      await axios.post("http://localhost:5000/api/usuarios/registro-admin", formData);
      alert("¡Usuario registrado con éxito!");
      navigate("/vista_admin");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorServidor(err.response.data.error);
      } else {
        setErrorServidor("Error al conectar con el servidor.");
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
            <p className="text-muted small mb-4">
              Ingrese los datos para dar de alta a un Coordinador, Docente o Administrador.
            </p>

            {errorServidor && (
              <div className="alert alert-danger p-2 small text-center fw-bold">
                {errorServidor}
              </div>
            )}

            <form onSubmit={manejarSubmit} noValidate>
              <div className="row g-3">
                {/* PRIMER NOMBRE */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Primer Nombre *</label>
                  <input
                    type="text"
                    name="primer_nombre"
                    className={`form-control ${errores.primer_nombre ? "is-invalid" : ""}`}
                    value={formData.primer_nombre}
                    onChange={manejarCambio}
                    required
                  />
                  {errores.primer_nombre && <div className="invalid-feedback small">{errores.primer_nombre}</div>}
                </div>

                {/* SEGUNDO NOMBRE */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Segundo Nombre</label>
                  <input
                    type="text"
                    name="segundo_nombre"
                    className={`form-control ${errores.segundo_nombre ? "is-invalid" : ""}`}
                    value={formData.segundo_nombre}
                    onChange={manejarCambio}
                  />
                  {errores.segundo_nombre && <div className="invalid-feedback small">{errores.segundo_nombre}</div>}
                </div>

                {/* PRIMER APELLIDO */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Primer Apellido *</label>
                  <input
                    type="text"
                    name="primer_apellido"
                    className={`form-control ${errores.primer_apellido ? "is-invalid" : ""}`}
                    value={formData.primer_apellido}
                    onChange={manejarCambio}
                    required
                  />
                  {errores.primer_apellido && <div className="invalid-feedback small">{errores.primer_apellido}</div>}
                </div>

                {/* SEGUNDO APELLIDO */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Segundo Apellido</label>
                  <input
                    type="text"
                    name="segundo_apellido"
                    className={`form-control ${errores.segundo_apellido ? "is-invalid" : ""}`}
                    value={formData.segundo_apellido}
                    onChange={manejarCambio}
                  />
                  {errores.segundo_apellido && <div className="invalid-feedback small">{errores.segundo_apellido}</div>}
                </div>

                {/* TIPO DOCUMENTO */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Tipo Documento *</label>
                  <select
                    name="tipo_documento"
                    className="form-select"
                    value={formData.tipo_documento}
                    onChange={manejarCambio}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                {/* NÚMERO DOCUMENTO */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Número Documento *</label>
                  <input
                    type="text"
                    name="numero_documento"
                    className={`form-control ${errores.numero_documento ? "is-invalid" : ""}`}
                    value={formData.numero_documento}
                    onChange={manejarCambio}
                    required
                  />
                  {errores.numero_documento && <div className="invalid-feedback small">{errores.numero_documento}</div>}
                </div>

                {/* TELÉFONO */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    className={`form-control ${errores.telefono ? "is-invalid" : ""}`}
                    value={formData.telefono}
                    onChange={manejarCambio}
                  />
                  {errores.telefono && <div className="invalid-feedback small">{errores.telefono}</div>}
                </div>

                {/* CORREO */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Correo / Login *</label>
                  <input
                    type="email"
                    name="correo"
                    className={`form-control ${errores.correo ? "is-invalid" : ""}`}
                    value={formData.correo}
                    onChange={manejarCambio}
                    required
                  />
                  {errores.correo && <div className="invalid-feedback small">{errores.correo}</div>}
                </div>

                {/* CONTRASEÑA */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${errores.password ? "is-invalid" : ""}`}
                    value={formData.password}
                    onChange={manejarCambio}
                    required
                  />
                  {errores.password && <div className="invalid-feedback small">{errores.password}</div>}
                </div>

                {/* CARGO / ROL */}
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Cargo / Rol a Asignar *</label>
                  <select
                    name="id_cargo"
                    className="form-select"
                    value={formData.id_cargo}
                    onChange={manejarCambio}
                  >
                    <option value={2}>Coordinador</option>
                    <option value={1}>Administrador</option>
                    <option value={3}>Docente</option>
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