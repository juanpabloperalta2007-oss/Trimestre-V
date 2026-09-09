import { Router } from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = Router();


// ======================================================
// 1. LOGIN
// ======================================================
router.post("/login", async (req, res) => {

    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({
            error: "Correo y contraseña son obligatorios."
        });
    }

    try {

        const sql = `
            SELECT
                u.id_usuario,
                u.login,
                u.password_hash,
                u.estado,

                p.id_cargo,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.tipo_documento,
                p.numero_documento,
                p.telefono,

                c.nombre_cargo AS cargo

            FROM usuarios u

            LEFT JOIN personas p
                ON u.id_usuario = p.id_usuario

            LEFT JOIN cargos c
                ON p.id_cargo = c.id_cargo

            WHERE u.login = ?
        `;

        const [filas] = await db.query(sql, [correo]);

        // Usuario no encontrado
        if (filas.length === 0) {

            return res.status(401).json({
                error: "Correo o contraseña incorrectos."
            });

        }

        const usuario = filas[0];


        // ==================================================
        // VERIFICAR ESTADO
        // ==================================================

        if (usuario.estado !== "Activo") {

            return res.status(403).json({
                error: "El usuario se encuentra inactivo."
            });

        }


        // ==================================================
        // VERIFICAR CARGO
        // ==================================================

        if (!usuario.id_cargo) {

            return res.status(403).json({
                error: "El usuario no tiene un cargo asignado."
            });

        }


        let passwordCorrecta = false;


        // ==================================================
        // CONTRASEÑA BCRYPT
        // ==================================================

        if (
            usuario.password_hash &&
            (
                usuario.password_hash.startsWith("$2a$") ||
                usuario.password_hash.startsWith("$2b$") ||
                usuario.password_hash.startsWith("$2y$")
            )
        ) {

            passwordCorrecta = await bcrypt.compare(
                password,
                usuario.password_hash
            );

        }


        // ==================================================
        // CONTRASEÑA SHA-256
        // ==================================================

        else {

            const passwordSHA256 = crypto
                .createHash("sha256")
                .update(password)
                .digest("hex");

            passwordCorrecta =
                passwordSHA256.toLowerCase() ===
                String(usuario.password_hash).toLowerCase();


            // ==================================================
            // MIGRAR SHA-256 A BCRYPT
            // ==================================================

            if (passwordCorrecta) {

                const nuevoHash = await bcrypt.hash(
                    password,
                    10
                );

                await db.query(
                    `
                    UPDATE usuarios
                    SET password_hash = ?
                    WHERE id_usuario = ?
                    `,
                    [
                        nuevoHash,
                        usuario.id_usuario
                    ]
                );

            }

        }


        // ==================================================
        // CONTRASEÑA INCORRECTA
        // ==================================================

        if (!passwordCorrecta) {

            return res.status(401).json({
                error: "Correo o contraseña incorrectos."
            });

        }


        // ==================================================
        // NO ENVIAR CONTRASEÑA AL FRONTEND
        // ==================================================

        delete usuario.password_hash;


        // ==================================================
        // LOGIN EXITOSO
        // ==================================================

        console.log("--------------------------------------");
        console.log("LOGIN EXITOSO");
        console.log("Usuario:", usuario.login);
        console.log("ID:", usuario.id_usuario);
        console.log("Cargo:", usuario.cargo);
        console.log("ID cargo:", usuario.id_cargo);
        console.log("--------------------------------------");


        return res.status(200).json({

            mensaje: "Inicio de sesión exitoso.",

            usuario: usuario

        });

    } catch (error) {

        console.error(
            "ERROR AL INICIAR SESIÓN:",
            error
        );

        return res.status(500).json({
            error: "Error interno del servidor."
        });

    }

});


// ======================================================
// 2. OBTENER TODOS LOS USUARIOS
// ======================================================
router.get("/", async (req, res) => {

    try {

        const sql = `
            SELECT
                u.id_usuario,
                u.login,
                u.login AS correo,
                u.estado,

                p.id_cargo,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.tipo_documento,
                p.numero_documento,
                p.telefono,

                c.nombre_cargo AS cargo

            FROM usuarios u

            LEFT JOIN personas p
                ON u.id_usuario = p.id_usuario

            LEFT JOIN cargos c
                ON p.id_cargo = c.id_cargo

            ORDER BY u.id_usuario DESC
        `;

        const [filas] = await db.query(sql);

        return res.json(filas);

    } catch (error) {

        console.error(
            "Error al consultar usuarios:",
            error
        );

        return res.status(500).json({
            error: "Error al consultar la base de datos."
        });

    }

});


