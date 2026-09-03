import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_asistencia, fecha, estado, 
            observaciones, id_estudiante, id_asignatura_curso
            FROM asistencias`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener asistencias
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT a.*, p.primer_nombre, p.primer_apellido, p.numero_documento
            FROM asistencias a
            JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
            JOIN personas p ON e.id_persona = p.id_persona
        `;
        let countQuery = `
            SELECT COUNT(*) AS total
            FROM asistencias a
            JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
            JOIN personas p ON e.id_persona = p.id_persona
        `;
        const params = [];

        if (search) {
            const searchCondition = " WHERE p.numero_documento LIKE ? OR p.primer_nombre LIKE ? OR a.estado LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += " ORDER BY a.fecha DESC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            asistencias: rows,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Registrar asistencia
router.post("/", async (req, res) => {
    try {
        const { fecha, estado, observaciones, id_estudiante, id_asignatura_curso } = req.body;

        if (!fecha || !estado || !id_estudiante || !id_asignatura_curso) {
            return res.status(400).json({
                error: "Fecha, estado, estudiante y asignatura son obligatorios"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO asistencias (fecha, estado, observaciones, id_estudiante, id_asignatura_curso)
             VALUES (?, ?, ?, ?, ?)`,
            [fecha, estado, observaciones || null, id_estudiante, id_asignatura_curso]
        );

        res.status(201).json({
            mensaje: "Asistencia registrada correctamente",
            id_asistencia: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar asistencia
router.put("/:id", async (req, res) => {
    try {
        const { fecha, estado, observaciones } = req.body;

        const [result] = await pool.query(
            "UPDATE asistencias SET fecha = ?, estado = ?, observaciones = ? WHERE id_asistencia = ?",
            [fecha, estado, observaciones, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Asistencia no encontrada" });
        }

        res.json({ mensaje: "Asistencia actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar asistencia
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM asistencias WHERE id_asistencia = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Asistencia no encontrada" });
        }

        res.json({ mensaje: "Asistencia eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;