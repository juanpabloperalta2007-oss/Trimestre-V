import { Router } from "express";
import pool from "../db.js";

const router = Router();

// 1. Obtener asistencias paginadas y filtradas por búsqueda
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

// 2. Registrar asistencia manual
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

// 3. Actualizar asistencia por ID
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

// 4. Eliminar asistencia por ID
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

// 5. Obtener estadísticas mensuales de asistencia para un estudiante
router.get("/estadisticas/:id_estudiante", async (req, res) => {
    const { id_estudiante } = req.params;
    const { mes } = req.query; // Mes numérico (1 - 12)

    try {
        const [filas] = await pool.query(
            `SELECT 
                SUM(CASE WHEN LOWER(estado) LIKE '%asistencia%' OR LOWER(estado) = 'presente' THEN 1 ELSE 0 END) AS asistencias,
                SUM(CASE WHEN LOWER(estado) LIKE '%sin justificar%' THEN 1 ELSE 0 END) AS fallas_sin_justificar,
                SUM(CASE WHEN LOWER(estado) LIKE '%justificada%' THEN 1 ELSE 0 END) AS fallas_justificadas,
                SUM(CASE WHEN LOWER(estado) LIKE '%retardo%' OR LOWER(estado) LIKE '%tarde%' THEN 1 ELSE 0 END) AS retardos
             FROM asistencias
             WHERE id_estudiante = ? 
               AND (? IS NULL OR MONTH(fecha) = ?)`,
            [id_estudiante, mes || null, mes || null]
        );

        res.json({
            asistencias: parseInt(filas[0].asistencias) || 0,
            fallas_sin_justificar: parseInt(filas[0].fallas_sin_justificar) || 0,
            fallas_justificadas: parseInt(filas[0].fallas_justificadas) || 0,
            retardos: parseInt(filas[0].retardos) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Radicar excusa (Crea o actualiza el registro a 'Falla Justificada')
router.post("/excusa", async (req, res) => {
    try {
        const { id_estudiante, motivo, fecha_inasistencia, descripcion } = req.body;

        if (!id_estudiante || !fecha_inasistencia || !descripcion) {
            return res.status(400).json({ error: "Faltan datos requeridos para radicar la excusa." });
        }

        const detalleObservacion = `[EXCUSA - ${motivo || 'General'}]: ${descripcion}`;

        // Verificar si existe una asistencia en esa fecha para actualizarla
        const [existente] = await pool.query(
            "SELECT id_asistencia FROM asistencias WHERE id_estudiante = ? AND DATE(fecha) = DATE(?)",
            [id_estudiante, fecha_inasistencia]
        );

        if (existente.length > 0) {
            await pool.query(
                `UPDATE asistencias 
                 SET estado = 'Falla Justificada', observaciones = ? 
                 WHERE id_asistencia = ?`,
                [detalleObservacion, existente[0].id_asistencia]
            );
        } else {
            await pool.query(
                `INSERT INTO asistencias (fecha, estado, observaciones, id_estudiante, id_asignatura_curso)
                 VALUES (?, 'Falla Justificada', ?, ?, 1)`,
                [fecha_inasistencia, detalleObservacion, id_estudiante]
            );
        }

        res.status(201).json({ mensaje: "Excusa radicada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;