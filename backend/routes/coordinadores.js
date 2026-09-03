import { Router } from "express";
import pool from "../db.js";

const router = Router();


//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_coordinador, id_persona, area_asignada, estado
            FROM coordinadores`);
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
            SELECT c.*, p.primer_nombre, p.primer_apellido, p.numero_documento
            FROM coordinadores c
            JOIN personas p ON c.id_persona = p.id_persona
        `;
        let countQuery = `
            SELECT COUNT(*) AS total FROM coordinadores c
            JOIN personas p ON c.id_persona = p.id_persona
        `;
        const params = [];

        if (search) {
            const searchCondition = " WHERE p.primer_nombre LIKE ? OR p.primer_apellido LIKE ? OR c.area_asignada LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += " ORDER BY p.primer_apellido ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.json({
            coordinadores: rows,
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
            SELECT c.*, p.primer_nombre, p.primer_apellido, p.numero_documento
            FROM coordinadores c
            JOIN personas p ON c.id_persona = p.id_persona
            WHERE c.id_coordinador = ?`, [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ mensaje: "Coordinador no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { id_persona, area_asignada, estado } = req.body;
        if (!id_persona) return res.status(400).json({ error: "El id_persona es obligatorio" });

        const [result] = await pool.query(
            "INSERT INTO coordinadores (id_persona, area_asignada, estado) VALUES (?, ?, ?)",
            [id_persona, area_asignada || null, estado || "Activo"]
        );
        res.status(201).json({ mensaje: "Coordinador registrado correctamente", id_coordinador: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { area_asignada, estado } = req.body;
        const [result] = await pool.query(
            "UPDATE coordinadores SET area_asignada = ?, estado = ? WHERE id_coordinador = ?",
            [area_asignada || null, estado, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Coordinador no encontrado" });
        res.json({ mensaje: "Coordinador actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM coordinadores WHERE id_coordinador = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Coordinador no encontrado" });
        res.json({ mensaje: "Coordinador eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;