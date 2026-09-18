import React from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import SidebarDocen from "./SidebarDocen";
import SidebarCoord from "./SidebarCoord";

function Layout({ titulo, children }) {

    // ==========================================
    // OBTENER USUARIO
    // ==========================================

    const usuarioGuardado = localStorage.getItem("usuario");

    let usuario = null;

    try {

        if (usuarioGuardado) {
            usuario = JSON.parse(usuarioGuardado);
        }

    } catch (error) {

        console.error(
            "Error al leer usuario en Layout:",
            error
        );

        usuario = null;
    }

    // ==========================================
    // OBTENER CARGO
    // ==========================================

    const cargoUsuario = parseInt(
        usuario?.id_cargo,
        10
    );

    console.log(
        "LAYOUT - Cargo del usuario:",
        cargoUsuario
    );

    // ==========================================
    // SELECCIONAR SIDEBAR
    // ==========================================

    let SidebarActual;

    if (cargoUsuario === 2) {

        // COORDINADOR
        SidebarActual = SidebarCoord;

    } else if (cargoUsuario === 3) {

        // DOCENTE
        SidebarActual = SidebarDocen;

    } else {

        // OTROS ROLES
        SidebarActual = Sidebar;
    }

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="bg-light min-vh-100">

            {/* HEADER ORIGINAL DEL INICIO */}
            <Header />

            <div className="container-fluid">

                <div className="row">

                    {/* SIDEBAR SEGÚN EL ROL */}
                    <SidebarActual />

                    {/* CONTENIDO */}
                    <div className="col-md-9 col-lg-10 p-4">

                        <h2 className="fw-bold mb-4">
                            {titulo}
                        </h2>

                        {children}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Layout;