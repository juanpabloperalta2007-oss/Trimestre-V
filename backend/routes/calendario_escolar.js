
import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /todos: consultar todos los eventos
router.get("/todos", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id_evento, titulo, descripcion, fecha_inicio,
                   fecha_fin, tipo_evento, id_curso
            FROM calendario_escolar
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /: consultar eventos con paginación y búsqueda
router.get("/", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT c.*, cur.nombre_curso
            FROM calendario_escolar c
            LEFT JOIN cursos cur ON c.id_curso = cur.id_curso
        `;

        let countQuery = `
            SELECT COUNT(*) AS total
            FROM calendario_escolar c
        `;

        const params = [];

        if (search) {
            const searchCondition = `
                WHERE c.titulo LIKE ?
                   OR c.tipo_evento LIKE ?
            `;

            query += searchCondition;
            countQuery += searchCondition;

            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam);
        }

        query += " ORDER BY c.fecha_inicio ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [
            ...params,
            limit,
            offset
        ]);

        const [countResult] = await pool.query(countQuery, params);
        const total = Number(countResult[0].total);
        const totalPages = Math.ceil(total / limit);

        res.json({
            eventos: rows,
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

// POST /: crear un evento
router.post("/", async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            tipo_evento,
            id_curso
        } = req.body;

        if (!titulo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                error: "Título, fecha_inicio y fecha_fin son obligatorios"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO calendario_escolar
                (titulo, descripcion, fecha_inicio, fecha_fin,
                 tipo_evento, id_curso)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                descripcion || null,
                fecha_inicio,
                fecha_fin,
                tipo_evento || "General",
                id_curso || null
            ]
        );

        res.status(201).json({
            mensaje: "Evento creado correctamente",
            id_evento: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /:id: actualizar un evento
router.put("/:id", async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            fecha_inicio,
            fecha_fin,
            tipo_evento,
            id_curso
        } = req.body;

        const [result] = await pool.query(
            `UPDATE calendario_escolar
             SET titulo = ?, descripcion = ?, fecha_inicio = ?,
                 fecha_fin = ?, tipo_evento = ?, id_curso = ?
             WHERE id_evento = ?`,
            [
                titulo,
                descripcion,
                fecha_inicio,
                fecha_fin,
                tipo_evento,
                id_curso || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Evento no encontrado"
            });
        }

        res.json({ mensaje: "Evento actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /:id: eliminar un evento
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM calendario_escolar WHERE id_evento = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Evento no encontrado"
            });
        }

        res.json({ mensaje: "Evento eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
