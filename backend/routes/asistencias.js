import { Router } from "express";
import nodemailer from "nodemailer";
import pool from "../db.js";

const router = Router();

// ======================================================
// TRANSPORTADOR GMAIL (NODEMAILER)
// ======================================================
const transporter =
    process.env.EMAIL_USER && process.env.EMAIL_PASS
        ? nodemailer.createTransport({
              service: "gmail",
              auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
              }
          })
        : null;

function describirEstado(estadoBD) {
    switch (estadoBD) {
        case "P":
            return "Presente (Asistió)";
        case "A":
            return "Ausente (Faltó)";
        case "T":
            return "Tarde / Retardos";
        case "J":
            return "Justificado";
        default:
            return estadoBD;
    }
}

async function notificarAcudienteAsistencia({
    idEstudiante,
    idAsignaturaCurso,
    fecha,
    estadoBD,
    observaciones
}) {
    try {
        // 1. Obtener datos del estudiante, asignatura, curso y docente
        const [infoRows] = await pool.query(
            `
            SELECT
                e.id_estudiante,
                TRIM(
                    CONCAT_WS(
                        ' ',
                        p_est.primer_nombre,
                        p_est.segundo_nombre,
                        p_est.primer_apellido,
                        p_est.segundo_apellido
                    )
                ) AS nombre_estudiante,
                c.nombre_curso,
                asi.nombre_asignatura,
                ac.id_docente
            FROM estudiantes e
            INNER JOIN personas p_est ON e.id_persona = p_est.id_persona
            INNER JOIN asignaturas_cursos ac ON ac.id_asignatura_curso = ?
            INNER JOIN cursos c ON ac.id_curso = c.id_curso
            INNER JOIN asignaturas asi ON ac.id_asignatura = asi.id_asignatura
            WHERE e.id_estudiante = ?
            LIMIT 1
            `,
            [idAsignaturaCurso, idEstudiante]
        );

        if (infoRows.length === 0) {
            return { notificado: false, motivo: "No se encontró información del estudiante o asignatura." };
        }

        const info = infoRows[0];

        // 2. Buscar acudiente vinculado y su correo electrónico
        const [acuRows] = await pool.query(
            `
            SELECT
                acu.id_acudiente,
                TRIM(
                    CONCAT_WS(
                        ' ',
                        p_acu.primer_nombre,
                        p_acu.segundo_nombre,
                        p_acu.primer_apellido,
                        p_acu.segundo_apellido
                    )
                ) AS nombre_acudiente,
                COALESCE(NULLIF(p_acu.correo, ''), NULLIF(u.correo, ''), NULLIF(u.email, '')) AS correo_acudiente
            FROM acudientes_estudiantes ae
            INNER JOIN acudientes acu ON ae.id_acudiente = acu.id_acudiente
            INNER JOIN personas p_acu ON acu.id_persona = p_acu.id_persona
            LEFT JOIN usuarios u ON p_acu.id_usuario = u.id_usuario
            WHERE ae.id_estudiante = ?
            LIMIT 1
            `,
            [idEstudiante]
        );

        const acudiente = acuRows.length > 0 ? acuRows[0] : null;
        const estadoTexto = describirEstado(estadoBD);
        const asunto = `Reporte de asistencia - ${info.nombre_estudiante} (${info.nombre_asignatura} - ${fecha})`;
        const mensaje =
            `Estimado(a) ${acudiente?.nombre_acudiente || "acudiente"}, ` +
            `se reporta que el estudiante ${info.nombre_estudiante} (Curso ${info.nombre_curso}) ` +
            `registró estado "${estadoTexto}" en la asignatura ${info.nombre_asignatura} ` +
            `el día ${fecha}.` +
            (observaciones ? ` Observación: ${observaciones}` : "");

        let estadoEnvio = "Enviado";
        let correoEnviado = false;

        // 3. Intentar enviar correo real por Gmail si hay correo del acudiente y transporter configurado
        if (transporter && acudiente?.correo_acudiente) {
            try {
                await transporter.sendMail({
                    from: `"Sistema GAE - Liceo" <${process.env.EMAIL_USER}>`,
                    to: acudiente.correo_acudiente,
                    subject: asunto,
                    text: mensaje,
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
                            <h3 style="margin-bottom: 8px;">Reporte de asistencia escolar</h3>
                            <p>Estimado(a) <strong>${acudiente.nombre_acudiente || "acudiente"}</strong>,</p>
                            <p>
                                El estudiante <strong>${info.nombre_estudiante}</strong>
                                (Curso <strong>${info.nombre_curso}</strong>) registró el estado
                                <strong>${estadoTexto}</strong> en la asignatura
                                <strong>${info.nombre_asignatura}</strong> el día <strong>${fecha}</strong>.
                            </p>
                            ${
                                observaciones
                                    ? `<p><strong>Observación:</strong> ${observaciones}</p>`
                                    : ""
                            }
                            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
                            <small style="color:#666;">Mensaje automático del sistema GAE.</small>
                        </div>
                    `
                });
                correoEnviado = true;
            } catch (mailError) {
                console.error("Error enviando correo Gmail:", mailError.message);
                estadoEnvio = "Pendiente correo";
            }
        } else {
            estadoEnvio = "Sin correo";
        }

        // 4. Registrar notificación en la tabla correos_notificaciones (si hay acudiente y docente)
        if (acudiente?.id_acudiente && info.id_docente) {
            await pool.query(
                `
                INSERT INTO correos_notificaciones
                    (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    asunto,
                    mensaje,
                    estadoBD === "A" ? "Inasistencia" : "Asistencia",
                    estadoEnvio,
                    info.id_docente,
                    acudiente.id_acudiente,
                    idEstudiante
                ]
            );
        }

        return {
            notificado: true,
            correoEnviado,
            correoDestino: acudiente?.correo_acudiente || null,
            estadoEnvio
        };
    } catch (err) {
        console.error("Error en notificarAcudienteAsistencia:", err.message);
        return { notificado: false, error: err.message };
    }
}

// ======================================================
// 1. OBTENER TODAS LAS ASISTENCIAS
// ======================================================
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                a.id_asistencia,
                a.fecha,
                a.estado,
                a.observaciones,
                a.id_estudiante,
                a.id_asignatura_curso,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.numero_documento,
                c.id_curso,
                c.nombre_curso,
                asi.id_asignatura,
                asi.nombre_asignatura
            FROM asistencias a
            INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
            INNER JOIN personas p ON e.id_persona = p.id_persona
            INNER JOIN asignaturas_cursos ac ON a.id_asignatura_curso = ac.id_asignatura_curso
            INNER JOIN cursos c ON ac.id_curso = c.id_curso
            INNER JOIN asignaturas asi ON ac.id_asignatura = asi.id_asignatura
        `;

        let countQuery = `
            SELECT COUNT(*) AS total 
            FROM asistencias a
            INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
            INNER JOIN personas p ON e.id_persona = p.id_persona
            INNER JOIN asignaturas_cursos ac ON a.id_asignatura_curso = ac.id_asignatura_curso
            INNER JOIN cursos c ON ac.id_curso = c.id_curso
            INNER JOIN asignaturas asi ON ac.id_asignatura = asi.id_asignatura
        `;

        const params = [];

        if (search.trim() !== "") {
            const condicion = `
                WHERE 
                    p.numero_documento LIKE ? 
                    OR p.primer_nombre LIKE ? 
                    OR p.primer_apellido LIKE ? 
                    OR a.estado LIKE ? 
                    OR c.nombre_curso LIKE ? 
                    OR asi.nombre_asignatura LIKE ?
            `;
            query += condicion;
            countQuery += condicion;

            const buscar = `%${search}%`;
            params.push(buscar, buscar, buscar, buscar, buscar, buscar);
        }

        query += ` ORDER BY a.fecha DESC LIMIT ? OFFSET ?`;

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);

        const total = Number(countResult[0].total) || 0;
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
        console.error("Error al obtener asistencias:", error);
        res.status(500).json({ error: "Error al obtener las asistencias." });
    }
});

// ======================================================
// 2. OBTENER ALERTAS DE INASISTENCIA
// ======================================================
router.get("/alertas", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                e.id_estudiante,
                CONCAT(
                    COALESCE(p.primer_nombre, ''), ' ',
                    COALESCE(p.segundo_nombre, ''), ' ',
                    COALESCE(p.primer_apellido, ''), ' ',
                    COALESCE(p.segundo_apellido, '')
                ) AS estudiante,
                p.numero_documento AS documento,
                COALESCE(
                    GROUP_CONCAT(DISTINCT c.nombre_curso ORDER BY c.nombre_curso SEPARATOR ', '),
                    'Sin curso'
                ) AS curso,
                SUM(CASE WHEN UPPER(TRIM(COALESCE(a.estado, ''))) = 'A' THEN 1 ELSE 0 END) AS inasistencias,
                SUM(CASE WHEN UPPER(TRIM(COALESCE(a.estado, ''))) = 'T' THEN 1 ELSE 0 END) AS tardanzas,
                COUNT(a.id_asistencia) AS total_registros,
                CASE 
                    WHEN SUM(CASE WHEN UPPER(TRIM(COALESCE(a.estado, ''))) = 'A' THEN 1 ELSE 0 END) >= 10 THEN 'Pérdida'
                    WHEN SUM(CASE WHEN UPPER(TRIM(COALESCE(a.estado, ''))) = 'A' THEN 1 ELSE 0 END) >= 5 THEN 'Exceso'
                    ELSE 'Normal'
                END AS estado
            FROM asistencias a
            INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
            INNER JOIN personas p ON e.id_persona = p.id_persona
            INNER JOIN asignaturas_cursos ac ON a.id_asignatura_curso = ac.id_asignatura_curso
            INNER JOIN cursos c ON ac.id_curso = c.id_curso
            GROUP BY e.id_estudiante, p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.numero_documento
            HAVING SUM(CASE WHEN UPPER(TRIM(COALESCE(a.estado, ''))) = 'A' THEN 1 ELSE 0 END) >= 5
            ORDER BY inasistencias DESC
        `);

        const alertas = rows.map((dato) => ({
            id_estudiante: dato.id_estudiante,
            estudiante: String(dato.estudiante || "").replace(/\s+/g, " ").trim(),
            documento: dato.documento,
            curso: dato.curso,
            inasistencias: Number(dato.inasistencias) || 0,
            tardanzas: Number(dato.tardanzas) || 0,
            total_registros: Number(dato.total_registros) || 0,
            estado: dato.estado
        }));

        res.json(alertas);
    } catch (error) {
        console.error("Error al obtener alertas:", error);
        res.status(500).json({ error: "Error al obtener las alertas de inasistencia." });
    }
});

