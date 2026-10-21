import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ==========================================
// 1. OBTENER LISTA DE DOCENTES / PROFESORES (id_cargo = 3)
// IMPORTANTE: Colocar esta ruta ANTES de GET /:id para evitar conflictos de URL
// ==========================================
router.get("/docentes", async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.id_usuario,
                CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) AS nombre_completo,
                u.login AS correo
            FROM usuarios u
            INNER JOIN personas p ON u.id_usuario = p.id_usuario
            WHERE p.id_cargo = 3 AND u.estado = 'Activo'
            ORDER BY p.primer_nombre ASC
        `;
        const [docentes] = await pool.query(sql);
        res.json(docentes);
    } catch (error) {
        console.error("Error al obtener docentes:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. OBTENER CURSOS CON SU DIRECTOR Y PAGINACIÓN
// ==========================================
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        // JOIN para traer el nombre del director asignado
        let query = `
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.estado,
                c.id_director,
                CONCAT_WS(' ', p.primer_nombre, p.primer_apellido) AS director
            FROM cursos c
            LEFT JOIN usuarios u ON c.id_director = u.id_usuario
            LEFT JOIN personas p ON u.id_usuario = p.id_usuario
        `;

        let countQuery = "SELECT COUNT(*) AS total FROM cursos c";
        const params = [];

        if (search) {
            const searchCondition = " WHERE c.nombre_curso LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += " ORDER BY c.nombre_curso ASC LIMIT ? OFFSET ?";

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

// ==========================================
// 3. OBTENER ESTUDIANTES DE UN CURSO ESPECÍFICO
// ==========================================
router.get("/:id/estudiantes", async (req, res) => {
    try {
        const sql = `
            SELECT 
                e.id_estudiante,
                p.primer_nombre,
                p.primer_apellido,
                p.numero_documento
            FROM estudiantes e
            INNER JOIN personas p ON e.id_persona = p.id_persona
            INNER JOIN estudiantes_cursos ec ON e.id_estudiante = ec.id_estudiante
            WHERE ec.id_curso = ?
        `;
        const [estudiantes] = await pool.query(sql, [req.params.id]);
        res.json(estudiantes);
    } catch (error) {
        console.error("Error al obtener estudiantes del curso:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. OBTENER UN CURSO POR ID
// ==========================================
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                c.*, 
                CONCAT_WS(' ', p.primer_nombre, p.primer_apellido) AS director 
             FROM cursos c 
             LEFT JOIN usuarios u ON c.id_director = u.id_usuario 
             LEFT JOIN personas p ON u.id_usuario = p.id_usuario 
             WHERE c.id_curso = ?`,
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

// ==========================================
// 5. CREAR CURSO (Con soporte para id_director)
// ==========================================
router.post("/", async (req, res) => {
    try {
        const { nombre_curso, estado, id_director } = req.body;

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
            "INSERT INTO cursos (nombre_curso, estado, id_director) VALUES (?, ?, ?)",
            [nombre_curso, estado || "Activo", id_director || null]
        );

        res.status(201).json({
            mensaje: "Curso creado correctamente",
            id_curso: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 6. ASIGNAR / CAMBIAR DIRECTOR DE CURSO
// ==========================================
router.put("/:id/director", async (req, res) => {
    try {
        const { id_director } = req.body;

        const [result] = await pool.query(
            "UPDATE cursos SET id_director = ? WHERE id_curso = ?",
            [id_director || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json({ mensaje: "Director asignado correctamente" });
    } catch (error) {
        console.error("Error al asignar director:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 7. ACTUALIZAR CURSO GENERAL
// ==========================================
router.put("/:id", async (req, res) => {
    try {
        const { nombre_curso, estado, id_director } = req.body;

        const [result] = await pool.query(
            "UPDATE cursos SET nombre_curso = ?, estado = ?, id_director = ? WHERE id_curso = ?",
            [nombre_curso, estado, id_director || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Curso no encontrado" });
        }

        res.json({ mensaje: "Curso actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 8. ELIMINAR CURSO
// ==========================================
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