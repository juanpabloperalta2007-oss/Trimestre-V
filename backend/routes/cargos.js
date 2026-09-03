import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_cargo, nombre_cargo 
            FROM cargos`);
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

        let query = "SELECT * FROM cargos";
        let countQuery = "SELECT COUNT(*) AS total FROM cargos";
        const params = [];

        if (search) {
            const searchCondition = " WHERE nombre_cargo LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += " ORDER BY nombre_cargo ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.json({
            cargos: rows,
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
        const [rows] = await pool.query("SELECT * FROM cargos WHERE id_cargo = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ mensaje: "Cargo no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { nombre_cargo } = req.body;
        if (!nombre_cargo) return res.status(400).json({ error: "El nombre del cargo es obligatorio" });

        const [result] = await pool.query("INSERT INTO cargos (nombre_cargo) VALUES (?)", [nombre_cargo]);
        res.status(201).json({ mensaje: "Cargo creado correctamente", id_cargo: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { nombre_cargo } = req.body;
        const [result] = await pool.query("UPDATE cargos SET nombre_cargo = ? WHERE id_cargo = ?", [nombre_cargo, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Cargo no encontrado" });
        res.json({ mensaje: "Cargo actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM cargos WHERE id_cargo = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Cargo no encontrado" });
        res.json({ mensaje: "Cargo eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;