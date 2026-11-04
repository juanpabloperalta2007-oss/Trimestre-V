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
// 2. OBTENER LAS MATERIAS ASIGNADAS A UN CURSO ESPECÍFICO
// ==========================================
router.get("/curso/:id_curso", async (req, res) => {
    try {
        const { id_curso } = req.params;
        const query = `
            SELECT 
                ac.id_asignatura_curso,
                a.id_asignatura,
                a.nombre_asignatura,
                ar.nombre_area,
                ac.id_docente,
                p.id_usuario,
                ac.id_curso
            FROM asignaturas_cursos ac
            JOIN asignaturas a ON ac.id_asignatura = a.id_asignatura
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            JOIN docentes d ON ac.id_docente = d.id_docente
            JOIN personas p ON d.id_persona = p.id_persona
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
// 3. OBTENER ASIGNATURAS GENERALES (Para el Coordinador)
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
// 4. ASIGNAR MATERIA Y DOCENTE A UN CURSO
// ==========================================
router.post("/asignar", async (req, res) => {
    try {
        const { id_asignatura, id_curso, id_docente } = req.body;
        
        if (!id_asignatura || !id_curso) {
            return res.status(400).json({ error: "Debe seleccionar la asignatura y el curso." });
        }

        const inputId = Number(id_docente);
        let idDocenteReal = null;

        if (inputId) {
            const [docRows] = await pool.query(
                `SELECT d.id_docente 
                 FROM docentes d
                 LEFT JOIN personas p ON d.id_persona = p.id_persona
                 WHERE d.id_docente = ? OR p.id_persona = ? OR p.id_usuario = ?`,
                [inputId, inputId, inputId]
            );

            if (docRows.length > 0) {
                idDocenteReal = docRows[0].id_docente;
            } else {
                const [personaRows] = await pool.query(
                    "SELECT id_persona FROM personas WHERE id_persona = ? OR id_usuario = ?",
                    [inputId, inputId]
                );

                if (personaRows.length > 0) {
                    const [nuevoDoc] = await pool.query(
                        "INSERT INTO docentes (id_persona) VALUES (?)",
                        [personaRows[0].id_persona]
                    );
                    idDocenteReal = nuevoDoc.insertId;
                }
            }
        }

        if (!idDocenteReal) {
            return res.status(400).json({ error: "El usuario seleccionado no existe en el sistema." });
        }

        const [existing] = await pool.query(
            "SELECT id_asignatura_curso FROM asignaturas_cursos WHERE id_asignatura = ? AND id_curso = ?",
            [id_asignatura, id_curso]
        );

        let result;
        if (existing.length > 0) {
            [result] = await pool.query(
                "UPDATE asignaturas_cursos SET id_docente = ? WHERE id_asignatura = ? AND id_curso = ?",
                [idDocenteReal, id_asignatura, id_curso]
            );
        } else {
            [result] = await pool.query(
                "INSERT INTO asignaturas_cursos (id_asignatura, id_curso, id_docente) VALUES (?, ?, ?)",
                [id_asignatura, id_curso, idDocenteReal]
            );
        }

        res.status(201).json({ 
            mensaje: "Materia y docente asignados al curso exitosamente",
            id_asignatura_curso: result.insertId || result.affectedRows
        });
    } catch (error) {
        console.error("Error al asignar materia al curso:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. CREAR ASIGNATURA GLOBAL
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
// 6. ELIMINAR ASIGNATURA
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

// ==========================================
// 7. OBTENER TODAS LAS MATERIAS Y CURSOS ASIGNADOS AL DOCENTE (Blindado)
// ==========================================
router.get("/docente/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;
        console.log("=== BUSCANDO MATERIAS PARA ID_USUARIO:", id_usuario);

        const query = `
            SELECT DISTINCT
                ac.id_asignatura_curso,
                a.id_asignatura,
                COALESCE(a.nombre_asignatura, 'Sin asignatura') AS nombre_asignatura,
                c.id_curso,
                COALESCE(c.nombre_curso, CONCAT('Curso ', c.id_curso)) AS nombre_curso,
                ar.nombre_area
            FROM asignaturas_cursos ac
            LEFT JOIN docentes d ON ac.id_docente = d.id_docente
            LEFT JOIN personas p ON d.id_persona = p.id_persona
            LEFT JOIN asignaturas a ON ac.id_asignatura = a.id_asignatura
            LEFT JOIN cursos c ON ac.id_curso = c.id_curso
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE p.id_usuario = ? 
               OR p.id_persona = ? 
               OR ac.id_docente IN (
                   SELECT d2.id_docente 
                   FROM docentes d2 
                   JOIN personas p2 ON d2.id_persona = p2.id_persona 
                   WHERE p2.id_usuario = ? OR p2.id_persona = ?
               )
            ORDER BY c.nombre_curso ASC, a.nombre_asignatura ASC
        `;

        const [rows] = await pool.query(query, [id_usuario, id_usuario, id_usuario, id_usuario]);
        console.log("Materias encontradas y enviadas al frontend:", rows);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener asignaturas del docente:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;