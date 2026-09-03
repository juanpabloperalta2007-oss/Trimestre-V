import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ec.*, p.primer_nombre, p.primer_apellido, c.nombre_curso
            FROM estudiantes_cursos ec
            JOIN estudiantes e ON ec.id_estudiante = e.id_estudiante
            JOIN personas p ON e.id_persona = p.id_persona
            JOIN cursos c ON ec.id_curso = c.id_curso
        `);
        res.json({ matriculas: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_estudiante, id_curso, anio 
            FROM estudiantes_cursos`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.post("/", async (req, res) => {
    try {
        const { id_estudiante, id_curso, anio } = req.body;
        if (!id_estudiante || !id_curso) return res.status(400).json({ error: "id_estudiante e id_curso son obligatorios" });

        const currentYear = new Date().getFullYear();
        await pool.query(
            "INSERT INTO estudiantes_cursos (id_estudiante, id_curso, anio) VALUES (?, ?, ?)",
            [id_estudiante, id_curso, anio || currentYear]
        );
        res.status(201).json({ mensaje: "Estudiante matriculado en curso correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id_estudiante/:id_curso/:anio", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM estudiantes_cursos WHERE id_estudiante = ? AND id_curso = ? AND anio = ?",
            [req.params.id_estudiante, req.params.id_curso, req.params.anio]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Matrícula no encontrada" });
        res.json({ mensaje: "Matrícula eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;