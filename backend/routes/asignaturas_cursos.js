import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET: Obtener todas las asignaciones académicas
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                ac.*,
                a.nombre_asignatura,
                c.nombre_curso,
                p.primer_nombre AS docente_nombre,
                p.primer_apellido AS docente_apellido
            FROM asignaturas_cursos ac
            JOIN asignaturas a
                ON ac.id_asignatura = a.id_asignatura
            JOIN cursos c
                ON ac.id_curso = c.id_curso
            JOIN docentes d
                ON ac.id_docente = d.id_docente
            JOIN personas p
                ON d.id_persona = p.id_persona
        `);

        return res.json({ cargas_academicas: rows });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// POST: Registrar una asignación académica
router.post("/", async (req, res) => {
    try {
        const {
            id_asignatura,
            id_curso,
            id_docente
        } = req.body;

        if (!id_asignatura || !id_curso || !id_docente) {
            return res.status(400).json({
                error: "Asignatura, curso y docente son obligatorios"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO asignaturas_cursos
             (id_asignatura, id_curso, id_docente)
             VALUES (?, ?, ?)`,
            [id_asignatura, id_curso, id_docente]
        );

        return res.status(201).json({
            mensaje: "Asignación académica registrada",
            id_asignatura_curso: result.insertId
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// DELETE: Eliminar una asignación académica
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            `DELETE FROM asignaturas_cursos
             WHERE id_asignatura_curso = ?`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Asignación no encontrada"
            });
        }

        return res.json({
            mensaje: "Asignación eliminada correctamente"
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;