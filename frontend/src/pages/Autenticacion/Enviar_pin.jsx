import React, { useState } from "react";
import '../../styles/EnviarPin.css';
import { useNavigate } from "react-router-dom";


function Enviar_pin (){

    const navigate = useNavigate();

    const [correo, setCorreo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");

    const enviarPin = () => {
        console.log("La función se ejecutó");

    if (correo.trim() === "") {
        setTipoMensaje("error");
        setMensaje("Debe ingresar un correo electrónico.");
        return;
    }

    // Simulación

    if (correo === "admin@liceo.com") {
        setTipoMensaje("success");
        setMensaje("Verifique su correo para el código asignado para la restauración de la contraseña.");

         setTimeout(() => {
        navigate("/Nueva_contraseña");
        }, 2000);

    } else {
        setTipoMensaje("error");
        setMensaje("El correo no está registrado en la plataforma.");
    }

};

    return (

        <div className="contenedor-form">
            <h1>Liceo Antonio De Toledo</h1>
            <h2>Recuperacion de Contraseña</h2>
            <hr/>

            <form onSubmit={(e) => {
                 e.preventDefault();
                 enviarPin();
    }}>
            
                <div className="mb-3">
                    <label htmlFor="correo" className="form-label"> Ingrese su Correo electrónico</label>
                    <input type="email" className="form-control" id="correo" name="correo" placeholder="ejemplo@gmail.com" required value={correo} onChange={(e) => setCorreo (e.target.value)}/>
                </div>

               <button type="submit" className="btn btn-primary">
                     Continuar
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


    )
}

export default Enviar_pin;