import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SidebarAdmin from "../../components/SidebarAdmin";
import "../../styles/GestionUsuario.css";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { actualizarUsuario } from "../../services/api";

function EditarUsuario() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos la información del usuario enviada por el estado de la navegación
    const usuario = location.state || {};

    const [login, setLogin] = useState(usuario.login || "");
    const [estado, setEstado] = useState(usuario.estado || "Activo");
    const [idCargo, setIdCargo] = useState(usuario.id_cargo || 3); 
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (usuario) {
            setLogin(usuario.login || "");
            setEstado(usuario.estado || "Activo");
            setIdCargo(usuario.id_cargo || 3);
        }
    }, [usuario]);

    const guardarCambios = async () => {
        const id = usuario.id_usuario || usuario.id;
        
        if (!id) {
            alert("No se encontró el ID del usuario.");
            return;
        }

        try {
            setCargando(true);

            // Armamos el objeto enviando id_cargo convertido a entero
            const usuarioActualizado = {
                login: login,
                estado: estado,
                id_cargo: parseInt(idCargo, 10)
            };

            // Mantenemos password_hash si venía en el estado del usuario
            if (usuario.password_hash) {
                usuarioActualizado.password_hash = usuario.password_hash;
            }

            await actualizarUsuario(id, usuarioActualizado);
            alert("Usuario actualizado correctamente");
            navigate("/vista_admin");
        } catch (error) {
            console.error("Detalle del error en frontend:", error.response?.data || error.message);
            alert(`Ocurrió un error al guardar: ${error.response?.data?.error || "Error en la base de datos"}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Header />

            <div className="d-flex" style={{ minHeight: "80vh" }}>
                <SidebarAdmin /> 

                <div className="container p-4" style={{ flex: 1 }}>
                    <div className="card shadow-sm p-4 bg-white rounded">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h2>Editar Usuario</h2>
                                <p className="text-muted">Modifique la información del usuario.</p>
                            </div>
                            <i className="bi bi-person-circle fs-1 text-primary"></i>
                        </div>

                        <hr />

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Correo / Login</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    value={login} 
                                    onChange={(e) => setLogin(e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold">Cargo</label>
                                <select 
                                    className="form-select" 
                                    value={idCargo} 
                                    onChange={(e) => setIdCargo(e.target.value)}
                                >
                                    <option value="1">Administrador</option>
                                    <option value="2">Coordinador</option>
                                    <option value="3">Profesor</option>
                                    <option value="4">Acudiente</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold">Estado</label>
                                <select 
                                    className="form-select" 
                                    value={estado} 
                                    onChange={(e) => setEstado(e.target.value)}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button 
                                className="btn btn-outline-secondary" 
                                onClick={() => navigate("/vista_admin")}
                            >
                                Cancelar
                            </button>

                            <button 
                                className="btn btn-primary" 
                                onClick={guardarCambios}
                                disabled={cargando}
                            >
                                {cargando ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default EditarUsuario;