// ======================================================
// 3. OBTENER USUARIO POR ID
// ======================================================
router.get("/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const sql = `
            SELECT
                u.id_usuario,
                u.login,
                u.login AS correo,
                u.estado,

                p.id_cargo,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.tipo_documento,
                p.numero_documento,
                p.telefono,

                c.nombre_cargo AS cargo

            FROM usuarios u

            LEFT JOIN personas p
                ON u.id_usuario = p.id_usuario

            LEFT JOIN cargos c
                ON p.id_cargo = c.id_cargo

            WHERE u.id_usuario = ?
        `;

        const [filas] = await db.query(
            sql,
            [id]
        );


        if (filas.length === 0) {

            return res.status(404).json({
                error: "Usuario no encontrado."
            });

        }


        return res.json(filas[0]);

    } catch (error) {

        console.error(
            "Error al obtener usuario:",
            error
        );

        return res.status(500).json({
            error: "Error interno del servidor."
        });

    }

});


// ======================================================
// 4. REGISTRO ADMINISTRATIVO
// ======================================================
router.post("/registro-admin", async (req, res) => {

    const {
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        tipo_documento,
        numero_documento,
        telefono,
        correo,
        password,
        id_cargo
    } = req.body;


    // ==================================================
    // VALIDAR CAMPOS
    // ==================================================

    if (
        !primer_nombre ||
        !primer_apellido ||
        !tipo_documento ||
        !numero_documento ||
        !correo ||
        !password ||
        !id_cargo
    ) {

        return res.status(400).json({
            error:
                "Por favor complete todos los campos obligatorios (*)."
        });

    }


    const conexion = await db.getConnection();


    try {

        await conexion.beginTransaction();


        // ==================================================
        // VERIFICAR CORREO DUPLICADO
        // ==================================================

        const [existeUsuario] = await conexion.query(
            `
            SELECT id_usuario
            FROM usuarios
            WHERE login = ?
            `,
            [correo]
        );


        if (existeUsuario.length > 0) {

            await conexion.rollback();

            return res.status(400).json({
                error:
                    "El correo/login ingresado ya se encuentra registrado."
            });

        }


        // ==================================================
        // ENCRIPTAR CONTRASEÑA
        // ==================================================

        const passwordHash = await bcrypt.hash(
            password,
            10
        );


        // ==================================================
        // INSERTAR USUARIO
        // ==================================================

        const [resultadoUsuario] =
            await conexion.query(
                `
                INSERT INTO usuarios
                (
                    login,
                    password_hash,
                    estado
                )
                VALUES
                (?, ?, 'Activo')
                `,
                [
                    correo,
                    passwordHash
                ]
            );


        const id_usuario_creado =
            resultadoUsuario.insertId;


        // ==================================================
        // INSERTAR PERSONA
        // ==================================================

        await conexion.query(
            `
            INSERT INTO personas
            (
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                tipo_documento,
                numero_documento,
                telefono,
                id_cargo,
                id_usuario
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                primer_nombre,
                segundo_nombre || null,
                primer_apellido,
                segundo_apellido || null,
                tipo_documento,
                numero_documento,
                telefono || null,
                id_cargo,
                id_usuario_creado
            ]
        );


        // ==================================================
        // CONFIRMAR
        // ==================================================

        await conexion.commit();


        return res.status(201).json({

            mensaje:
                "Usuario registrado correctamente.",

            id_usuario:
                id_usuario_creado

        });

    } catch (error) {

        await conexion.rollback();

        console.error(
            "ERROR BD AL REGISTRAR USUARIO:",
            error
        );

        return res.status(500).json({

            error:
                error.sqlMessage ||
                error.message ||
                "No se pudo registrar el usuario."

        });

    } finally {

        conexion.release();

    }

});


