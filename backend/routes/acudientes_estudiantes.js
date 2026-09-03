import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_acudiente, id_estudiante, parentesco
            FROM acudientes_estudiantes`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ae.*, 
                   pa.primer_nombre AS nombre_acudiente, pa.primer_apellido AS apellido_acudiente,
                   pe.primer_nombre AS nombre_estudiante, pe.primer_apellido AS apellido_estudiante
            FROM acudientes_estudiantes ae
            JOIN acudientes a ON ae.id_acudiente = a.id_acudiente
            JOIN personas pa ON a.id_persona = pa.id_persona
            JOIN estudiantes e ON ae.id_estudiante = e.id_estudiante
            JOIN personas pe ON e.id_persona = pe.id_persona
        `);
        res.json({ relaciones: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { id_acudiente, id_estudiante, parentesco } = req.body;
        if (!id_acudiente || !id_estudiante) return res.status(400).json({ error: "id_acudiente e id_estudiante son obligatorios" });

        await pool.query(
            "INSERT INTO acudientes_estudiantes (id_acudiente, id_estudiante, parentesco) VALUES (?, ?, ?)",
            [id_acudiente, id_estudiante, parentesco || "Acudiente"]
        );
        res.status(201).json({ mensaje: "Relación acudiente-estudiante creada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id_acudiente/:id_estudiante", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM acudientes_estudiantes WHERE id_acudiente = ? AND id_estudiante = ?",
            [req.params.id_acudiente, req.params.id_estudiante]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Relación no encontrada" });
        res.json({ mensaje: "Relación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;