import { Router } from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";

const router = Router();

// ======================================================
// CONFIGURACIÓN TRANSPORTE NODEMAILER (RECUPERACIÓN REAL)
// ======================================================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ======================================================
// MIDDLEWARE PARA MANEJAR ERRORES DE VALIDACIÓN
// ======================================================
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({
            error: errores.array()[0].msg
        });
    }
    next();
};

// ======================================================
// 1. LOGIN
// ======================================================
router.post(
    "/login",
    [
        body("correo")
            .trim()
            .notEmpty().withMessage("Correo y contraseña son obligatorios.")
            .isEmail().withMessage("Debe ingresar un correo electrónico válido."),
        body("password")
            .notEmpty().withMessage("Correo y contraseña son obligatorios.")
            .isLength({ min: 8, max: 20 }).withMessage("La contraseña debe tener entre 8 y 20 caracteres.")
    ],
    validarCampos,
    async (req, res) => {
        const { correo, password } = req.body;

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

            if (filas.length === 0) {
                return res.status(401).json({
                    error: "Correo o contraseña incorrectos."
                });
            }

            const usuario = filas[0];

            if (usuario.estado !== "Activo") {
                return res.status(403).json({
                    error: "El usuario se encuentra inactivo."
                });
            }

            if (!usuario.id_cargo) {
                return res.status(403).json({
                    error: "El usuario no tiene un cargo asignado."
                });
            }

            let passwordCorrecta = false;

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
            } else {
                const passwordSHA256 = crypto
                    .createHash("sha256")
                    .update(password)
                    .digest("hex");

                passwordCorrecta =
                    passwordSHA256.toLowerCase() ===
                    String(usuario.password_hash).toLowerCase();

                if (passwordCorrecta) {
                    const nuevoHash = await bcrypt.hash(password, 10);

                    await db.query(
                        `UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?`,
                        [nuevoHash, usuario.id_usuario]
                    );
                }
            }

            if (!passwordCorrecta) {
                return res.status(401).json({
                    error: "Correo o contraseña incorrectos."
                });
            }

            delete usuario.password_hash;

            return res.status(200).json({
                mensaje: "Inicio de sesión exitoso.",
                usuario: usuario
            });

        } catch (error) {
            console.error("ERROR AL INICIAR SESIÓN:", error);
            return res.status(500).json({
                error: "Error interno del servidor."
            });
        }
    }
);