// ======================================================
// 3. CREAR ASISTENCIA MANUAL
// ======================================================
router.post("/", async (req, res) => {
    try {
        const { fecha, estado, observaciones, id_estudiante, id_asignatura_curso } = req.body;

        if (!fecha || !estado || !id_estudiante || !id_asignatura_curso) {
            return res.status(400).json({ error: "Faltan datos obligatorios." });
        }

        const [result] = await pool.query(
            `
            INSERT INTO asistencias (fecha, estado, observaciones, id_estudiante, id_asignatura_curso)
            VALUES (?, ?, ?, ?, ?)
            `,
            [fecha, estado, observaciones || null, id_estudiante, id_asignatura_curso]
        );

        res.status(201).json({
            mensaje: "Asistencia registrada correctamente.",
            id_asistencia: result.insertId
        });
    } catch (error) {
        console.error("Error al crear asistencia:", error);
        res.status(500).json({ error: "Error al registrar la asistencia." });
    }
});

// ======================================================
// 4. ACTUALIZAR ASISTENCIA
// ======================================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, estado, observaciones, id_estudiante, id_asignatura_curso } = req.body;

        const [result] = await pool.query(
            `
            UPDATE asistencias 
            SET fecha = ?, estado = ?, observaciones = ?, id_estudiante = ?, id_asignatura_curso = ?
            WHERE id_asistencia = ?
            `,
            [fecha, estado, observaciones || null, id_estudiante, id_asignatura_curso, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Asistencia no encontrada." });
        }

        res.json({ mensaje: "Asistencia actualizada correctamente." });
    } catch (error) {
        console.error("Error al actualizar asistencia:", error);
        res.status(500).json({ error: "Error al actualizar la asistencia." });
    }
});

