import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/EnviarPin.css";

function NuevaContrasena() {
    const location = useLocation();
    const navigate = useNavigate();

    // Recupera el correo transferido desde Enviar_pin
    const correoInicial = location.state?.correo || "";

    const [correo, setCorreo] = useState(correoInicial);
    const [pin, setPin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    const cambiarPassword = async (e) => {
        if (e) e.preventDefault();
        setMensaje("");

        if (!correo.trim()) {
            setTipoMensaje("error");
            setMensaje("Debe proporcionar un correo válido.");
            return;
        }

        if (!pin.trim()) {
            setTipoMensaje("error");
            setMensaje("Debe ingresar el PIN enviado a su correo.");
            return;
        }

        if (password !== confirmarPassword) {
            setTipoMensaje("error");
            setMensaje("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 8 || password.length > 20) {
            setTipoMensaje("error");
            setMensaje("La contraseña debe tener entre 8 y 20 caracteres.");
            return;
        }

        setCargando(true);

        try {
            const respuesta = await fetch("http://localhost:5000/api/usuarios/cambiar-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, pin, password }),
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setTipoMensaje("success");
                setMensaje("Contraseña actualizada exitosamente. Redirigiendo al inicio de sesión...");

                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setTipoMensaje("error");
                setMensaje(data.error || "El PIN es incorrecto o ha expirado.");
            }
        } catch (error) {
            console.error("Error al actualizar contraseña:", error);
            setTipoMensaje("error");
            setMensaje("Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="contenedor-form">
            <h1>Liceo Antonio De Toledo</h1>
            <h2>Restablecer Contraseña</h2>
            <hr />

            <form onSubmit={cambiarPassword}>
                {!correoInicial && (
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="ejemplo@gmail.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">PIN de Verificación</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ingrese el PIN de 6 dígitos"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Repita la contraseña"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar Contraseña"}
                </button>

                {mensaje && (
                    <div className={`alert ${tipoMensaje === "success" ? "alert-success" : "alert-danger"} mt-3`}>
                        {mensaje}
                    </div>
                )}
            </form>
        </div>
    );
}

export default NuevaContrasena;