// ======================================================
// 2. RECUPERAR CONTRASEÑA (VERIFICAR Y ENVIAR PIN REAL POR CORREO)
// ======================================================
router.post(
    "/recuperar-password",
    [
        body("correo")
            .trim()
            .notEmpty().withMessage("Debe ingresar un correo electrónico.")
            .isEmail().withMessage("Debe ingresar un correo electrónico válido.")
    ],
    validarCampos,
    async (req, res) => {
        const { correo } = req.body;

        try {
            const [filas] = await db.query(
                `SELECT u.id_usuario, u.login, u.estado, p.primer_nombre 
                 FROM usuarios u 
                 LEFT JOIN personas p ON u.id_usuario = p.id_usuario 
                 WHERE u.login = ?`,
                [correo]
            );

            if (filas.length === 0) {
                return res.status(404).json({
                    error: "El correo no está registrado en la plataforma."
                });
            }

            if (filas[0].estado !== "Activo") {
                return res.status(403).json({
                    error: "El usuario se encuentra inactivo."
                });
            }

            // Generar PIN numérico de 6 dígitos
            const pin = Math.floor(100000 + Math.random() * 900000).toString();

            // Guardar o actualizar PIN en el usuario
            await db.query(
                `UPDATE usuarios SET pin_recuperacion = ? WHERE login = ?`,
                [pin, correo]
            );

            // Enviar correo electrónico real
            try {
                await transporter.sendMail({
                    from: `"Liceo Antonio De Toledo" <${process.env.EMAIL_USER}>`,
                    to: correo,
                    subject: "Código de Recuperación de Contraseña - Liceo Antonio De Toledo",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <h2 style="color: #0d6efd;">Liceo Antonio De Toledo</h2>
                            <h3>Recuperación de Contraseña</h3>
                            <p>Hola <strong>${filas[0].primer_nombre || "Usuario"}</strong>,</p>
                            <p>Tu código de verificación para restablecer la contraseña es:</p>
                            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; border: 1px dashed #ccc; margin: 15px 0;">
                                ${pin}
                            </div>
                            <p>Ingresa este PIN en el formulario para proceder con el cambio de tu clave.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error("Aviso: No se pudo despachar el correo (Verificar credenciales SMTP):", emailError.message);
            }

            return res.status(200).json({
                mensaje: "Correo verificado correctamente."
            });

        } catch (error) {
            console.error("Error al consultar correo para recuperación:", error);
            return res.status(500).json({
                error: "Error interno del servidor."
            });
        }
    }
);

// ======================================================
// 3. CAMBIAR CONTRASEÑA (RESTABLECER CON VERIFICACIÓN ESTRICTA DE PIN)
// ======================================================
router.post(
    "/cambiar-password",
    [
        body("correo")
            .trim()
            .notEmpty().withMessage("El correo es obligatorio.")
            .isEmail().withMessage("Debe ingresar un correo electrónico válido."),
        body("pin")
            .trim()
            .notEmpty().withMessage("El PIN de verificación es obligatorio."),
        body("password")
            .notEmpty().withMessage("La contraseña es obligatoria.")
            .isLength({ min: 8, max: 20 }).withMessage("La contraseña debe tener entre 8 y 20 caracteres.")
    ],
    validarCampos,
    async (req, res) => {
        const { correo, pin, password } = req.body;

        try {
            const [filas] = await db.query(
                `SELECT id_usuario, pin_recuperacion FROM usuarios WHERE login = ? AND estado = 'Activo'`,
                [correo]
            );

            if (filas.length === 0) {
                return res.status(404).json({
                    error: "El correo no corresponde a ningún usuario activo."
                });
            }

            const usuario = filas[0];

            // Validar la coincidencia exacta del PIN en base de datos
            if (!usuario.pin_recuperacion || usuario.pin_recuperacion.trim() !== pin.trim()) {
                return res.status(400).json({
                    error: "El PIN es incorrecto o ha expirado."
                });
            }

            const nuevoHash = await bcrypt.hash(password, 10);

            // Se limpia el PIN de recuperación tras cambiar la clave exitosamente
            await db.query(
                `UPDATE usuarios SET password_hash = ?, pin_recuperacion = NULL WHERE login = ?`,
                [nuevoHash, correo]
            );

            return res.status(200).json({
                mensaje: "Contraseña actualizada correctamente."
            });

        } catch (error) {
            console.error("Error al actualizar la contraseña:", error);
            return res.status(500).json({
                error: "Error interno del servidor."
            });
        }
    }
);

// ======================================================
// 4. OBTENER TODOS LOS USUARIOS
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
        console.error("Error al consultar usuarios:", error);
        return res.status(500).json({
            error: "Error al consultar la base de datos."
        });
    }
});

// ======================================================
// 5. OBTENER USUARIO POR ID
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

        const [filas] = await db.query(sql, [id]);

        if (filas.length === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado."
            });
        }

        return res.json(filas[0]);

    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return res.status(500).json({
            error: "Error interno del servidor."
        });
    }
});

