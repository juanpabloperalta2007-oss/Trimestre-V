import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_asignatura, nombre_asignatura, id_area
            FROM asignaturas`);
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

        let query = `
            SELECT a.*, ar.nombre_area 
            FROM asignaturas a
            LEFT JOIN areas ar ON a.id_area = ar.id_area
        `;
        let countQuery = "SELECT COUNT(*) AS total FROM asignaturas a";
        const params = [];

        if (search) {
            const searchCondition = " WHERE a.nombre_asignatura LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += " ORDER BY a.nombre_asignatura ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.json({
            asignaturas: rows,
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
        const [rows] = await pool.query(`
            SELECT a.*, ar.nombre_area 
            FROM asignaturas a
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE a.id_asignatura = ?`, [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ mensaje: "Asignatura no encontrada" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { nombre_asignatura, id_area } = req.body;
        if (!nombre_asignatura) return res.status(400).json({ error: "El nombre de la asignatura es obligatorio" });

        const [result] = await pool.query(
            "INSERT INTO asignaturas (nombre_asignatura, id_area) VALUES (?, ?)",
            [nombre_asignatura, id_area || null]
        );
        res.status(201).json({ mensaje: "Asignatura creada correctamente", id_asignatura: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { nombre_asignatura, id_area } = req.body;
        const [result] = await pool.query(
            "UPDATE asignaturas SET nombre_asignatura = ?, id_area = ? WHERE id_asignatura = ?",
            [nombre_asignatura, id_area || null, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Asignatura no encontrada" });
        res.json({ mensaje: "Asignatura actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM asignaturas WHERE id_asignatura = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Asignatura no encontrada" });
        res.json({ mensaje: "Asignatura eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;