import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const search = (req.query.search || "").trim();
    const offset = (page - 1) * limit;

    let baseSql = `
      FROM docentes d
      INNER JOIN personas p ON d.id_persona = p.id_persona
      LEFT JOIN cargos c ON d.id_cargo = c.id_cargo
      LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
    `;
    const params = [];

    if (search) {
      baseSql += `
        WHERE p.primer_nombre LIKE ?
           OR p.primer_apellido LIKE ?
           OR p.numero_documento LIKE ?
           OR u.login LIKE ?
      `;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const [rows] = await pool.query(
      `SELECT d.id_docente, d.id_persona, d.id_cargo, p.primer_nombre, p.segundo_nombre,
              p.primer_apellido, p.segundo_apellido, p.numero_documento, p.id_usuario,
              u.login AS correo, c.nombre_cargo
       ${baseSql}
       ORDER BY p.primer_apellido ASC, p.primer_nombre ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total ${baseSql}`, params);
    const total = Number(countRow.total) || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      docentes: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error al consultar docentes:", error);
    return res.status(500).json({ error: "Error al obtener los docentes." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, p.primer_nombre, p.primer_apellido, p.numero_documento, c.nombre_cargo
       FROM docentes d
       INNER JOIN personas p ON d.id_persona = p.id_persona
       LEFT JOIN cargos c ON d.id_cargo = c.id_cargo
       WHERE d.id_docente = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Docente no encontrado." });
    }
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id_persona, id_cargo } = req.body;
    if (!id_persona) {
      return res.status(400).json({ error: "El id_persona es obligatorio." });
    }

    const [existing] = await pool.query(
      "SELECT id_docente FROM docentes WHERE id_persona = ?",
      [id_persona]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Esta persona ya está registrada como docente." });
    }

    const [result] = await pool.query(
      "INSERT INTO docentes (id_persona, id_cargo) VALUES (?, ?)",
      [id_persona, id_cargo || 3]
    );
    return res.status(201).json({
      mensaje: "Docente registrado correctamente.",
      id_docente: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id_cargo } = req.body;
    const [result] = await pool.query(
      "UPDATE docentes SET id_cargo = ? WHERE id_docente = ?",
      [id_cargo || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Docente no encontrado." });
    }
    return res.json({ mensaje: "Docente actualizado correctamente." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM docentes WHERE id_docente = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Docente no encontrado." });
    }
    return res.json({ mensaje: "Docente eliminado exitosamente." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;