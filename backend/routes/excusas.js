import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pool from "../db.js";

const router = Router();

// ======================================================
// CONFIGURACIÓN DE MULTER PARA SOPORTES DE EXCUSAS
// ======================================================
const carpetaExcusas = path.resolve("uploads", "excusas");
fs.mkdirSync(carpetaExcusas, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, carpetaExcusas);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const baseLimpio = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .slice(0, 40);
        cb(null, `${Date.now()}-${baseLimpio}${ext}`);
    }
});

const uploadSoporte = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const permitidos = [
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];
        if (permitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Formato de archivo no permitido. Use PDF, JPG, PNG o WEBP."));
        }
    }
});

// ======================================================
// RADICAR EXCUSA CON SOPORTE ADJUNTO
// POST /api/excusas
// ======================================================
router.post("/", uploadSoporte.single("soporte"), async (req, res) => {
    try {
        const body = req.body || {};
        const { id_estudiante, motivo, fecha_inasistencia, descripcion, nombre_archivo } = body;

        if (!id_estudiante || !fecha_inasistencia || !descripcion) {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                error: "Faltan datos requeridos para radicar la excusa."
            });
        }

        const nombreSoporte = req.file
            ? req.file.filename
            : nombre_archivo
            ? String(nombre_archivo).trim()
            : null;

        const detalleObservacion = nombreSoporte
            ? `[EXCUSA - ${motivo || "General"}]: ${descripcion} [Soporte: ${nombreSoporte}]`
            : `[EXCUSA - ${motivo || "General"}]: ${descripcion}`;

        const [existente] = await pool.query(
            `SELECT id_asistencia
             FROM asistencias
             WHERE id_estudiante = ? AND DATE(fecha) = DATE(?)
             LIMIT 1`,
            [id_estudiante, fecha_inasistencia]
        );

        if (existente.length > 0) {
            await pool.query(
                `UPDATE asistencias
                 SET estado = 'Excusa Pendiente', observaciones = ?
                 WHERE id_asistencia = ?`,
                [detalleObservacion, existente[0].id_asistencia]
            );
        } else {
            const [asigCurso] = await pool.query(
                `SELECT ac.id_asignatura_curso
                 FROM asignaturas_cursos ac
                 INNER JOIN estudiantes_cursos ec ON ac.id_curso = ec.id_curso
                 WHERE ec.id_estudiante = ?
                 LIMIT 1`,
                [id_estudiante]
            );

            const idAsigCursoValido = asigCurso.length > 0
                ? asigCurso[0].id_asignatura_curso
                : null;

            if (!idAsigCursoValido) {
                if (req.file?.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(400).json({
                    error: "El estudiante no tiene asignaturas vinculadas a su curso aún."
                });
            }

            await pool.query(
                `INSERT INTO asistencias (fecha, estado, observaciones, id_estudiante, id_asignatura_curso)
                 VALUES (?, 'Excusa Pendiente', ?, ?, ?)`,
                [fecha_inasistencia, detalleObservacion, id_estudiante, idAsigCursoValido]
            );
        }

        res.status(201).json({
            mensaje: "Excusa radicada exitosamente y enviada a coordinación.",
            soporte_archivo: nombreSoporte,
            soporte_url: req.file ? `/uploads/excusas/${req.file.filename}` : null
        });
    } catch (error) {
        console.error("ERROR AL RADICAR EXCUSA:", error);
        res.status(500).json({
            error: error.message || "Error al radicar la excusa."
        });
    }
});

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

            let soporteArchivo = null;
            let soporteUrl = null;
            if (fila.observaciones) {
                const matchSoporte = fila.observaciones.match(/\[Soporte:\s*(.*?)\]/i);
                if (matchSoporte && matchSoporte[1]) {
                    soporteArchivo = matchSoporte[1].trim();
                    const rutaFisica = path.join(carpetaExcusas, soporteArchivo);
                    if (fs.existsSync(rutaFisica)) {
                        soporteUrl = `/uploads/excusas/${encodeURIComponent(soporteArchivo)}`;
                    }
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
                observaciones: fila.observaciones || "",
                soporte_archivo: soporteArchivo,
                soporte_url: soporteUrl
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
        const { comentario } = req.body || {};
        const comentarioLimpio = comentario ? String(comentario).trim() : "";

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

        const nuevaObservacionAprobada = comentarioLimpio
            ? `${excusa.observaciones || ""} [Coord. Aprobada: ${comentarioLimpio}]`.trim()
            : `${excusa.observaciones || ""} [Coord. Aprobada]`.trim();

        // 2. Marcar como 'Falla Justificada' el registro principal
        await pool.query(
            `UPDATE asistencias
             SET estado = 'Falla Justificada', observaciones = ?
             WHERE id_asistencia = ?`,
            [nuevaObservacionAprobada, id]
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
        const mensaje = comentarioLimpio
            ? `Coordinación aprobó la excusa de ${nombreEstudiante} para la fecha ${excusa.fecha_str}. Motivo: ${comentarioLimpio}. Su asistencia de ese día ha sido marcada como justificada.`
            : `Coordinación aprobó la excusa de ${nombreEstudiante} para la fecha ${excusa.fecha_str}. Su asistencia de ese día ha sido marcada como justificada.`;

        for (const doc of docentes) {
            await pool.query(
                `INSERT INTO correos_notificaciones
                    (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
                 VALUES (?, ?, 'Excusa Aprobada', 'Enviado', ?, ?, ?)`,
                [asunto, mensaje, doc.id_docente, idAcudiente, excusa.id_estudiante]
            );
        }

        res.json({
            mensaje: "Excusa aprobada, asistencia justificada y docentes notificados.",
            fecha: excusa.fecha_str,
            id_estudiante: excusa.id_estudiante,
            docentes_notificados: docentes.length,
            comentario: comentarioLimpio || null
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
        const { comentario } = req.body || {};
        const comentarioLimpio = comentario ? String(comentario).trim() : "";

        const [excusas] = await pool.query(
            `SELECT observaciones
             FROM asistencias
             WHERE id_asistencia = ?`,
            [id]
        );

        if (excusas.length === 0) {
            return res.status(404).json({ error: "Excusa no encontrada." });
        }

        const obsActual = excusas[0].observaciones || "";
        const nuevaObsRechazada = comentarioLimpio
            ? `${obsActual} [Coord. Rechazada: ${comentarioLimpio}]`.trim()
            : `${obsActual} [Coord. Rechazada]`.trim();

        const [result] = await pool.query(
            `UPDATE asistencias
             SET estado = 'Excusa Rechazada', observaciones = ?
             WHERE id_asistencia = ?`,
            [nuevaObsRechazada, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Excusa no encontrada." });
        }

        res.json({
            mensaje: "Excusa rechazada correctamente.",
            comentario: comentarioLimpio || null
        });
    } catch (error) {
        console.error("ERROR AL RECHAZAR EXCUSA:", error);
        res.status(500).json({
            error: "Error al rechazar la excusa.",
            detalle: error.message
        });
    }
});

export default router;