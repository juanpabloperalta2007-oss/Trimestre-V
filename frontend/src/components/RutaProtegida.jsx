import React from "react";
import { Navigate } from "react-router-dom";

function RutaProtegida({ children, cargoPermitido }) {

    const usuarioRaw = localStorage.getItem("usuario");

    console.log("=================================");
    console.log("RUTA PROTEGIDA");
    console.log("Usuario guardado:", usuarioRaw);
    console.log("Cargo requerido:", cargoPermitido);
    console.log("=================================");

    // ==========================================
    // NO HAY USUARIO
    // ==========================================

    if (
        !usuarioRaw ||
        usuarioRaw === "undefined" ||
        usuarioRaw === "null"
    ) {
        console.error("NO EXISTE USUARIO EN LOCALSTORAGE");

        return <Navigate to="/" replace />;
    }

    // ==========================================
    // CONVERTIR USUARIO
    // ==========================================

    let usuario;

    try {

        usuario = JSON.parse(usuarioRaw);

    } catch (error) {

        console.error(
            "ERROR AL CONVERTIR EL USUARIO:",
            error
        );

        localStorage.removeItem("usuario");

        return <Navigate to="/" replace />;
    }

    console.log("Usuario convertido:", usuario);

    // ==========================================
    // OBTENER CARGO
    // ==========================================

    const cargoUsuario = parseInt(
        usuario?.id_cargo,
        10
    );

    console.log(
        "Cargo del usuario:",
        cargoUsuario
    );

    console.log(
        "Cargo requerido:",
        cargoPermitido
    );

    // ==========================================
    // VALIDAR CARGO
    // ==========================================

    if (
        cargoPermitido !== undefined &&
        cargoUsuario !== cargoPermitido
    ) {

        console.error(
            "================================="
        );

        console.error(
            "ACCESO DENEGADO"
        );

        console.error(
            "Cargo usuario:",
            cargoUsuario
        );

        console.error(
            "Cargo requerido:",
            cargoPermitido
        );

        console.error(
            "================================="
        );

        return <Navigate to="/" replace />;
    }

    // ==========================================
    // ACCESO PERMITIDO
    // ==========================================

    console.log(
        "ACCESO PERMITIDO"
    );

    return children;
}

export default RutaProtegida;