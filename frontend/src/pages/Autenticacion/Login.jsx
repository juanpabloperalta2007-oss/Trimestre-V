import React, { useState } from "react";
import {
    useNavigate,
    Link
} from "react-router-dom";

import axios from "axios";

import { useAuth } from "../../context/AuthContext";

function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [cargando, setCargando] = useState(false);

    // ==========================================
    // INICIAR SESIÓN
    // ==========================================

    const manejarSubmit = async (e) => {

        e.preventDefault();

        setError("");

        // ==========================================
        // VALIDAR CONTRASEÑA
        // ==========================================

        if (
            password.length < 8 ||
            password.length > 20
        ) {

            setError(
                "La contraseña debe tener entre 8 y 20 caracteres."
            );

            return;
        }

        setCargando(true);

        try {

            // ==========================================
            // PETICIÓN AL BACKEND
            // ==========================================

            const respuesta = await axios.post(
                "http://localhost:5000/api/usuarios/login",
                {
                    correo: correo.trim(),
                    password: password
                }
            );

            console.log(
                "RESPUESTA COMPLETA LOGIN:",
                respuesta.data
            );

            const usuario =
                respuesta.data.usuario;

            // ==========================================
            // VALIDAR USUARIO
            // ==========================================

            if (!usuario) {

                setError(
                    "El servidor no devolvió los datos del usuario."
                );

                return;
            }

            console.log(
                "USUARIO RECIBIDO:",
                usuario
            );

            console.log(
                "ID CARGO:",
                usuario.id_cargo
            );

            console.log(
                "CARGO:",
                usuario.cargo
            );

            // ==========================================
            // GUARDAR SESIÓN
            // ==========================================

            login(usuario);

            // ==========================================
            // OBTENER CARGO
            // ==========================================

            const cargo =
                parseInt(
                    usuario.id_cargo,
                    10
                );

            console.log(
                "CARGO CONVERTIDO:",
                cargo
            );

            // ==========================================
            // REDIRECCIÓN
            // ==========================================

            switch (cargo) {

                case 1:

                    console.log(
                        "REDIRIGIENDO ADMINISTRADOR"
                    );

                    navigate(
                        "/vista_admin",
                        { replace: true }
                    );

                    break;


                case 2:

                    console.log(
                        "REDIRIGIENDO COORDINADOR"
                    );

                    navigate(
                        "/coordinador",
                        { replace: true }
                    );

                    break;


                case 3:

                    console.log(
                        "REDIRIGIENDO DOCENTE"
                    );

                    navigate(
                        "/inicio",
                        { replace: true }
                    );

                    break;


                case 4:

                    console.log(
                        "REDIRIGIENDO ACUDIENTE"
                    );

                    navigate(
                        "/acudiente",
                        { replace: true }
                    );

                    break;


                default:

                    console.error(
                        "CARGO NO CONFIGURADO:",
                        cargo
                    );

                    setError(
                        "El rol asignado no cuenta con una vista configurada."
                    );

                    break;
            }

        } catch (err) {

            console.error(
                "ERROR EN LOGIN:",
                err
            );

            if (
                err.response &&
                err.response.data &&
                err.response.data.error
            ) {

                setError(
                    err.response.data.error
                );

            } else {

                setError(
                    "No se pudo conectar con el servidor."
                );
            }

        } finally {

            setCargando(false);

        }
    };

    return (

        <div className="container d-flex justify-content-center align-items-center vh-100">

            <div
                className="card p-4 shadow-sm"
                style={{
                    maxWidth: "400px",
                    width: "100%",
                    backgroundColor: "#ffffff"
                }}
            >

                {/* ==================================
                    ENCABEZADO
                ================================== */}

                <div className="text-center mb-3">

                    <h3
                        className="fw-bold"
                        style={{
                            color: "#000000"
                        }}
                    >
                        Liceo Antonio De Toledo
                    </h3>

                    <p className="text-muted small">
                        INICIO DE SESIÓN
                    </p>

                </div>


                {/* ==================================
                    FORMULARIO
                ================================== */}

                <form onSubmit={manejarSubmit}>

                    {/* CORREO */}

                    <div className="mb-3 text-start">

                        <label
                            className="form-label fw-bold small"
                            style={{
                                color: "#333333"
                            }}
                        >
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            value={correo}
                            onChange={(e) =>
                                setCorreo(e.target.value)
                            }
                            placeholder="ejemplo@gmail.com"
                            required
                        />

                    </div>


                    {/* CONTRASEÑA */}

                    <div className="mb-3 text-start">

                        <label
                            className="form-label fw-bold small"
                            style={{
                                color: "#333333"
                            }}
                        >
                            Contraseña
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            minLength={8}
                            maxLength={20}
                            required
                        />

                        <small className="form-text text-muted">
                            Entre 8 y 20 caracteres.
                        </small>

                    </div>


                    {/* BOTÓN */}

                    <button
                        type="submit"
                        className="btn btn-success w-100 fw-bold my-2"
                        disabled={cargando}
                        style={{
                            backgroundColor: "#198754",
                            borderColor: "#198754",
                            color: "#ffffff"
                        }}
                    >
                        {cargando
                            ? "Cargando..."
                            : "Iniciar Sesión"
                        }
                    </button>


                    {/* ERROR */}

                    {error && (

                        <div
                            className="alert alert-danger mt-3 p-2 text-center small"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}

                </form>


                {/* ==================================
                    ENLACES
                ================================== */}

                <div className="text-center mt-3">

                    <Link
                        to="/enviar_pin"
                        className="small d-block mb-3"
                        style={{
                            color: "#0d6efd",
                            textDecoration: "none"
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>


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