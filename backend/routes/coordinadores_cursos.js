import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT cc.*, p.primer_nombre, p.primer_apellido, c.nombre_curso
            FROM coordinadores_cursos cc
            JOIN coordinadores coord ON cc.id_coordinador = coord.id_coordinador
            JOIN personas p ON coord.id_persona = p.id_persona
            JOIN cursos c ON cc.id_curso = c.id_curso
        `);
        res.json({ coordinaciones: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { id_coordinador, id_curso } = req.body;
        if (!id_coordinador || !id_curso) return res.status(400).json({ error: "id_coordinador e id_curso son obligatorios" });

        await pool.query("INSERT INTO coordinadores_cursos (id_coordinador, id_curso) VALUES (?, ?)", [id_coordinador, id_curso]);
        res.status(201).json({ mensaje: "Coordinador asignado al curso exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id_coordinador/:id_curso", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM coordinadores_cursos WHERE id_coordinador = ? AND id_curso = ?",
            [req.params.id_coordinador, req.params.id_curso]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Asignación no encontrada" });
        res.json({ mensaje: "Asignación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;