// ======================================================
// 5. ELIMINAR ASISTENCIA
// ======================================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM asistencias WHERE id_asistencia = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Asistencia no encontrada." });
        }

        res.json({ mensaje: "Asistencia eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar asistencia:", error);
        res.status(500).json({ error: "Error al eliminar la asistencia." });
    }
});

// ======================================================
// 6. ESTADÍSTICAS MENSUALES
// ======================================================
router.get("/estadisticas/:id_estudiante", async (req, res) => {
    const { id_estudiante } = req.params;
    const { mes } = req.query;

    try {
        const [filas] = await pool.query(
            `
            SELECT 
                SUM(CASE WHEN UPPER(TRIM(COALESCE(estado, ''))) IN ('P', 'PRESENTE') THEN 1 ELSE 0 END) AS asistencias,
                SUM(CASE WHEN UPPER(TRIM(COALESCE(estado, ''))) IN ('A', 'AUSENTE', 'EXCUSA RECHAZADA') THEN 1 ELSE 0 END) AS fallas_sin_justificar,
                SUM(CASE WHEN UPPER(TRIM(COALESCE(estado, ''))) IN ('J', 'JUSTIFICADO', 'FALLA JUSTIFICADA', 'EXCUSA PENDIENTE') THEN 1 ELSE 0 END) AS fallas_justificadas,
                SUM(CASE WHEN UPPER(TRIM(COALESCE(estado, ''))) IN ('T', 'TARDE', 'TARDÍA', 'RETARDO') THEN 1 ELSE 0 END) AS retardos
            FROM asistencias 
            WHERE id_estudiante = ? 
            AND (? IS NULL OR MONTH(fecha) = ?)
            `,
            [id_estudiante, mes || null, mes || null]
        );

        res.json({
            asistencias: Number(filas[0]?.asistencias) || 0,
            fallas_sin_justificar: Number(filas[0]?.fallas_sin_justificar) || 0,
            fallas_justificadas: Number(filas[0]?.fallas_justificadas) || 0,
            retardos: Number(filas[0]?.retardos) || 0
        });
    } catch (error) {
        console.error("Error en estadísticas:", error);
        res.status(500).json({ error: error.message });
    }
});

