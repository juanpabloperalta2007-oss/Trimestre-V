import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_area, nombre_area
            FROM areas`);
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

        let query = "SELECT * FROM areas";
        let countQuery = "SELECT COUNT(*) AS total FROM areas";
        const params = [];

        if (search) {
            const searchCondition = " WHERE nombre_area LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += " ORDER BY nombre_area ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.json({
            areas: rows,
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

router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM areas WHERE id_area = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ mensaje: "Área no encontrada" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { nombre_area } = req.body;
        if (!nombre_area) return res.status(400).json({ error: "El nombre del área es obligatorio" });

        const [result] = await pool.query("INSERT INTO areas (nombre_area) VALUES (?)", [nombre_area]);
        res.status(201).json({ mensaje: "Área creada correctamente", id_area: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { nombre_area } = req.body;
        const [result] = await pool.query("UPDATE areas SET nombre_area = ? WHERE id_area = ?", [nombre_area, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Área no encontrada" });
        res.json({ mensaje: "Área actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM areas WHERE id_area = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Área no encontrada" });
        res.json({ mensaje: "Área eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;