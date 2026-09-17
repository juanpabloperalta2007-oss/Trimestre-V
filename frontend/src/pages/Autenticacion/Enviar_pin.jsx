import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/EnviarPin.css";

function Enviar_pin() {
    const navigate = useNavigate();

    const [correo, setCorreo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    const enviarPin = async (e) => {
        // Detiene la recarga por defecto del navegador
        if (e) e.preventDefault();

        setMensaje("");

        if (correo.trim() === "") {
            setTipoMensaje("error");
            setMensaje("Debe ingresar un correo electrónico.");
            return;
        }

        setCargando(true);

        try {
            const respuesta = await fetch("http://localhost:5000/api/usuarios/recuperar-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ correo }),
            });

            const data = await respuesta.json();

            if (respuesta.ok) {
                setTipoMensaje("success");
                setMensaje("Verifique su correo. Redirigiendo para cambiar la contraseña...");

                // Navegación limpia sin reiniciar el Router
                setTimeout(() => {
                    navigate("/nueva_contrasena", { state: { correo } });
                }, 1500);
            } else {
                setTipoMensaje("error");
                setMensaje(data.error || "El correo no está registrado en la plataforma.");
            }
        } catch (error) {
            console.error("Error al consultar el correo:", error);
            setTipoMensaje("error");
            setMensaje("Error al conectar con el servidor. Intente más tarde.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="contenedor-form">
            <h1>Liceo Antonio De Toledo</h1>
            <h2>Recuperación de Contraseña</h2>
            <hr />

            <form onSubmit={enviarPin}>
                <div className="mb-3">
                    <label htmlFor="correo" className="form-label">
                        Ingrese su Correo electrónico
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="correo"
                        name="correo"
                        placeholder="ejemplo@gmail.com"
                        required
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={cargando}>
                    {cargando ? "Verificando..." : "Continuar"}
                </button>

                {mensaje && (
                    <div
                        className={`alert ${
                            tipoMensaje === "success"
                                ? "alert-success"
                                : "alert-danger"
                        } mt-3`}
                    >
                        {mensaje}
                    </div>
                )}
            </form>
        </div>
    );
}

export default Enviar_pin;