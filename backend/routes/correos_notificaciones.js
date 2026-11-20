import { Router } from "express";
import pool from "../db.js";

const router = Router();

async function resolverIdAcudiente({ id_acudiente, id_usuario, correo }) {
    if (id_acudiente && Number(id_acudiente) > 0) {
        const num = Number(id_acudiente);
        const [directRows] = await pool.query(
            `SELECT id_acudiente FROM acudientes WHERE id_acudiente = ? LIMIT 1`,
            [num]
        );
        if (directRows.length > 0) return directRows[0].id_acudiente;

        const [byUserRows] = await pool.query(
            `SELECT acu.id_acudiente
             FROM acudientes acu
             INNER JOIN personas p ON acu.id_persona = p.id_persona
             LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE p.id_usuario = ? OR u.id_usuario = ?
             LIMIT 1`,
            [num, num]
        );
        if (byUserRows.length > 0) return byUserRows[0].id_acudiente;
    }

    if (id_usuario && Number(id_usuario) > 0) {
        const numUser = Number(id_usuario);
        const [rows] = await pool.query(
            `SELECT acu.id_acudiente
             FROM acudientes acu
             INNER JOIN personas p ON acu.id_persona = p.id_persona
             LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE p.id_usuario = ? OR u.id_usuario = ?
             LIMIT 1`,
            [numUser, numUser]
        );
        if (rows.length > 0) return rows[0].id_acudiente;
    }

    if (correo && String(correo).trim() !== "") {
        const emailLimpio = String(correo).trim().toLowerCase();
        const [rows] = await pool.query(
            `SELECT acu.id_acudiente
             FROM acudientes acu
             INNER JOIN personas p ON acu.id_persona = p.id_persona
             LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
             WHERE LOWER(TRIM(COALESCE(p.correo, ''))) = ?
                OR LOWER(TRIM(COALESCE(u.login, ''))) = ?
             LIMIT 1`,
            [emailLimpio, emailLimpio]
        );
        if (rows.length > 0) return rows[0].id_acudiente;
    }

    return null;
}

