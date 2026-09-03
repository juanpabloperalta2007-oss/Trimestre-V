import {Link} from 'react-router-dom'
import { useState } from "react";
import Login from './Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/registro.css";
import { useNavigate } from 'react-router-dom';


function Registro() {
    const navigate = useNavigate();
    const [registrado, setRegistrado] = useState(false);
    const manejarRegistro = (e) => {
        e.preventDefault();
        setRegistrado(true);

        setTimeout(() => {
        navigate("/Inicio");
    }, 2000);

    };
    return (
  <div className="contenedor-form">

        <h1>Liceo Antonio De Toledo</h1>
        <h2>Registrar Usuario</h2>
        <hr/>
        <form onSubmit={manejarRegistro}>
            <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre completo</label>
                <input type="text" className="form-control" id="nombre" name="nombre" placeholder="Ingrese su nombre completo" required/>
            </div>

            <div className="mb-3">
                <label htmlFor="correo" className="form-label">Correo electrónico</label>
                <input type="email" className="form-control" id="correo" name="correo" placeholder="ejemplo@gmail.com" required/>
            </div>

            <div className="mb-3">
                <label htmlFor="rol" className="form-label">Rol</label>
                <select className="form-select" id="rol" name="rol" required>
                    <option value="" disabled selected>Seleccione su rol</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="docente">Docente</option>
                    <option value="acudiente">Acudiente</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="contrasena" className="form-label">Contraseña</label>
                <input type="password" className="form-control" id="contrasena" name="contrasena" placeholder="Ingrese su contraseña" required/>
                <div className="form-text">Entre 8 y 20 caracteres, letras y números, sin espacios ni caracteres especiales.</div>
            </div>

            <div className="mb-3">
               <button type="submit" className="btn btn-success">Registrarse</button>
            </div>
            
            {registrado &&(
            <div className="alert alert-success" role="alert">
                Se ha registrado exitosamente!
            </div>
            )}
        </form>

    </div>
    )
}

export default Registro;