// ======================================================
// 7. RADICAR EXCUSA (Conectado con Gestión de Excusas del Coordinador)
// ======================================================
router.post("/excusa", async (req, res) => {
    try {
        const { id_estudiante, motivo, fecha_inasistencia, descripcion } = req.body;

        if (!id_estudiante || !fecha_inasistencia || !descripcion) {
            return res.status(400).json({ error: "Faltan datos requeridos para radicar la excusa." });
        }

        const detalleObservacion = `[EXCUSA - ${motivo || "General"}]: ${descripcion}`;

        const [existente] = await pool.query(
            `
            SELECT id_asistencia FROM asistencias 
            WHERE id_estudiante = ? AND DATE(fecha) = DATE(?) 
            LIMIT 1
            `,
            [id_estudiante, fecha_inasistencia]
        );

        if (existente.length > 0) {
            await pool.query(
                `
                UPDATE asistencias 
                SET estado = 'Excusa Pendiente', observaciones = ? 
                WHERE id_asistencia = ?
                `,
                [detalleObservacion, existente[0].id_asistencia]
            );
        } else {
            const [asigCurso] = await pool.query(
                `
                SELECT ac.id_asignatura_curso 
                FROM asignaturas_cursos ac
                INNER JOIN estudiantes_cursos ec ON ac.id_curso = ec.id_curso
                WHERE ec.id_estudiante = ?
                LIMIT 1
                `,
                [id_estudiante]
            );

            const idAsigCursoValido = asigCurso.length > 0
                ? asigCurso[0].id_asignatura_curso
                : null;

            if (!idAsigCursoValido) {
                return res.status(400).json({
                    error: "El estudiante no tiene asignaturas vinculadas a su curso aún."
                });
            }

            await pool.query(
                `
                INSERT INTO asistencias (fecha, estado, observaciones, id_estudiante, id_asignatura_curso)
                VALUES (?, 'Excusa Pendiente', ?, ?, ?)
                `,
                [fecha_inasistencia, detalleObservacion, id_estudiante, idAsigCursoValido]
            );
        }

        res.status(201).json({ mensaje: "Excusa radicada exitosamente y enviada a coordinación." });
    } catch (error) {
        console.error("Error al radicar excusa:", error);
        res.status(500).json({ error: error.message });
    }
});

// ======================================================
// 8. OBTENER LISTA DE ESTUDIANTES PARA ASISTENCIA
// ======================================================
router.get("/lista/:id_asignatura_curso", async (req, res) => {
    try {
        const { id_asignatura_curso } = req.params;
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({ mensaje: "La fecha es obligatoria." });
        }

        const id = Number(id_asignatura_curso);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ mensaje: "El ID de la asignatura/curso no es válido." });
        }

        const [rows] = await pool.query(
            `
            SELECT 
                e.id_estudiante,
                p.numero_documento,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                CONCAT(
                    COALESCE(p.primer_nombre, ''), ' ',
                    COALESCE(p.segundo_nombre, ''), ' ',
                    COALESCE(p.primer_apellido, ''), ' ',
                    COALESCE(p.segundo_apellido, '')
                ) AS nombre_completo,
                c.id_curso,
                c.nombre_curso,
                ac.id_asignatura_curso,
                asi.id_asignatura,
                asi.nombre_asignatura,
                a.id_asistencia,
                a.fecha,
                a.estado,
                a.observaciones
            FROM estudiantes e
            INNER JOIN personas p ON p.id_persona = e.id_persona
            INNER JOIN estudiantes_cursos ec ON ec.id_estudiante = e.id_estudiante
            INNER JOIN cursos c ON c.id_curso = ec.id_curso
            INNER JOIN asignaturas_cursos ac ON ac.id_curso = c.id_curso
            INNER JOIN asignaturas asi ON asi.id_asignatura = ac.id_asignatura
            LEFT JOIN asistencias a ON a.id_estudiante = e.id_estudiante 
                AND a.id_asignatura_curso = ac.id_asignatura_curso 
                AND DATE(a.fecha) = DATE(?)
            WHERE ac.id_asignatura_curso = ?
            ORDER BY p.primer_apellido ASC, p.primer_nombre ASC
            `,
            [fecha, id]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener lista:", error);
        res.status(500).json({ mensaje: "Error al obtener la lista de estudiantes.", error: error.message });
    }
});

