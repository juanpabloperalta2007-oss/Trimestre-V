import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ==========================================
// 1. OBTENER TODOS LOS REGISTROS (Paginado)
// ==========================================
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [rows] = await pool.query("SELECT * FROM correos_notificaciones ORDER BY fecha_envio DESC LIMIT ? OFFSET ?", [limit, offset]);
        const [countResult] = await pool.query("SELECT COUNT(*) AS total FROM correos_notificaciones");
        const total = countResult[0].total;
        res.json({
            correos: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. OBTENER NOTIFICACIONES POR ACUDIENTE
// ==========================================
router.get("/acudiente/:id_acudiente", async (req, res) => {
    const { id_acudiente } = req.params;

    try {
        const sql = `
            SELECT 
                cn.id_correo,
                cn.asunto,
                cn.mensaje,
                cn.fecha_envio,
                cn.tipo_notificacion,
                cn.estado_envio,
                CONCAT(p.primer_nombre, ' ', IFNULL(p.segundo_nombre, ''), ' ', p.primer_apellido, ' ', IFNULL(p.segundo_apellido, '')) AS remitente_nombre,
                c.nombre_cargo AS rol
            FROM correos_notificaciones cn
            INNER JOIN docentes d ON cn.id_docente = d.id_docente
            INNER JOIN personas p ON d.id_persona = p.id_persona
            LEFT JOIN cargos c ON p.id_cargo = c.id_cargo
            WHERE cn.id_acudiente = ?
            ORDER BY cn.fecha_envio DESC
            LIMIT 5
        `;

        const [rows] = await pool.query(sql, [id_acudiente]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. REGISTRAR NUEVO CORREO / NOTIFICACIÓN
// ==========================================
router.post("/", async (req, res) => {
    try {
        const { asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante } = req.body;
        if (!asunto || !mensaje || !id_docente || !id_acudiente) {
            return res.status(400).json({ error: "Asunto, mensaje, docente y acudiente son obligatorios" });
        }

        const [result] = await pool.query(
            `INSERT INTO correos_notificaciones (asunto, mensaje, tipo_notificacion, estado_envio, id_docente, id_acudiente, id_estudiante)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [asunto, mensaje, tipo_notificacion || "Inasistencia", estado_envio || "Enviado", id_docente, id_acudiente, id_estudiante || null]
        );

        res.status(201).json({ mensaje: "Notificación registrada", id_correo: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. ELIMINAR CORREO / NOTIFICACIÓN
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM correos_notificaciones WHERE id_correo = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Correo no encontrado" });
        res.json({ mensaje: "Registro eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;