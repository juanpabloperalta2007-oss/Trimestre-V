import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Login.css";

function Login() {

    const [correo, setCorreo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");

    const navigate = useNavigate();

    const iniciarSesion = (e) => {

        e.preventDefault();

        if (correo.trim() === "" || contrasena.trim() === "") {

            setMensaje("Debe completar todos los campos.");
            return;

        }

        let rol = "";

        // Detectar el rol según el correo
        if (correo.toLowerCase().includes("admin")) {

            rol = "admin";

        } else if (correo.toLowerCase().includes("docente")) {

            rol = "docente";

        } else if (correo.toLowerCase().includes("coordinador")) {

            rol = "coordinador";

        } else if (correo.toLowerCase().includes("acudiente")) {

            rol = "acudiente";

        } else {

            setMensaje("El correo no pertenece a ningún usuario autorizado.");
            return;

        }

        // Guardar datos del usuario
        localStorage.setItem("correo", correo);
        localStorage.setItem("rol", rol);

        setMensaje("Inicio de sesión exitoso.");

        setTimeout(() => {

            switch (rol) {

                case "admin":
                    navigate("/vista_admin");
                    break;

                case "docente":
                    navigate("/inicio");
                    break;

                case "coordinador":
                    navigate("/coordinador");
                    break;

                case "acudiente":
                    navigate("/acudiente");
                    break;

                default:
                    navigate("/");
                    break;
            }

        }, 1000);

    };

    return (

        <div className="contenedor-form">

            <h1>Liceo Antonio De Toledo</h1>

            <h2>Inicio de sesión</h2>

            <hr />

            <form onSubmit={iniciarSesion}>

                <div className="mb-3">

                    <label htmlFor="correo" className="form-label">
                        Correo electrónico
                    </label>

                    <input
                        type="email"
                        className="form-control"
                        id="correo"
                        placeholder="ejemplo@gmail.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                    />

                </div>

                <div className="mb-3">

                    <label htmlFor="contrasena" className="form-label">
                        Contraseña
                    </label>

                    <input
                        type="password"
                        className="form-control"
                        id="contrasena"
                        placeholder="Ingrese su contraseña"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />

                    <div className="form-text">
                        Entre 8 y 20 caracteres.
                    </div>

                </div>

                <button className="btn-login" type="submit">
                    Iniciar Sesión
                </button>

            </form>

            {mensaje && (

                <div className="alert alert-info mt-3">
                    {mensaje}
                </div>

            )}

            <p className="text-center mt-4">

                <Link to="/enviar_pin" className="link-recuperar">
                    ¿Olvidaste tu contraseña?
                </Link>

            </p>

            <div className="mt-3">

                <Link
                    to="/registro"
                    className="btn btn-outline-primary w-100 py-2 fw-bold shadow-sm text-center d-block text-decoration-none"
                    style={{
                        color: "#007bff",
                        borderColor: "#007bff",
                        background: "transparent"
                    }}
                >
                    Registrarse
                </Link>

            </div>

        </div>

    );

}

export default Login;