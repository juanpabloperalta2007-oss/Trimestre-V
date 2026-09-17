import React from "react";
import { Navigate } from "react-router-dom";


function obtenerUsuarioSesion() {

    const usuarioRaw =
        localStorage.getItem("usuario");

    if (
        !usuarioRaw ||
        usuarioRaw === "undefined" ||
        usuarioRaw === "null"
    ) {
        return null;
    }

    try {

        return JSON.parse(usuarioRaw);

    } catch (error) {

        console.error(
            "Error leyendo usuario:",
            error
        );

        localStorage.removeItem("usuario");

        return null;
    }
}


function obtenerCargoUsuario(usuario) {

    if (!usuario) {
        return null;
    }


    if (
        usuario.id_cargo !== undefined
    ) {

        return parseInt(
            usuario.id_cargo,
            10
        );
    }


    if (
        usuario.usuario &&
        usuario.usuario.id_cargo !== undefined
    ) {

        return parseInt(
            usuario.usuario.id_cargo,
            10
        );
    }


    if (
        usuario.cargo !== undefined &&
        typeof usuario.cargo !== "object"
    ) {

        return parseInt(
            usuario.cargo,
            10
        );
    }


    if (
        usuario.cargo &&
        typeof usuario.cargo === "object" &&
        usuario.cargo.id_cargo !== undefined
    ) {

        return parseInt(
            usuario.cargo.id_cargo,
            10
        );
    }


    return null;
}


function RutaProtegida({
    children,
    cargoPermitido
}) {

    const usuario =
        obtenerUsuarioSesion();


    if (!usuario) {

        console.log(
            "No existe usuario en sesión."
        );

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    const cargoUsuario =
        obtenerCargoUsuario(usuario);


    console.log(
        "Usuario:",
        usuario
    );

    console.log(
        "Cargo:",
        cargoUsuario,
        "Requerido:",
        cargoPermitido
    );


    if (
        cargoPermitido !== undefined
    ) {

        if (
            cargoUsuario === null ||
            Number.isNaN(cargoUsuario)
        ) {

            console.error(
                "No se encontró un cargo válido."
            );

            return (
                <Navigate
                    to="/"
                    replace
                />
            );
        }


        if (
            cargoUsuario !==
            Number(cargoPermitido)
        ) {

            console.error(
                "Cargo no autorizado."
            );

            return (
                <Navigate
                    to="/"
                    replace
                />
            );
        }
    }


    return children;
}


export default RutaProtegida;