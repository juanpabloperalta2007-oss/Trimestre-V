import React, { useState } from "react";
import '../../styles/NuevaContrasena.css';
import { useNavigate } from "react-router-dom";

function Nueva_contrasena (){

    const navigate = useNavigate();

    const [codigo, setCodigo] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");

    const cambiarContrasena = () => {

    if (codigo !== "123456") {
        setTipoMensaje("error");
        setMensaje("Código de verificación incorrecto.");
        return;
    }

    if (contrasena.trim() === "" || confirmarContrasena.trim() === "") {
        setTipoMensaje("error");
        setMensaje("Debe completar todos los campos.");
        return;
    }


    if (contrasena !== confirmarContrasena) {
        setTipoMensaje("error");
        setMensaje("Las contraseñas no coinciden.");
        return;
    }

    setTipoMensaje("success");
    setMensaje("La contraseña fue cambiada correctamente.");

    setTimeout(() => {
    navigate("/Login");
    }, 2000);
    };

    return (

        <div className="contenedor-form">
        <h1>Liceo Antonio De Toledo</h1>
        <h2>Recuperacion de Contraseña</h2>
        <hr/>

        <form>

            <label>Código de verificación</label>
            <input type="text" className="form-control" maxLength={6} value={codigo} onChange={(e) => setCodigo(e.target.value)}/>

            <div className="mb-3">
                <label htmlFor="contrasena" className="form-label">Ingrese su nueva contraseña</label>
                <input type="password" className="form-control" id="contrasena" name="contrasena" placeholder="Ingrese su contraseña" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                <div className="form-text">Entre 8 y 20 caracteres, letras y números, sin espacios ni caracteres especiales.</div>
            </div>

            <div className="mb-3">
                <label htmlFor="contrasena" className="form-label">confirme la constraseña</label>
                <input type="password" className="form-control" id="confirmarcontrasena" placeholder="Ingrese su contraseña" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} onPaste={(e) => e.preventDefault()}/>
            </div>

            <button
                type="button" className="btn btn-primary" onClick={cambiarContrasena}>Continuar
            </button>

            {/*<!--alerta por si el codigo es incorrecto java-->*/}

            
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

    )


}

export default Nueva_contrasena;