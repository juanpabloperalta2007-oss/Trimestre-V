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

    // ==========================================
    // USUARIO RECIBIDO
    // ==========================================
    const usuario = location.state || {};

    const [login, setLogin] = useState(
        usuario.login || ""
    );

    const [estado, setEstado] = useState(
        usuario.estado || "Activo"
    );

    const [idCargo, setIdCargo] = useState(
        usuario.id_cargo || 3
    );

    const [cargando, setCargando] = useState(false);


    // ==========================================
    // CARGAR DATOS DEL USUARIO
    // ==========================================
    useEffect(() => {

        setLogin(usuario.login || "");

        setEstado(
            usuario.estado || "Activo"
        );

        setIdCargo(
            usuario.id_cargo || 3
        );

    }, [usuario.login, usuario.estado, usuario.id_cargo]);


    // ==========================================
    // GUARDAR CAMBIOS
    // ==========================================
    const guardarCambios = async () => {

        const id = usuario.id_usuario || usuario.id;

        // ------------------------------------------
        // VALIDAR ID
        // ------------------------------------------
        if (!id) {

            alert("No se encontró el ID del usuario.");

            return;
        }


        // ------------------------------------------
        // VALIDAR LOGIN
        // ------------------------------------------
        if (!login.trim()) {

            alert("El correo/login es obligatorio.");

            return;
        }


        // ------------------------------------------
        // VALIDAR CARGO
        // ------------------------------------------
        if (!idCargo) {

            alert("Debe seleccionar un cargo.");

            return;
        }


        try {

            setCargando(true);


            // ======================================
            // DATOS A ENVIAR
            // ======================================
            const usuarioActualizado = {

                login: login.trim(),

                estado: estado,

                id_cargo: parseInt(idCargo, 10)

            };


            console.log(
                "Enviando actualización:",
                usuarioActualizado
            );


            // ======================================
            // ACTUALIZAR
            // ======================================
            const respuesta = await actualizarUsuario(
                id,
                usuarioActualizado
            );


            console.log(
                "Respuesta del servidor:",
                respuesta
            );


            alert(
                "Usuario actualizado correctamente."
            );


            // ======================================
            // VOLVER AL ADMINISTRADOR
            // ======================================
            navigate("/vista_admin");


        } catch (error) {

            console.error(
                "================================"
            );

            console.error(
                "ERROR AL ACTUALIZAR USUARIO"
            );

            console.error(
                error.response?.data || error
            );

            console.error(
                "================================"
            );


            const mensaje =
                error.response?.data?.error ||
                error.message ||
                "Error en la base de datos.";


            alert(
                `Ocurrió un error al guardar: ${mensaje}`
            );


        } finally {

            setCargando(false);

        }
    };


    // ==========================================
    // INTERFAZ
    // ==========================================
    return (
        <>
            <Header />

            <div
                className="d-flex"
                style={{ minHeight: "80vh" }}
            >

                <SidebarAdmin />

                <div
                    className="container p-4"
                    style={{ flex: 1 }}
                >

                    <div
                        className="card shadow-sm p-4 bg-white rounded"
                    >

                        {/* ==================================
                            ENCABEZADO
                        ================================== */}

                        <div
                            className="d-flex justify-content-between align-items-center mb-3"
                        >

                            <div>

                                <h2>
                                    Editar Usuario
                                </h2>

                                <p className="text-muted">
                                    Modifique la información del usuario.
                                </p>

                            </div>

                            <i className="bi bi-person-circle fs-1 text-primary"></i>

                        </div>


                        <hr />


                        {/* ==================================
                            FORMULARIO
                        ================================== */}

                        <div className="row g-3">


                            {/* CORREO */}

                            <div className="col-md-6">

                                <label className="form-label fw-bold">
                                    Correo / Login
                                </label>

                                <input
                                    type="email"
                                    className="form-control"
                                    value={login}
                                    onChange={(e) =>
                                        setLogin(e.target.value)
                                    }
                                    disabled={cargando}
                                />

                            </div>


                            {/* CARGO */}

                            <div className="col-md-6">

                                <label className="form-label fw-bold">
                                    Cargo
                                </label>

                                <select
                                    className="form-select"
                                    value={idCargo}
                                    onChange={(e) =>
                                        setIdCargo(e.target.value)
                                    }
                                    disabled={cargando}
                                >

                                    <option value="1">
                                        Administrador
                                    </option>

                                    <option value="2">
                                        Coordinador
                                    </option>

                                    <option value="3">
                                        Docente
                                    </option>

                                    <option value="4">
                                        Acudiente
                                    </option>

                                </select>

                            </div>


                            {/* ESTADO */}

                            <div className="col-md-6">

                                <label className="form-label fw-bold">
                                    Estado
                                </label>

                                <select
                                    className="form-select"
                                    value={estado}
                                    onChange={(e) =>
                                        setEstado(e.target.value)
                                    }
                                    disabled={cargando}
                                >

                                    <option value="Activo">
                                        Activo
                                    </option>

                                    <option value="Inactivo">
                                        Inactivo
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* ==================================
                            BOTONES
                        ================================== */}

                        <div
                            className="d-flex justify-content-end gap-2 mt-4"
                        >

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    navigate("/vista_admin")
                                }
                                disabled={cargando}
                            >
                                Cancelar
                            </button>


                            <button
                                className="btn btn-primary"
                                onClick={guardarCambios}
                                disabled={cargando}
                            >

                                {cargando
                                    ? "Guardando..."
                                    : "Guardar Cambios"
                                }

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