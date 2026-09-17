import { Router } from "express";
import pool from "../db.js";

const router = Router();


// ======================================================
// GET - OBTENER TODOS LOS CURSOS
// GET /api/cursos
// ======================================================

router.get("/", async (req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT
        id_curso,
        nombre_curso
      FROM cursos
      ORDER BY nombre_curso ASC
    `);

    console.log("CURSOS ENVIADOS:", rows);

    res.status(200).json(rows);

  } catch (error) {

    console.error("ERROR AL OBTENER CURSOS:", error);

    res.status(500).json({
      error: "Error al obtener los cursos.",
      detalle: error.message
    });

  }
});


// ======================================================
// GET - OBTENER UN CURSO
// GET /api/cursos/:id
// ======================================================

router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id_curso,
        nombre_curso
      FROM cursos
      WHERE id_curso = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Curso no encontrado."
      });

    }

    res.status(200).json(rows[0]);

  } catch (error) {

    console.error("ERROR AL OBTENER CURSO:", error);

    res.status(500).json({
      error: "Error al obtener el curso.",
      detalle: error.message
    });

  }

});


// ======================================================
// POST - CREAR CURSO
// POST /api/cursos
// ======================================================

router.post("/", async (req, res) => {

  try {

    const { nombre_curso } = req.body;

    if (!nombre_curso || nombre_curso.trim() === "") {

      return res.status(400).json({
        error: "El nombre del curso es obligatorio."
      });

    }

    const nombre = nombre_curso.trim();

    // Verificar si ya existe
    const [existente] = await pool.query(
      `
      SELECT id_curso
      FROM cursos
      WHERE nombre_curso = ?
      `,
      [nombre]
    );

    if (existente.length > 0) {

      return res.status(409).json({
        error: "El curso ya existe."
      });

    }

    const [resultado] = await pool.query(
      `
      INSERT INTO cursos
      (nombre_curso)
      VALUES (?)
      `,
      [nombre]
    );

    res.status(201).json({
      mensaje: "Curso creado correctamente.",
      curso: {
        id_curso: resultado.insertId,
        nombre_curso: nombre
      }
    });

  } catch (error) {

    console.error("ERROR AL CREAR CURSO:", error);

    res.status(500).json({
      error: "Error al crear el curso.",
      detalle: error.message
    });

  }

});


// ======================================================
// PUT - ACTUALIZAR CURSO
// PUT /api/cursos/:id
// ======================================================

router.put("/:id", async (req, res) => {

  try {

    const { id } = req.params;
    const { nombre_curso } = req.body;

    if (!nombre_curso || nombre_curso.trim() === "") {

      return res.status(400).json({
        error: "El nombre del curso es obligatorio."
      });

    }

    const nombre = nombre_curso.trim();

    const [curso] = await pool.query(
      `
      SELECT id_curso
      FROM cursos
      WHERE id_curso = ?
      `,
      [id]
    );

    if (curso.length === 0) {

      return res.status(404).json({
        error: "Curso no encontrado."
      });

    }

    const [resultado] = await pool.query(
      `
      UPDATE cursos
      SET nombre_curso = ?
      WHERE id_curso = ?
      `,
      [nombre, id]
    );

    res.status(200).json({
      mensaje: "Curso actualizado correctamente.",
      actualizado: resultado.affectedRows > 0
    });

  } catch (error) {

    console.error("ERROR AL ACTUALIZAR CURSO:", error);

    res.status(500).json({
      error: "Error al actualizar el curso.",
      detalle: error.message
    });

  }

});


// ======================================================
// DELETE - ELIMINAR CURSO
// DELETE /api/cursos/:id
// ======================================================

router.delete("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [curso] = await pool.query(
      `
      SELECT id_curso
      FROM cursos
      WHERE id_curso = ?
      `,
      [id]
    );

    if (curso.length === 0) {

      return res.status(404).json({
        error: "Curso no encontrado."
      });

    }

    const [resultado] = await pool.query(
      `
      DELETE FROM cursos
      WHERE id_curso = ?
      `,
      [id]
    );

    res.status(200).json({
      mensaje: "Curso eliminado correctamente.",
      eliminado: resultado.affectedRows > 0
    });

  } catch (error) {

    console.error("ERROR AL ELIMINAR CURSO:", error);

    // El curso tiene registros relacionados
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {

      return res.status(409).json({
        error:
          "No se puede eliminar el curso porque tiene información relacionada con estudiantes, asignaturas u otras tablas."
      });

    }

    res.status(500).json({
      error: "Error al eliminar el curso.",
      detalle: error.message
    });

  }

});


export default router;