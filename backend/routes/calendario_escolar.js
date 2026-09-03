import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_evento, titulo, descripcion, fecha_inicio, 
            fecha_fin, tipo_evento, id_curso
            FROM calendario_escolar`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = "SELECT c.*, cur.nombre_curso FROM calendario_escolar c LEFT JOIN cursos cur ON c.id_curso = cur.id_curso";
        let countQuery = "SELECT COUNT(*) AS total FROM calendario_escolar c";
        const params = [];

        if (search) {
            const searchCondition = " WHERE c.titulo LIKE ? OR c.tipo_evento LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam);
        }

        query += " ORDER BY c.fecha_inicio ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.json({
            eventos: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, id_curso } = req.body;
        if (!titulo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: "Título, fecha_inicio y fecha_fin son obligatorios" });
        }

        const [result] = await pool.query(
            `INSERT INTO calendario_escolar (titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, id_curso)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion || null, fecha_inicio, fecha_fin, tipo_evento || "General", id_curso || null]
        );

        res.status(201).json({ mensaje: "Evento creado correctamente", id_evento: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, id_curso } = req.body;
        const [result] = await pool.query(
            `UPDATE calendario_escolar SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, tipo_evento = ?, id_curso = ?
             WHERE id_evento = ?`,
            [titulo, descripcion, fecha_inicio, fecha_fin, tipo_evento, id_curso || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Evento no encontrado" });
        res.json({ mensaje: "Evento actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM calendario_escolar WHERE id_evento = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Evento no encontrado" });
        res.json({ mensaje: "Evento eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;