import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Obtener todas las relaciones con nombres completos de acudiente y estudiante
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

// Crear relación directamente por IDs
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

// NUEVO: Vincular estudiante por su Número de Documento usando el id_usuario del acudiente
router.post("/vincular", async (req, res) => {
    try {
        const { id_usuario, documento_estudiante, parentesco } = req.body;

        // 1. Buscar id_acudiente del usuario logueado
        const [acudiente] = await pool.query(
            `SELECT a.id_acudiente 
             FROM acudientes a
             INNER JOIN personas p ON a.id_persona = p.id_persona
             WHERE p.id_usuario = ?`,
            [id_usuario]
        );

        if (acudiente.length === 0) {
            return res.status(404).json({ error: "Perfil de acudiente no encontrado." });
        }

        // 2. Buscar id_estudiante por número de documento
        const [estudiante] = await pool.query(
            `SELECT e.id_estudiante, p.primer_nombre, p.primer_apellido 
             FROM estudiantes e
             INNER JOIN personas p ON e.id_persona = p.id_persona
             WHERE p.numero_documento = ?`,
            [documento_estudiante]
        );

        if (estudiante.length === 0) {
            return res.status(404).json({ error: "No se encontró ningún estudiante con ese número de documento." });
        }

        // 3. Crear la vinculación
        await pool.query(
            `INSERT INTO acudientes_estudiantes (id_acudiente, id_estudiante, parentesco) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE parentesco = VALUES(parentesco)`,
            [acudiente[0].id_acudiente, estudiante[0].id_estudiante, parentesco || 'Acudiente']
        );

        res.json({ 
            mensaje: "Estudiante vinculado exitosamente", 
            estudiante: `${estudiante[0].primer_nombre} ${estudiante[0].primer_apellido}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NUEVO: Obtener los estudiantes vinculados a un acudiente específico
router.get("/mis-estudiantes/:id_usuario", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT e.id_estudiante, p.primer_nombre, p.primer_apellido, p.numero_documento, ae.parentesco
             FROM acudientes_estudiantes ae
             INNER JOIN acudientes a ON ae.id_acudiente = a.id_acudiente
             INNER JOIN personas p_acu ON a.id_persona = p_acu.id_persona
             INNER JOIN estudiantes e ON ae.id_estudiante = e.id_estudiante
             INNER JOIN personas p ON e.id_persona = p.id_persona
             WHERE p_acu.id_usuario = ?`,
            [req.params.id_usuario]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar relación existente
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