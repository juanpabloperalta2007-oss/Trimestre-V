import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_estudiante, id_persona, codigo_lista, estado
            FROM estudiantes`);
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
            SELECT e.*, p.primer_nombre, p.primer_apellido, p.numero_documento
            FROM estudiantes e
            JOIN personas p ON e.id_persona = p.id_persona
        `;
        let countQuery = `
            SELECT COUNT(*) AS total FROM estudiantes e
            JOIN personas p ON e.id_persona = p.id_persona
        `;
        const params = [];

        if (search) {
            const searchCondition = " WHERE p.primer_nombre LIKE ? OR p.primer_apellido LIKE ? OR p.numero_documento LIKE ? OR e.codigo_lista LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        query += " ORDER BY p.primer_apellido ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;
        res.json({
            estudiantes: rows,
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
            SELECT e.*, p.primer_nombre, p.primer_apellido, p.numero_documento
            FROM estudiantes e
            JOIN personas p ON e.id_persona = p.id_persona
            WHERE e.id_estudiante = ?`, [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ mensaje: "Estudiante no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { id_persona, codigo_lista, estado } = req.body;
        if (!id_persona || !codigo_lista) return res.status(400).json({ error: "id_persona y codigo_lista son obligatorios" });

        const [existingCode] = await pool.query("SELECT id_estudiante FROM estudiantes WHERE codigo_lista = ?", [codigo_lista]);
        if (existingCode.length > 0) return res.status(400).json({ error: "Ya existe un estudiante con ese código de lista" });

        const [result] = await pool.query(
            "INSERT INTO estudiantes (id_persona, codigo_lista, estado) VALUES (?, ?, ?)",
            [id_persona, codigo_lista, estado || "Activo"]
        );
        res.status(201).json({ mensaje: "Estudiante registrado correctamente", id_estudiante: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { codigo_lista, estado } = req.body;
        const [result] = await pool.query(
            "UPDATE estudiantes SET codigo_lista = ?, estado = ? WHERE id_estudiante = ?",
            [codigo_lista, estado, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
        res.json({ mensaje: "Estudiante actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM estudiantes WHERE id_estudiante = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Estudiante no encontrado" });
        res.json({ mensaje: "Estudiante eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;