// ======================================================
// 5. ACTUALIZAR USUARIO
// ======================================================
router.put("/:id", async (req, res) => {

    const { id } = req.params;

    const {
        login,
        estado,
        id_cargo
    } = req.body;


    // ==================================================
    // VALIDAR
    // ==================================================

    if (!login || !estado || !id_cargo) {

        return res.status(400).json({
            error:
                "El correo, estado y cargo son obligatorios."
        });

    }


    const conexion =
        await db.getConnection();


    try {

        await conexion.beginTransaction();


        // ==================================================
        // COMPROBAR USUARIO
        // ==================================================

        const [usuarioExiste] =
            await conexion.query(
                `
                SELECT id_usuario
                FROM usuarios
                WHERE id_usuario = ?
                `,
                [id]
            );


        if (usuarioExiste.length === 0) {

            await conexion.rollback();

            return res.status(404).json({
                error:
                    "El usuario no existe."
            });

        }


        // ==================================================
        // COMPROBAR CORREO DUPLICADO
        // ==================================================

        const [loginExiste] =
            await conexion.query(
                `
                SELECT id_usuario
                FROM usuarios
                WHERE login = ?
                AND id_usuario <> ?
                `,
                [
                    login,
                    id
                ]
            );


        if (loginExiste.length > 0) {

            await conexion.rollback();

            return res.status(400).json({
                error:
                    "El correo/login ya está siendo utilizado por otro usuario."
            });

        }


        // ==================================================
        // COMPROBAR CARGO
        // ==================================================

        const [cargoExiste] =
            await conexion.query(
                `
                SELECT id_cargo
                FROM cargos
                WHERE id_cargo = ?
                `,
                [id_cargo]
            );


        if (cargoExiste.length === 0) {

            await conexion.rollback();

            return res.status(400).json({
                error:
                    "El cargo seleccionado no existe."
            });

        }


        // ==================================================
        // ACTUALIZAR USUARIOS
        // ==================================================

        await conexion.query(
            `
            UPDATE usuarios
            SET
                login = ?,
                estado = ?
            WHERE id_usuario = ?
            `,
            [
                login,
                estado,
                id
            ]
        );


        // ==================================================
        // COMPROBAR PERSONA
        // ==================================================

        const [personaExiste] =
            await conexion.query(
                `
                SELECT id_usuario
                FROM personas
                WHERE id_usuario = ?
                `,
                [id]
            );


        if (personaExiste.length === 0) {

            await conexion.rollback();

            return res.status(400).json({
                error:
                    "El usuario no tiene un registro asociado en personas."
            });

        }


        // ==================================================
        // ACTUALIZAR CARGO
        // ==================================================

        await conexion.query(
            `
            UPDATE personas
            SET id_cargo = ?
            WHERE id_usuario = ?
            `,
            [
                id_cargo,
                id
            ]
        );


        // ==================================================
        // CONFIRMAR
        // ==================================================

        await conexion.commit();


        console.log("--------------------------------------");
        console.log("USUARIO ACTUALIZADO");
        console.log("ID:", id);
        console.log("Login:", login);
        console.log("Estado:", estado);
        console.log("Cargo:", id_cargo);
        console.log("--------------------------------------");


        return res.status(200).json({

            mensaje:
                "Usuario actualizado correctamente."

        });


    } catch (error) {

        await conexion.rollback();


        console.error(
            "======================================"
        );

        console.error(
            "ERROR AL ACTUALIZAR USUARIO"
        );

        console.error(error);

        console.error(
            "======================================"
        );


        return res.status(500).json({

            error:
                error.sqlMessage ||
                error.message ||
                "Error al actualizar el usuario."

        });


    } finally {

        conexion.release();

    }

});


// ======================================================
// 6. ELIMINAR USUARIO
// ======================================================
router.delete("/:id", async (req, res) => {

    const { id } = req.params;

    const conexion =
        await db.getConnection();


    try {

        await conexion.beginTransaction();


        // Eliminar persona
        await conexion.query(
            `
            DELETE FROM personas
            WHERE id_usuario = ?
            `,
            [id]
        );


        // Eliminar usuario
        await conexion.query(
            `
            DELETE FROM usuarios
            WHERE id_usuario = ?
            `,
            [id]
        );


        await conexion.commit();


        return res.json({
            mensaje:
                "Usuario eliminado con éxito."
        });


    } catch (error) {

        await conexion.rollback();


        console.error(
            "Error al eliminar usuario:",
            error
        );


        return res.status(500).json({
            error:
                "Error al eliminar el usuario en la base de datos."
        });


    } finally {

        conexion.release();

    }

});


// ======================================================
// EXPORTACIÓN IMPORTANTE
// ======================================================

export default router;