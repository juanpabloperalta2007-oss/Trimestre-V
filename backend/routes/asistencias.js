import { Router } from "express";
import nodemailer from "nodemailer";
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

const storageExcusas = multer.diskStorage({
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
    storage: storageExcusas,
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
// TRANSPORTADOR GMAIL (NODEMAILER)
// ======================================================
function crearTransportadorGmail() {
    const user = (process.env.EMAIL_USER || "").trim();
    const pass = (process.env.EMAIL_PASS || "").trim();

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
    });
}

function describirEstado(estadoBD) {
    switch (estadoBD) {
        case "P":
            return "Presente (Asistió)";
        case "A":
            return "Ausente (Faltó)";
        case "T":
            return "Tarde / Retardo";
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
            return {
                notificado: false,
                motivo: "No se encontró información del estudiante o asignatura."
            };
        }

        const info = infoRows[0];

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
                COALESCE(NULLIF(TRIM(p_acu.correo), ''), NULLIF(TRIM(u.login), '')) AS correo_acudiente
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
        const correoDestino =
            acudiente?.correo_acudiente && acudiente.correo_acudiente.includes("@")
                ? acudiente.correo_acudiente.trim()
                : null;

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

        const mailTransporter = crearTransportadorGmail();

        if (mailTransporter && correoDestino) {
            try {
                const infoCorreo = await mailTransporter.sendMail({
                    from: `"Sistema GAE - Liceo" <${process.env.EMAIL_USER.trim()}>`,
                    to: correoDestino,
                    subject: asunto,
                    text: mensaje,
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
                            <h3 style="margin-bottom: 8px; color: #0d6efd;">Reporte de asistencia escolar</h3>
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
                            <small style="color:#666;">Mensaje automático del Sistema de Gestión de Asistencia Escolar (GAE).</small>
                        </div>
                    `
                });
                correoEnviado = true;
                console.log("Correo enviado a:", correoDestino, "ID:", infoCorreo.messageId);
            } catch (mailError) {
                console.error("Error enviando correo Gmail a", correoDestino, ":", mailError.message);
                estadoEnvio = "Pendiente correo";
            }
        } else {
            estadoEnvio = "Sin correo";
            console.warn(
                "No se envió Gmail. Transporter listo:",
                Boolean(mailTransporter),
                "Estudiante ID:",
                idEstudiante,
                "Correo acudiente:",
                correoDestino
            );
        }

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
            correoDestino,
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
// 2B. ENVIAR ALERTAS DE INASISTENCIA A ACUDIENTES
// POST /api/asistencias/alertas/notificar
// ======================================================
router.post("/alertas/notificar", async (req, res) => {
    try {
        const { alertas: alertasEnviadas, id_usuario } = req.body || {};

        let idDocenteResuelto = null;
        if (id_usuario) {
            const [docRows] = await pool.query(
                `SELECT d.id_docente
                 FROM docentes d
                 INNER JOIN personas p ON d.id_persona = p.id_persona
                 WHERE p.id_usuario = ?
                 LIMIT 1`,
                [id_usuario]
            );
            if (docRows.length > 0) {
                idDocenteResuelto = docRows[0].id_docente;
            }
        }

        let listaAlertas =
            Array.isArray(alertasEnviadas) && alertasEnviadas.length > 0
                ? alertasEnviadas
                : null;

        if (!listaAlertas) {
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

            listaAlertas = rows.map((dato) => ({
                id_estudiante: dato.id_estudiante,
                estudiante: String(dato.estudiante || "").replace(/\s+/g, " ").trim(),
                documento: dato.documento,
                curso: dato.curso,
                inasistencias: Number(dato.inasistencias) || 0,
                tardanzas: Number(dato.tardanzas) || 0,
                total_registros: Number(dato.total_registros) || 0,
                estado: dato.estado
            }));
        }

        if (listaAlertas.length === 0) {
            return res.status(400).json({ error: "No hay alertas para enviar." });
        }

        const mailTransporter = crearTransportadorGmail();
        let correosEnviados = 0;
        let notificacionesRegistradas = 0;
        const detalles = [];

        for (const alerta of listaAlertas) {
            const idEstudiante = Number(alerta.id_estudiante);
            if (!idEstudiante) continue;

            let idDocente = idDocenteResuelto;
            if (!idDocente) {
                const [docCursoRows] = await pool.query(
                    `SELECT DISTINCT ac.id_docente
                     FROM estudiantes_cursos ec
                     INNER JOIN asignaturas_cursos ac ON ec.id_curso = ac.id_curso
                     WHERE ec.id_estudiante = ?
                       AND ac.id_docente IS NOT NULL
                     LIMIT 1`,
                    [idEstudiante]
                );
                if (docCursoRows.length > 0) {
                    idDocente = docCursoRows[0].id_docente;
                }
            }

            const [acuRows] = await pool.query(
                `SELECT
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
                    COALESCE(NULLIF(TRIM(p_acu.correo), ''), NULLIF(TRIM(u.login), '')) AS correo_acudiente
                 FROM acudientes_estudiantes ae
                 INNER JOIN acudientes acu ON ae.id_acudiente = acu.id_acudiente
                 INNER JOIN personas p_acu ON acu.id_persona = p_acu.id_persona
                 LEFT JOIN usuarios u ON p_acu.id_usuario = u.id_usuario
                 WHERE ae.id_estudiante = ?
                 LIMIT 1`,
                [idEstudiante]
            );

            const acudiente = acuRows.length > 0 ? acuRows[0] : null;
            const correoDestino =
                acudiente?.correo_acudiente && acudiente.correo_acudiente.includes("@")
                    ? acudiente.correo_acudiente.trim()
                    : null;

            const nivelTexto =
                alerta.estado === "Pérdida"
                    ? "Pérdida de materia por inasistencia"
                    : alerta.estado === "Exceso"
                    ? "Exceso de inasistencias"
                    : alerta.estado || "Alerta de inasistencia";

            const asunto = `Alerta de inasistencia (${nivelTexto}) - ${alerta.estudiante}`;
            const mensaje =
                `Estimado(a) ${acudiente?.nombre_acudiente || "acudiente"}, ` +
                `le informamos que el estudiante ${alerta.estudiante} (Doc. ${alerta.documento || "N/A"}, Curso ${alerta.curso || "N/A"}) ` +
                `presenta una alerta de tipo "${nivelTexto}" con ${alerta.inasistencias} inasistencia(s) ` +
                `y ${alerta.tardanzas} tardanza(s) en ${alerta.total_registros} registro(s). ` +
                `Por favor comuníquese con la institución o radique la excusa correspondiente.`;

            let estadoEnvio = "Enviado";
            let enviadoCorreo = false;

            if (mailTransporter && correoDestino) {
                try {
                    await mailTransporter.sendMail({
                        from: `"Sistema GAE - Liceo" <${process.env.EMAIL_USER.trim()}>`,
                        to: correoDestino,
                        subject: asunto,
                        text: mensaje,
                        html: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
                                <h3 style="margin-bottom: 8px; color: #dc3545;">Alerta de inasistencia escolar</h3>
                                <p>Estimado(a) <strong>${acudiente?.nombre_acudiente || "acudiente"}</strong>,</p>
                                <p>
                                    El estudiante <strong>${alerta.estudiante}</strong>
                                    (Documento: <strong>${alerta.documento || "N/A"}</strong> · Curso: <strong>${alerta.curso || "N/A"}</strong>)
                                    registra una alerta por <strong>${nivelTexto}</strong>:
                                </p>
                                <ul>
                                    <li><strong>Inasistencias:</strong> ${alerta.inasistencias}</li>
                                    <li><strong>Tardanzas:</strong> ${alerta.tardanzas}</li>
                                    <li><strong>Total de registros:</strong> ${alerta.total_registros}</li>
                                </ul>
                                <p>Por favor revise el reporte en el portal o comuníquese con coordinación/docente.</p>
                                <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
                                <small style="color:#666;">Mensaje automático del Sistema de Gestión de Asistencia Escolar (GAE).</small>
                            </div>
                        `
                    });
                    enviadoCorreo = true;
                    correosEnviados += 1;
                } catch (mailErr) {
                    console.error("Error enviando correo de alerta a", correoDestino, ":", mailErr.message);
                    estadoEnvio = "Pendiente correo";
                }
            } else {
                estadoEnvio = "Sin correo";
            }

            if (acudiente?.id_acudiente && idDocente) {
                await pool.query(
                    `INSERT INTO correos_notificaciones
                        (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
                     VALUES (?, ?, 'Alerta Inasistencia', ?, ?, ?, ?)`,
                    [asunto, mensaje, estadoEnvio, idDocente, acudiente.id_acudiente, idEstudiante]
                );
                notificacionesRegistradas += 1;
            }

            detalles.push({
                id_estudiante: idEstudiante,
                estudiante: alerta.estudiante,
                correoDestino,
                enviadoCorreo,
                estadoEnvio
            });
        }

        res.json({
            mensaje: `Alertas procesadas: ${listaAlertas.length} estudiante(s), ${correosEnviados} correo(s) enviado(s).`,
            total_procesadas: listaAlertas.length,
            correos_enviados: correosEnviados,
            notificaciones_registradas: notificacionesRegistradas,
            detalles
        });
    } catch (error) {
        console.error("Error al notificar alertas a acudientes:", error);
        res.status(500).json({ error: "Error al enviar las alertas a los acudientes." });
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
            AND (? IS NULL OR ? = '' OR ? = 'todos' OR MONTH(fecha) = ?)
            `,
            [id_estudiante, mes || null, mes || null, mes || null, mes || null]
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
// 6B. DETALLE CRONOLÓGICO DE ASISTENCIAS PARA ACUDIENTE
// ======================================================
router.get("/detalle/:id_estudiante", async (req, res) => {
    const { id_estudiante } = req.params;
    const { mes } = req.query;

    try {
        const [filas] = await pool.query(
            `
            SELECT 
                a.id_asistencia,
                a.fecha,
                a.estado,
                a.observaciones,
                asi.nombre_asignatura,
                c.nombre_curso
            FROM asistencias a
            INNER JOIN asignaturas_cursos ac ON a.id_asignatura_curso = ac.id_asignatura_curso
            INNER JOIN asignaturas asi ON ac.id_asignatura = asi.id_asignatura
            INNER JOIN cursos c ON ac.id_curso = c.id_curso
            WHERE a.id_estudiante = ?
              AND (? IS NULL OR ? = '' OR ? = 'todos' OR MONTH(a.fecha) = ?)
            ORDER BY a.fecha DESC, a.id_asistencia DESC
            `,
            [id_estudiante, mes || null, mes || null, mes || null, mes || null]
        );

        res.json(filas);
    } catch (error) {
        console.error("Error al obtener detalle de asistencias:", error);
        res.status(500).json({ error: "Error al obtener el detalle de asistencias." });
    }
});

// ======================================================
// 7. RADICAR EXCUSA CON SOPORTE ADJUNTO
// POST /api/asistencias/excusa
// ======================================================
router.post("/excusa", uploadSoporte.single("soporte"), async (req, res) => {
    try {
        const body = req.body || {};
        const { id_estudiante, motivo, fecha_inasistencia, descripcion, nombre_archivo } = body;

        if (!id_estudiante || !fecha_inasistencia || !descripcion) {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ error: "Faltan datos requeridos para radicar la excusa." });
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
                if (req.file?.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
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

        res.status(201).json({
            mensaje: "Excusa radicada exitosamente y enviada a coordinación.",
            soporte_archivo: nombreSoporte,
            soporte_url: req.file ? `/uploads/excusas/${req.file.filename}` : null
        });
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
            INNER JOIN asignaturas asi ON ac.id_asignatura = asi.id_asignatura
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