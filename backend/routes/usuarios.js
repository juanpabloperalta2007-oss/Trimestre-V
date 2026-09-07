import { Router } from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";

const router = Router();

// ==========================================
// 1. OBTENER TODOS LOS USUARIOS (Vista Admin)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id_usuario,
        u.login,
        u.login AS correo,
        u.estado,
        c.nombre_cargo AS cargo,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.tipo_documento,
        p.numero_documento,
        p.telefono
      FROM usuarios u
      LEFT JOIN personas p ON u.id_usuario = p.id_usuario
      LEFT JOIN cargos c ON p.id_cargo = c.id_cargo
      ORDER BY u.id_usuario DESC
    `;
    const [filas] = await db.query(sql);
    res.json(filas);
  } catch (error) {
    console.error("Error al consultar usuarios:", error);
    res.status(500).json({ error: "Error al consultar la base de datos." });
  }
});

// ==========================================
// 2. OBTENER USUARIO POR ID
// ==========================================
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT 
        u.id_usuario,
        u.login,
        u.login AS correo,
        u.estado,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.tipo_documento,
        p.numero_documento,
        p.telefono,
        p.id_cargo
      FROM usuarios u
      LEFT JOIN personas p ON u.id_usuario = p.id_usuario
      WHERE u.id_usuario = ?
    `;
    const [filas] = await db.query(sql, [id]);

    if (filas.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json(filas[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ==========================================
// 3. REGISTRO ADMINISTRATIVO DE USUARIO
// ==========================================
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

  if (!primer_nombre || !primer_apellido || !tipo_documento || !numero_documento || !correo || !password || !id_cargo) {
    return res.status(400).json({ error: "Por favor complete todos los campos obligatorios (*)." });
  }

  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();

    // Validar correo duplicado
    const [existeUsuario] = await conexion.query("SELECT id_usuario FROM usuarios WHERE login = ?", [correo]);
    if (existeUsuario.length > 0) {
      await conexion.rollback();
      return res.status(400).json({ error: "El correo/login ingresado ya se encuentra registrado." });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar en tabla usuarios
    const sqlUsuario = `INSERT INTO usuarios (login, password_hash, estado) VALUES (?, ?, 'Activo')`;
    const [resultadoUsuario] = await conexion.query(sqlUsuario, [correo, passwordHash]);
    const id_usuario_creado = resultadoUsuario.insertId;

    // Insertar en tabla personas
    const sqlPersona = `
      INSERT INTO personas 
        (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_documento, numero_documento, telefono, id_cargo, id_usuario) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await conexion.query(sqlPersona, [
      primer_nombre,
      segundo_nombre || null,
      primer_apellido,
      segundo_apellido || null,
      tipo_documento,
      numero_documento,
      telefono || null,
      id_cargo,
      id_usuario_creado
    ]);

    await conexion.commit();
    res.status(201).json({ mensaje: "Usuario registrado correctamente.", id_usuario: id_usuario_creado });

  } catch (error) {
    await conexion.rollback();
    console.error("=== ERROR BD AL REGISTRAR USUARIO ===", error);
    res.status(500).json({ 
      error: `Error en la BD: ${error.sqlMessage || error.message || "No se pudo registrar el usuario."}` 
    });
  } finally {
    conexion.release();
  }
});

// ==========================================
// 4. ELIMINAR USUARIO
// ==========================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const conexion = await db.getConnection();

  try {
    await conexion.beginTransaction();
    await conexion.query("DELETE FROM personas WHERE id_usuario = ?", [id]);
    await conexion.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    await conexion.commit();

    res.json({ mensaje: "Usuario eliminado con éxito." });
  } catch (error) {
    await conexion.rollback();
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario en la base de datos." });
  } finally {
    conexion.release();
  }
});

export default router;