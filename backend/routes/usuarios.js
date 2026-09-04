import express from "express";
import pool from "../db.js"; // Se cambia require por import

const router = express.Router();

// ==========================================
// 1. RUTA DE REGISTRO PÚBLICO
// ==========================================
router.post("/registro-publico", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      tipo_documento,
      numero_documento,
      telefono,
      direccion,
      correo,
      password,
      id_cargo // 3: Docente, 4: Acudiente
    } = req.body;

    // Validación básica de campos requeridos
    if (!primer_nombre || !primer_apellido || !tipo_documento || !numero_documento || !correo || !password || !id_cargo) {
      return res.status(400).json({ error: "Por favor, complete todos los campos obligatorios." });
    }

    // Insertar en la tabla usuarios
    const [resUsuario] = await connection.query(
      `INSERT INTO usuarios (login, password_hash, estado) VALUES (?, ?, 'Activo')`,
      [correo, password]
    );
    const id_usuario = resUsuario.insertId;

    // Insertar en la tabla personas
    const [resPersona] = await connection.query(
      `INSERT INTO personas 
        (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_documento, numero_documento, telefono, direccion, id_cargo, id_usuario) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        primer_nombre,
        segundo_nombre || null,
        primer_apellido,
        segundo_apellido || null,
        tipo_documento,
        numero_documento,
        telefono,
        direccion,
        id_cargo,
        id_usuario
      ]
    );
    const id_persona = resPersona.insertId;

    // Insertar en la tabla específica del rol
    if (parseInt(id_cargo) === 4) {
      await connection.query(
        `INSERT INTO acudientes (id_persona) VALUES (?)`,
        [id_persona]
      );
    } else if (parseInt(id_cargo) === 3) {
      await connection.query(
        `INSERT INTO docentes (id_persona) VALUES (?)`,
        [id_persona]
      );
    }

    await connection.commit();
    res.status(201).json({ mensaje: "Usuario registrado con éxito." });

  } catch (error) {
    await connection.rollback();
    console.error("Error en registro público:", error);
    res.status(500).json({ error: "Error al registrar el usuario en la base de datos." });
  } finally {
    connection.release();
  }
});

// ==========================================
// 2. RUTA DE INICIO DE SESIÓN (LOGIN)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Por favor, ingrese correo y contraseña." });
    }

    // Consulta con INNER JOIN a personas y cargos
    const [rows] = await pool.query(
      `SELECT 
        u.id_usuario, 
        u.login, 
        u.password_hash, 
        u.estado,
        p.id_persona,
        p.primer_nombre,
        p.primer_apellido,
        p.id_cargo,
        c.nombre_cargo
       FROM usuarios u
       INNER JOIN personas p ON u.id_usuario = p.id_usuario
       INNER JOIN cargos c ON p.id_cargo = c.id_cargo
       WHERE u.login = ?`,
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "El correo no pertenece a ningún usuario autorizado." });
    }

    const usuario = rows[0];

    if (usuario.estado !== 'Activo') {
      return res.status(403).json({ error: "El usuario no se encuentra activo." });
    }

    if (usuario.password_hash !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // Respuesta con id_cargo para la redirección en el frontend
    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id_usuario: usuario.id_usuario,
        id_persona: usuario.id_persona,
        nombre: `${usuario.primer_nombre} ${usuario.primer_apellido}`,
        correo: usuario.login,
        id_cargo: usuario.id_cargo,
        rol: usuario.nombre_cargo
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
  }
});

export default router;