// ======================================================
// 6. REGISTRO PÚBLICO (DOCENTES Y ACUDIENTES)
// ======================================================
router.post(
    "/registro-publico",
    [
        body("primer_nombre")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El primer nombre solo puede contener letras."),
        body("primer_apellido")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El primer apellido solo puede contener letras."),
        body("tipo_documento")
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*)."),
        body("numero_documento")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isNumeric().withMessage("El número de documento debe contener solo dígitos.")
            .isLength({ min: 6, max: 15 }).withMessage("El número de documento debe tener entre 6 y 15 dígitos."),
        body("correo")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isEmail().withMessage("Ingrese un correo electrónico válido."),
        body("password")
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isLength({ min: 8, max: 20 }).withMessage("La contraseña debe tener entre 8 y 20 caracteres.")
            .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/).withMessage("La contraseña debe contener letras y números, sin espacios ni caracteres especiales."),
        body("id_cargo")
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isInt().withMessage("El cargo seleccionado debe ser válido.")
            .custom((value) => {
                const cargosPermitidos = [3, 4];
                if (!cargosPermitidos.includes(Number(value))) {
                    throw new Error("El rol seleccionado no está permitido.");
                }
                return true;
            })
    ],
    validarCampos,
    async (req, res) => {
        const {
            primer_nombre,
            primer_apellido,
            tipo_documento,
            numero_documento,
            correo,
            password,
            id_cargo
        } = req.body;

        const conexion = await db.getConnection();

        try {
            await conexion.beginTransaction();

            const [existeCorreo] = await conexion.query(
                `SELECT id_usuario FROM usuarios WHERE login = ?`,
                [correo]
            );

            if (existeCorreo.length > 0) {
                await conexion.rollback();
                return res.status(400).json({
                    error: "El correo electrónico ya se encuentra registrado."
                });
            }

            const [existeDocumento] = await conexion.query(
                `SELECT id_persona FROM personas WHERE numero_documento = ?`,
                [numero_documento]
            );

            if (existeDocumento.length > 0) {
                await conexion.rollback();
                return res.status(400).json({
                    error: "El número de documento ya se encuentra registrado."
                });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const [resultadoUsuario] = await conexion.query(
                `
                INSERT INTO usuarios (login, password_hash, estado)
                VALUES (?, ?, 'Activo')
                `,
                [correo, passwordHash]
            );

            const id_usuario_creado = resultadoUsuario.insertId;

            await conexion.query(
                `
                INSERT INTO personas
                (
                    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                    tipo_documento, numero_documento, telefono, id_cargo, id_usuario
                )
                VALUES (?, NULL, ?, NULL, ?, ?, NULL, ?, ?)
                `,
                [
                    primer_nombre,
                    primer_apellido,
                    tipo_documento,
                    numero_documento,
                    id_cargo,
                    id_usuario_creado
                ]
            );

            await conexion.commit();

            return res.status(201).json({
                mensaje: "Usuario registrado correctamente.",
                id_usuario: id_usuario_creado
            });

        } catch (error) {
            await conexion.rollback();
            console.error("ERROR BD AL REGISTRAR USUARIO PÚBLICO:", error);

            return res.status(500).json({
                error: error.sqlMessage || error.message || "No se pudo completar el registro del usuario."
            });

        } finally {
            conexion.release();
        }
    }
);

