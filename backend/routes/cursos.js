import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_curso, nombre_curso, estado
            FROM cursos`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los cursos
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM cursos";
        let countQuery = "SELECT COUNT(*) AS total FROM cursos";
        const params = [];

        if (search) {
            const searchCondition = " WHERE nombre_curso LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += " ORDER BY nombre_curso ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            cursos: rows,
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

// Obtener un curso por ID
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM cursos WHERE id_curso = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "Curso no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear curso
router.post("/", async (req, res) => {
    try {
        const { nombre_curso, estado } = req.body;

        if (!nombre_curso) {
            return res.status(400).json({ error: "El nombre del curso es obligatorio" });
        }

        const [existing] = await pool.query(
            "SELECT id_curso FROM cursos WHERE nombre_curso = ?",
            [nombre_curso]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Ya existe un curso con ese nombre" });
        }

        const [result] = await pool.query(
            "INSERT INTO cursos (nombre_curso, estado) VALUES (?, ?)",
            [nombre_curso, estado || "Activo"]
        );

        res.status(201).json({
            mensaje: "Curso creado correctamente",
            id_curso: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar curso
router.put("/:id", async (req, res) => {
    try {
        const { nombre_curso, estado } = req.body;

        const [result] = await pool.query(
            "UPDATE cursos SET nombre_curso = ?, estado = ? WHERE id_curso = ?",
            [nombre_curso, estado, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json({ mensaje: "Curso actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar curso
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM cursos WHERE id_curso = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json({ mensaje: "Curso eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;