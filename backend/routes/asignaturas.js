import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ==========================================
// 1. OBTENER EL CURSO DEL CUAL UN DOCENTE ES DIRECTOR
// ==========================================
router.get("/docente-curso/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const [rows] = await pool.query(
            "SELECT * FROM cursos WHERE id_director = ?",
            [id_usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "El docente no tiene un curso asignado como director." });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. OBTENER LAS MATERIAS ASIGNADAS A UN CURSO ESPECÍFICO (Para el Docente)
// ==========================================
router.get("/curso/:id_curso", async (req, res) => {
    try {
        const { id_curso } = req.params;
        const query = `
            SELECT 
                a.id_asignatura,
                a.nombre_asignatura,
                ar.nombre_area,
                ac.estado,
                ac.id_curso
            FROM asignaturas_cursos ac
            INNER JOIN asignaturas a ON ac.id_asignatura = a.id_asignatura
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE ac.id_curso = ?
            ORDER BY a.nombre_asignatura ASC
        `;
        const [rows] = await pool.query(query, [id_curso]);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener materias del curso:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. OBTENER ASIGNATURAS GENERALES (Con paginación y búsqueda para el Coordinador)
// ==========================================
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
            query += " WHERE a.nombre_asignatura LIKE ? ";
            countQuery += " WHERE a.nombre_asignatura LIKE ? ";
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

// ==========================================
// 4. ACTUALIZAR EL ESTADO DE LA MATERIA PARA UN CURSO ESPECÍFICO (Docente)
// ==========================================
router.put("/curso-estado", async (req, res) => {
    try {
        const { id_asignatura, id_curso, estado } = req.body;
        
        const query = `
            UPDATE asignaturas_cursos 
            SET estado = ? 
            WHERE id_asignatura = ? AND id_curso = ?
        `;
        const [result] = await pool.query(query, [estado, id_asignatura, id_curso]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No se encontró la asignación de la materia para este curso." });
        }

        res.json({ mensaje: "Estado de la materia actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. ASIGNAR MATERIA A UN CURSO (Para el Coordinador)
// ==========================================
router.post("/asignar", async (req, res) => {
    try {
        const { id_asignatura, id_curso } = req.body;
        
        if (!id_asignatura || !id_curso) {
            return res.status(400).json({ error: "Debe seleccionar la asignatura y el curso." });
        }

        const [existing] = await pool.query(
            "SELECT * FROM asignaturas_cursos WHERE id_asignatura = ? AND id_curso = ?",
            [id_asignatura, id_curso]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Esta asignatura ya está asignada a este curso." });
        }

        await pool.query(
            "INSERT INTO asignaturas_cursos (id_asignatura, id_curso, estado) VALUES (?, ?, 'Activo')",
            [id_asignatura, id_curso]
        );

        res.status(201).json({ mensaje: "Materia asignada al curso exitosamente" });
    } catch (error) {
        console.error("Error al asignar materia al curso:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 6. CREAR ASIGNATURA GLOBAL (Para el módulo del Coordinador)
// ==========================================
router.post("/", async (req, res) => {
    try {
        const { nombre_asignatura, id_area } = req.body;
        if (!nombre_asignatura) {
            return res.status(400).json({ error: "El nombre de la asignatura es obligatorio" });
        }

        const [result] = await pool.query(
            "INSERT INTO asignaturas (nombre_asignatura, id_area) VALUES (?, ?)",
            [nombre_asignatura, id_area || null]
        );
        
        res.status(201).json({ mensaje: "Asignatura creada correctamente", id_asignatura: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 7. ELIMINAR ASIGNATURA
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM asignaturas_cursos WHERE id_asignatura = ?", [req.params.id]);
        const [result] = await pool.query("DELETE FROM asignaturas WHERE id_asignatura = ?", [req.params.id]);
        
        if (result.affectedRows === 0) return res.status(404).json({ error: "Asignatura no encontrada" });
        res.json({ mensaje: "Asignatura eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;