function normalizarNotificacion(row, index) {
    const idReal =
        row.id_notificacion ??
        row.id_correo ??
        row.id_correo_notificacion ??
        row.id ??
        index + 1;

    const fechaReal =
        row.fecha_envio ??
        row.fecha ??
        row.fecha_creacion ??
        row.created_at ??
        null;

    const nombreDocente =
        [
            row.doc_primer_nombre,
            row.doc_segundo_nombre,
            row.doc_primer_apellido,
            row.doc_segundo_apellido
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || "Coordinación / Sistema GAE";

    const nombreEstudiante =
        [
            row.est_primer_nombre,
            row.est_segundo_nombre,
            row.est_primer_apellido,
            row.est_segundo_apellido
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || "";

    return {
        ...row,
        id: idReal,
        id_correo: idReal,
        fecha_envio: fechaReal,
        nombre_estudiante: nombreEstudiante,
        remitente_nombre: nombreDocente,
        nombre_docente: nombreDocente,
        rol: row.id_docente ? "Docente" : "Coordinación"
    };
}

// ======================================================
// OBTENER NOTIFICACIONES POR ACUDIENTE
// GET /api/correos_notificaciones/acudiente/:idAcudiente
// ======================================================
router.get("/acudiente/:idAcudiente", async (req, res) => {
    try {
        const { idAcudiente } = req.params;
        const { correo } = req.query || {};

        const acudienteResuelto = await resolverIdAcudiente({
            id_acudiente: idAcudiente,
            id_usuario: idAcudiente,
            correo
        });

        if (!acudienteResuelto) {
            return res.json([]);
        }

        const [rows] = await pool.query(
            `
            SELECT
                cn.*,
                p_est.primer_nombre AS est_primer_nombre,
                p_est.segundo_nombre AS est_segundo_nombre,
                p_est.primer_apellido AS est_primer_apellido,
                p_est.segundo_apellido AS est_segundo_apellido,
                p_doc.primer_nombre AS doc_primer_nombre,
                p_doc.segundo_nombre AS doc_segundo_nombre,
                p_doc.primer_apellido AS doc_primer_apellido,
                p_doc.segundo_apellido AS doc_segundo_apellido
            FROM correos_notificaciones cn
            LEFT JOIN estudiantes e ON cn.id_estudiante = e.id_estudiante
            LEFT JOIN personas p_est ON e.id_persona = p_est.id_persona
            LEFT JOIN docentes d ON cn.id_docente = d.id_docente
            LEFT JOIN personas p_doc ON d.id_persona = p_doc.id_persona
            WHERE cn.id_acudiente = ?
            `,
            [acudienteResuelto]
        );

        const normalizadas = rows.map(normalizarNotificacion).reverse();
        res.json(normalizadas);
    } catch (error) {
        console.error("ERROR AL OBTENER NOTIFICACIONES DE ACUDIENTE:", error);
        res.status(500).json({
            error: "Error al consultar las notificaciones del acudiente.",
            detalle: error.message
        });
    }
});

// ======================================================
// OBTENER NOTIFICACIONES (POR ACUDIENTE, DOCENTE O TODAS)
// GET /api/correos_notificaciones  |  GET /api/notificaciones
// ======================================================
router.get("/", async (req, res) => {
    try {
        const { id_acudiente, id_docente, id_usuario, correo } = req.query || {};

        let sql = `
            SELECT
                cn.*,
                p_est.primer_nombre AS est_primer_nombre,
                p_est.segundo_nombre AS est_segundo_nombre,
                p_est.primer_apellido AS est_primer_apellido,
                p_est.segundo_apellido AS est_segundo_apellido,
                p_doc.primer_nombre AS doc_primer_nombre,
                p_doc.segundo_nombre AS doc_segundo_nombre,
                p_doc.primer_apellido AS doc_primer_apellido,
                p_doc.segundo_apellido AS doc_segundo_apellido
            FROM correos_notificaciones cn
            LEFT JOIN estudiantes e ON cn.id_estudiante = e.id_estudiante
            LEFT JOIN personas p_est ON e.id_persona = p_est.id_persona
            LEFT JOIN docentes d ON cn.id_docente = d.id_docente
            LEFT JOIN personas p_doc ON d.id_persona = p_doc.id_persona
        `;

        const condiciones = [];
        const params = [];

        const acudienteResuelto = await resolverIdAcudiente({
            id_acudiente,
            id_usuario,
            correo
        });

        if (acudienteResuelto) {
            condiciones.push("cn.id_acudiente = ?");
            params.push(acudienteResuelto);
        } else if (id_acudiente || id_usuario || correo) {
            return res.json([]);
        }

        if (id_docente && Number(id_docente) > 0) {
            condiciones.push("cn.id_docente = ?");
            params.push(Number(id_docente));
        }

        if (condiciones.length > 0) {
            sql += ` WHERE ${condiciones.join(" AND ")}`;
        }

        const [rows] = await pool.query(sql, params);
        res.json(rows.map(normalizarNotificacion).reverse());
    } catch (error) {
        console.error("ERROR AL OBTENER NOTIFICACIONES:", error);
        res.status(500).json({
            error: "Error al consultar las notificaciones.",
            detalle: error.message
        });
    }
});

// ======================================================
// CREAR NOTIFICACIÓN MANUAL / DESDE FRONTEND
// POST /api/correos_notificaciones  |  POST /api/notificaciones
// ======================================================
router.post("/", async (req, res) => {
    try {
        const {
            asunto,
            mensaje,
            tipo_notificacion,
            estado_envio,
            id_docente,
            id_acudiente,
            id_estudiante
        } = req.body || {};

        if (!asunto || !mensaje) {
            return res.status(400).json({ error: "Asunto y mensaje son obligatorios." });
        }

        const [result] = await pool.query(
            `INSERT INTO correos_notificaciones
                (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                asunto,
                mensaje,
                tipo_notificacion || "General",
                estado_envio || "Enviado",
                id_docente || null,
                id_acudiente || null,
                id_estudiante || null
            ]
        );

        res.status(201).json({
            mensaje: "Notificación registrada correctamente.",
            id_notificacion: result.insertId
        });
    } catch (error) {
        console.error("ERROR AL CREAR NOTIFICACIÓN:", error);
        res.status(500).json({
            error: "Error al registrar la notificación.",
            detalle: error.message
        });
    }
});

export default router;