// ======================================================
// 9. GUARDAR / ACTUALIZAR ASISTENCIA DESDE LISTA + GMAIL
// ======================================================
router.post("/lista", async (req, res) => {
    try {
        const { fecha, estado, observaciones, id_estudiante, id_asignatura_curso } = req.body || {};

        if (!fecha) {
            return res.status(400).json({ mensaje: "La fecha de asistencia es obligatoria." });
        }

        if (!estado) {
            return res.status(400).json({ mensaje: "El estado de asistencia es obligatorio." });
        }

        const estadoTexto = String(estado).toLowerCase().trim();
        let estadoBD = null;

        if (estadoTexto === "p" || estadoTexto === "presente") estadoBD = "P";
        else if (estadoTexto === "a" || estadoTexto === "ausente") estadoBD = "A";
        else if (estadoTexto === "t" || estadoTexto === "tardia" || estadoTexto === "tardía" || estadoTexto === "tarde") estadoBD = "T";
        else if (estadoTexto === "j" || estadoTexto === "justificado") estadoBD = "J";

        if (!estadoBD) {
            return res.status(400).json({ mensaje: "El estado de asistencia no es válido.", estado_recibido: estado });
        }

        const estudianteId = Number(id_estudiante);
        if (!Number.isInteger(estudianteId) || estudianteId <= 0) {
            return res.status(400).json({ mensaje: "El ID del estudiante no es válido.", id_estudiante });
        }

        const asignaturaCursoId = Number(id_asignatura_curso);
        if (!Number.isInteger(asignaturaCursoId) || asignaturaCursoId <= 0) {
            return res.status(400).json({ mensaje: "El ID de la asignatura curso no es válido.", id_asignatura_curso });
        }

        const [existente] = await pool.query(
            `
            SELECT id_asistencia FROM asistencias 
            WHERE id_estudiante = ? AND id_asignatura_curso = ? AND DATE(fecha) = DATE(?)
            LIMIT 1
            `,
            [estudianteId, asignaturaCursoId, fecha]
        );

        let resultadoNotificacion = null;

        if (existente.length > 0) {
            await pool.query(
                `
                UPDATE asistencias 
                SET estado = ?, observaciones = ? 
                WHERE id_asistencia = ?
                `,
                [estadoBD, observaciones || null, existente[0].id_asistencia]
            );

            resultadoNotificacion = await notificarAcudienteAsistencia({
                idEstudiante: estudianteId,
                idAsignaturaCurso: asignaturaCursoId,
                fecha,
                estadoBD,
                observaciones
            });

            return res.json({
                mensaje: "Asistencia actualizada correctamente.",
                notificacion: resultadoNotificacion
            });
        } else {
            const [result] = await pool.query(
                `
                INSERT INTO asistencias (fecha, estado, observaciones, id_estudiante, id_asignatura_curso)
                VALUES (?, ?, ?, ?, ?)
                `,
                [fecha, estadoBD, observaciones || null, estudianteId, asignaturaCursoId]
            );

            resultadoNotificacion = await notificarAcudienteAsistencia({
                idEstudiante: estudianteId,
                idAsignaturaCurso: asignaturaCursoId,
                fecha,
                estadoBD,
                observaciones
            });

            return res.status(201).json({
                mensaje: "Asistencia registrada correctamente.",
                id_asistencia: result.insertId,
                notificacion: resultadoNotificacion
            });
        }
    } catch (error) {
        console.error("Error al guardar asistencia desde lista:", error);
        res.status(500).json({ error: "Error al registrar la asistencia." });
    }
});

export default router;