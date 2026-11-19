import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ======================================================
// OBTENER EXCUSAS
// GET /api/excusas
// ======================================================
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                a.id_asistencia AS id,
                a.id_estudiante,
                CONCAT(
                    COALESCE(p.primer_nombre, ''),
                    ' ',
                    COALESCE(p.segundo_nombre, ''),
                    ' ',
                    COALESCE(p.primer_apellido, ''),
                    ' ',
                    COALESCE(p.segundo_apellido, '')
                ) AS estudiante,
                DATE_FORMAT(a.fecha, '%Y-%m-%d') AS fecha,
                a.observaciones,
                a.estado
            FROM asistencias a
            INNER JOIN estudiantes e
                ON a.id_estudiante = e.id_estudiante
            INNER JOIN personas p
                ON e.id_persona = p.id_persona
            WHERE
                a.observaciones IS NOT NULL
                AND (
                    a.observaciones LIKE '%EXCUSA%'
                    OR a.estado = 'Excusa Pendiente'
                    OR a.estado = 'Excusa Rechazada'
                    OR a.estado = 'Falla Justificada'
                )
            ORDER BY a.fecha DESC
        `);

        const excusas = rows.map((fila) => {
            let motivo = "General";

            if (fila.observaciones) {
                const coincidencia = fila.observaciones.match(/\[EXCUSA\s*-\s*(.*?)\]:/i);
                if (coincidencia && coincidencia[1]) {
                    motivo = coincidencia[1].trim();
                }
            }

            let estado = "Pendiente";
            if (fila.estado === "Excusa Pendiente") {
                estado = "Pendiente";
            } else if (fila.estado === "Falla Justificada") {
                estado = "Aprobada";
            } else if (fila.estado === "Excusa Rechazada") {
                estado = "Rechazada";
            } else {
                estado = fila.estado || "Pendiente";
            }

            return {
                id: fila.id,
                id_estudiante: fila.id_estudiante,
                estudiante: fila.estudiante.replace(/\s+/g, " ").trim(),
                fecha: fila.fecha,
                motivo,
                estado,
                observaciones: fila.observaciones || ""
            };
        });

        res.json(excusas);
    } catch (error) {
        console.error("ERROR AL OBTENER EXCUSAS:", error);
        res.status(500).json({
            error: "Error al consultar las excusas.",
            detalle: error.message
        });
    }
});

// ======================================================
// APROBAR EXCUSA, JUSTIFICAR EL DÍA Y NOTIFICAR DOCENTES
// PUT /api/excusas/aprobar/:id
// ======================================================
router.put("/aprobar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener excusa, estudiante y fecha
        const [excusas] = await pool.query(
            `SELECT
                a.id_asistencia,
                a.id_estudiante,
                DATE_FORMAT(a.fecha, '%Y-%m-%d') AS fecha_str,
                a.observaciones,
                CONCAT(
                    COALESCE(p.primer_nombre, ''),
                    ' ',
                    COALESCE(p.primer_apellido, '')
                ) AS nombre_estudiante
             FROM asistencias a
             INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
             INNER JOIN personas p ON e.id_persona = p.id_persona
             WHERE a.id_asistencia = ?`,
            [id]
        );

        if (excusas.length === 0) {
            return res.status(404).json({ error: "Excusa no encontrada." });
        }

        const excusa = excusas[0];
        const nombreEstudiante = excusa.nombre_estudiante.trim() || "Estudiante";

        // 2. Marcar como 'Falla Justificada' el registro principal
        await pool.query(
            `UPDATE asistencias
             SET estado = 'Falla Justificada'
             WHERE id_asistencia = ?`,
            [id]
        );

        // 3. Justificar también otras faltas/tardanzas del mismo estudiante en esa fecha
        await pool.query(
            `UPDATE asistencias
             SET estado = 'Falla Justificada',
                 observaciones = CASE
                     WHEN observaciones IS NULL OR TRIM(observaciones) = ''
                         THEN CONCAT('Justificada por excusa aprobada (', ?, ')')
                     WHEN observaciones NOT LIKE '%excusa aprobada%'
                         THEN CONCAT(observaciones, ' | Excusa aprobada')
                     ELSE observaciones
                 END
             WHERE id_estudiante = ?
               AND DATE(fecha) = ?
               AND id_asistencia <> ?
               AND estado IN ('Ausente', 'Tarde', 'Excusa Pendiente')`,
            [excusa.fecha_str, excusa.id_estudiante, excusa.fecha_str, id]
        );

        // 4. Buscar acudiente vinculado (si existe) y docentes del curso del estudiante
        const [acudientes] = await pool.query(
            `SELECT id_acudiente
             FROM acudientes_estudiantes
             WHERE id_estudiante = ?
             LIMIT 1`,
            [excusa.id_estudiante]
        );
        const idAcudiente = acudientes.length > 0 ? acudientes[0].id_acudiente : null;

        const [docentes] = await pool.query(
            `SELECT DISTINCT ac.id_docente
             FROM estudiantes_cursos ec
             INNER JOIN asignaturas_cursos ac ON ec.id_curso = ac.id_curso
             WHERE ec.id_estudiante = ?
               AND ac.id_docente IS NOT NULL`,
            [excusa.id_estudiante]
        );

        const asunto = `Excusa aprobada - ${nombreEstudiante} (${excusa.fecha_str})`;
        const mensaje = `Coordinación aprobó la excusa de ${nombreEstudiante} para la fecha ${excusa.fecha_str}. Su asistencia de ese día ha sido marcada como justificada.`;

        if (docentes.length > 0) {
            for (const doc of docentes) {
                await pool.query(
                    `INSERT INTO correos_notificaciones
                        (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
                     VALUES (?, ?, 'Excusa Aprobada', 'Enviado', ?, ?, ?)`,
                    [asunto, mensaje, doc.id_docente, idAcudiente, excusa.id_estudiante]
                );
            }
        } else {
            await pool.query(
                `INSERT INTO correos_notificaciones
                    (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
                 VALUES (?, ?, 'Excusa Aprobada', 'Enviado', NULL, ?, ?)`,
                [asunto, mensaje, idAcudiente, excusa.id_estudiante]
            );
        }

        res.json({
            mensaje: "Excusa aprobada, asistencia justificada y docentes notificados.",
            fecha: excusa.fecha_str,
            id_estudiante: excusa.id_estudiante,
            docentes_notificados: docentes.length
        });
    } catch (error) {
        console.error("ERROR AL APROBAR EXCUSA:", error);
        res.status(500).json({
            error: "Error al aprobar la excusa.",
            detalle: error.message
        });
    }
});

// ======================================================
// RECHAZAR EXCUSA
// PUT /api/excusas/rechazar/:id
// ======================================================
router.put("/rechazar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `UPDATE asistencias
             SET estado = 'Excusa Rechazada'
             WHERE id_asistencia = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Excusa no encontrada." });
        }

        res.json({ mensaje: "Excusa rechazada correctamente." });
    } catch (error) {
        console.error("ERROR AL RECHAZAR EXCUSA:", error);
        res.status(500).json({
            error: "Error al rechazar la excusa.",
            detalle: error.message
        });
    }
});

export default router;