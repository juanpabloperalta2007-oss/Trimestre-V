import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_docente, id_persona, id_cargo
            FROM docentes`);
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
            SELECT d.*, p.primer_nombre, p.primer_apellido, p.numero_documento, c.nombre_cargo 
            FROM docentes d
            JOIN personas p ON d.id_persona = p.id_persona
            LEFT JOIN cargos c ON d.id_cargo = c.id_cargo
        `;
        let countQuery = `
            SELECT COUNT(*) AS total FROM docentes d
            JOIN personas p ON d.id_persona = p.id_persona
        `;
        const params = [];

        if (search) {
            const searchCondition = " WHERE p.primer_nombre LIKE ? OR p.primer_apellido LIKE ? OR p.numero_documento LIKE ? ";
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
            docentes: rows,
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
            SELECT d.*, p.primer_nombre, p.primer_apellido, p.numero_documento, c.nombre_cargo 
            FROM docentes d
            JOIN personas p ON d.id_persona = p.id_persona
            LEFT JOIN cargos c ON d.id_cargo = c.id_cargo
            WHERE d.id_docente = ?`, [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ mensaje: "Docente no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { id_persona, id_cargo } = req.body;
        if (!id_persona) return res.status(400).json({ error: "El id_persona es obligatorio" });

        const [existing] = await pool.query("SELECT id_docente FROM docentes WHERE id_persona = ?", [id_persona]);
        if (existing.length > 0) return res.status(400).json({ error: "Esta persona ya está registrada como docente" });

        const [result] = await pool.query("INSERT INTO docentes (id_persona, id_cargo) VALUES (?, ?)", [id_persona, id_cargo || null]);
        res.status(201).json({ mensaje: "Docente registrado correctamente", id_docente: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id_cargo } = req.body;
        const [result] = await pool.query("UPDATE docentes SET id_cargo = ? WHERE id_docente = ?", [id_cargo || null, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Docente no encontrado" });
        res.json({ mensaje: "Docente actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM docentes WHERE id_docente = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Docente no encontrado" });
        res.json({ mensaje: "Docente eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;