// ======================================================
// 7. REGISTRO ADMINISTRATIVO
// ======================================================
router.post(
    "/registro-admin",
    [
        body("primer_nombre")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El primer nombre solo puede contener letras."),
        body("segundo_nombre")
            .optional({ checkFalsy: true })
            .trim()
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El segundo nombre solo puede contener letras."),
        body("primer_apellido")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El primer apellido solo puede contener letras."),
        body("segundo_apellido")
            .optional({ checkFalsy: true })
            .trim()
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El segundo apellido solo puede contener letras."),
        body("tipo_documento")
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*)."),
        body("numero_documento")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isNumeric().withMessage("El número de documento debe contener solo dígitos.")
            .isLength({ min: 7, max: 15 }).withMessage("El número de documento debe tener entre 7 y 15 dígitos."),
        body("telefono")
            .optional({ checkFalsy: true })
            .trim()
            .isNumeric().withMessage("El teléfono debe contener únicamente números.")
            .isLength({ min: 7, max: 10 }).withMessage("El teléfono debe tener entre 7 y 10 dígitos."),
        body("correo")
            .trim()
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isEmail().withMessage("Ingrese un correo electrónico válido."),
        body("password")
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isLength({ min: 8, max: 20 }).withMessage("La contraseña debe tener entre 8 y 20 caracteres."),
        body("id_cargo")
            .notEmpty().withMessage("Por favor complete todos los campos obligatorios (*).")
            .isInt().withMessage("El cargo seleccionado debe ser válido.")
    ],
    validarCampos,
    async (req, res) => {
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

        const conexion = await db.getConnection();

        try {
            await conexion.beginTransaction();

            const [existeUsuario] = await conexion.query(
                `SELECT id_usuario FROM usuarios WHERE login = ?`,
                [correo]
            );

            if (existeUsuario.length > 0) {
                await conexion.rollback();
                return res.status(400).json({
                    error: "El correo/login ingresado ya se encuentra registrado."
                });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const [resultadoUsuario] = await conexion.query(
                `
                INSERT INTO usuarios (login, password_hash, estado)
                VALUES (?, ?, 'Activo')
                `,
                [correo, passwordHash]
            );

            const id_usuario_creado = resultadoUsuario.insertId;

            await conexion.query(
                `
                INSERT INTO personas
                (
                    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
                    tipo_documento, numero_documento, telefono, id_cargo, id_usuario
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

            await conexion.commit();

            return res.status(201).json({
                mensaje: "Usuario registrado correctamente.",
                id_usuario: id_usuario_creado
            });

        } catch (error) {
            await conexion.rollback();
            console.error("ERROR BD AL REGISTRAR USUARIO:", error);

            return res.status(500).json({
                error: error.sqlMessage || error.message || "No se pudo registrar el usuario."
            });

        } finally {
            conexion.release();
        }
    }
);

// ======================================================
// 8. ACTUALIZAR USUARIO
// ======================================================
router.put(
    "/:id",
    [
        body("login")
            .trim()
            .notEmpty().withMessage("El correo, estado y cargo son obligatorios.")
            .isEmail().withMessage("Ingrese un correo válido."),
        body("estado")
            .notEmpty().withMessage("El correo, estado y cargo son obligatorios.")
            .isIn(["Activo", "Inactivo"]).withMessage("El estado debe ser 'Activo' o 'Inactivo'."),
        body("id_cargo")
            .notEmpty().withMessage("El correo, estado y cargo son obligatorios.")
            .isInt().withMessage("El cargo seleccionado debe ser válido.")
    ],
    validarCampos,
    async (req, res) => {
        const { id } = req.params;
        const { login, estado, id_cargo } = req.body;

        const conexion = await db.getConnection();

        try {
            await conexion.beginTransaction();

            const [usuarioExiste] = await conexion.query(
                `SELECT id_usuario FROM usuarios WHERE id_usuario = ?`,
                [id]
            );

            if (usuarioExiste.length === 0) {
                await conexion.rollback();
                return res.status(404).json({
                    error: "El usuario no existe."
                });
            }

            const [loginExiste] = await conexion.query(
                `SELECT id_usuario FROM usuarios WHERE login = ? AND id_usuario <> ?`,
                [login, id]
            );

            if (loginExiste.length > 0) {
                await conexion.rollback();
                return res.status(400).json({
                    error: "El correo/login ya está siendo utilizado por otro usuario."
                });
            }

            const [cargoExiste] = await conexion.query(
                `SELECT id_cargo FROM cargos WHERE id_cargo = ?`,
                [id_cargo]
            );

            if (cargoExiste.length === 0) {
                await conexion.rollback();
                return res.status(400).json({
                    error: "El cargo seleccionado no existe."
                });
            }

            await conexion.query(
                `UPDATE usuarios SET login = ?, estado = ? WHERE id_usuario = ?`,
                [login, estado, id]
            );

            const [personaExiste] = await conexion.query(
                `SELECT id_usuario FROM personas WHERE id_usuario = ?`,
                [id]
            );

            if (personaExiste.length === 0) {
                await conexion.rollback();
                return res.status(400).json({
                    error: "El usuario no tiene un registro asociado en personas."
                });
            }

            await conexion.query(
                `UPDATE personas SET id_cargo = ? WHERE id_usuario = ?`,
                [id_cargo, id]
            );

            await conexion.commit();

            return res.status(200).json({
                mensaje: "Usuario actualizado correctamente."
            });

        } catch (error) {
            await conexion.rollback();
            console.error("ERROR AL ACTUALIZAR USUARIO:", error);

            return res.status(500).json({
                error: error.sqlMessage || error.message || "Error al actualizar el usuario."
            });

        } finally {
            conexion.release();
        }
    }
);

// ======================================================
// 9. ELIMINAR USUARIO
// ======================================================
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const conexion = await db.getConnection();

    try {
        await conexion.beginTransaction();

        await conexion.query(
            `DELETE FROM personas WHERE id_usuario = ?`,
            [id]
        );

        await conexion.query(
            `DELETE FROM usuarios WHERE id_usuario = ?`,
            [id]
        );

        await conexion.commit();

        return res.json({
            mensaje: "Usuario eliminado con éxito."
        });

    } catch (error) {
        await conexion.rollback();
        console.error("Error al eliminar usuario:", error);

        return res.status(500).json({
            error: "Error al eliminar el usuario en la base de datos."
        });

    } finally {
        conexion.release();
    }
});

export default router;