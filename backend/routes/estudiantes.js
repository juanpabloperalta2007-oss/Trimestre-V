import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET / - Obtener registros de estudiantes con paginación y búsqueda
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT e.*, p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.numero_documento
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

// GET /:id - Obtener estudiante por ID
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.*, p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido, p.numero_documento
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

// POST / - Registrar un nuevo estudiante con transacción completa (Persona -> Estudiante -> Curso)
router.post("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { 
            tipo_documento, 
            numero_documento, 
            primer_nombre, 
            segundo_nombre, 
            primer_apellido, 
            segundo_apellido, 
            codigo_lista, 
            id_curso,
            estado 
        } = req.body;

        if (!numero_documento || !primer_nombre || !primer_apellido || !id_curso) {
            return res.status(400).json({ error: "Faltan campos obligatorios para completar la matrícula." });
        }

        await connection.beginTransaction();

        // 1. Insertar en la tabla personas
        const [personaResult] = await connection.query(
            `INSERT INTO personas (tipo_documento, numero_documento, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tipo_documento || 'tarjeta identidad', numero_documento, primer_nombre, segundo_nombre || null, primer_apellido, segundo_apellido || null]
        );
        const id_persona = personaResult.insertId;

        // 2. Insertar en la tabla estudiantes (asignando un valor por defecto al codigo_lista si no viene)
        const [estudianteResult] = await connection.query(
            `INSERT INTO estudiantes (id_persona, codigo_lista, estado) VALUES (?, ?, ?)`,
            [id_persona, codigo_lista || 1, estado || "Activo"]
        );
        const id_estudiante = estudianteResult.insertId;

        // 3. Vincular al curso en estudiantes_cursos (Año 2026)
        await connection.query(
            `INSERT INTO estudiantes_cursos (id_estudiante, id_curso, anio) VALUES (?, ?, ?)`,
            [id_estudiante, id_curso, 2026]
        );

        await connection.commit();
        connection.release();

        res.status(201).json({ 
            mensaje: "Estudiante matriculado exitosamente", 
            id_estudiante 
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error en transacción de matrícula:", error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /:id - Actualizar un estudiante por ID
router.put("/:id", async (q, res) => {
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

// DELETE /:id - Eliminar un estudiante por ID
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