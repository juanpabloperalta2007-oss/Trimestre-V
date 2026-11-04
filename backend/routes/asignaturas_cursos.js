import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ==========================================
// 1. OBTENER TODAS LAS MATERIAS Y CURSOS ASIGNADOS A UN DOCENTE ESPECÍFICO
// ==========================================
router.get("/docente/:id_usuario", async (req, res) => {
    try {
        const { id_usuario } = req.params;
        console.log("=== BUSCANDO MATERIAS PARA DOCENTE ID_USUARIO:", id_usuario);

        const query = `
            SELECT 
                ac.id_asignatura_curso,
                a.id_asignatura,
                COALESCE(a.nombre_asignatura, 'Sin asignatura') AS nombre_asignatura,
                c.id_curso,
                COALESCE(c.nombre_curso, CONCAT('Curso ', c.id_curso)) AS nombre_curso,
                ar.nombre_area
            FROM asignaturas_cursos ac
            JOIN asignaturas a ON ac.id_asignatura = a.id_asignatura
            JOIN cursos c ON ac.id_curso = c.id_curso
            LEFT JOIN areas ar ON a.id_area = ar.id_area
            WHERE ac.id_docente IN (
                SELECT d.id_docente 
                FROM docentes d 
                JOIN personas p ON d.id_persona = p.id_persona 
                WHERE p.id_usuario = ? OR p.id_persona = ?
            )
            OR ac.id_docente = ?
            ORDER BY c.nombre_curso ASC, a.nombre_asignatura ASC
        `;

        const [rows] = await pool.query(query, [id_usuario, id_usuario, id_usuario]);
        console.log("Materias encontradas (Debe mostrar las 4):", rows);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener asignaturas del docente:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. OBTENER TODAS LAS ASIGNACIONES DETALLADAS (Coordinador)
// ==========================================
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ac.*, a.nombre_asignatura, c.nombre_curso, p.primer_nombre AS docente_nombre, p.primer_apellido AS docente_apellido
            FROM asignaturas_cursos ac
            JOIN asignaturas a ON ac.id_asignatura = a.id_asignatura
            JOIN cursos c ON ac.id_curso = c.id_curso
            LEFT JOIN docentes d ON ac.id_docente = d.id_docente
            LEFT JOIN personas p ON d.id_persona = p.id_persona
        `);
        res.json({ cargas_academicas: rows });
    } catch (error) {
        console.error("Error en GET /api/asignaturas:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. REGISTRAR O ACTUALIZAR ASIGNACIÓN DE MATERIA A CURSO
// ==========================================
router.post("/", async (req, res) => {
    try {
        const { id_asignatura, id_curso, id_docente } = req.body;
        
        if (!id_asignatura || !id_curso) {
            return res.status(400).json({ error: "Asignatura y curso son obligatorios" });
        }

        let docId = id_docente ? Number(id_docente) : null;

        if (docId) {
            const [docRows] = await pool.query(
                "SELECT id_docente FROM docentes WHERE id_docente = ? OR id_persona = ?", 
                [docId, docId]
            );
            if (docRows.length > 0) {
                docId = docRows[0].id_docente;
            } else {
                docId = null; 
            }
        }

        const [result] = await pool.query(
            `INSERT INTO asignaturas_cursos (id_asignatura, id_curso, id_docente) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE id_docente = VALUES(id_docente)`,
            [id_asignatura, id_curso, docId]
        );

        res.status(201).json({ 
            mensaje: "Asignación académica registrada correctamente", 
            id_asignatura_curso: result.insertId || result.affectedRows 
        });
    } catch (error) {
        console.error("Error detallado en POST /api/asignaturas:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. ELIMINAR ASIGNACIÓN ESPECÍFICA
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM asignaturas_cursos WHERE id_asignatura_curso = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Asignación no encontrada" });
        res.json({ mensaje: "Asignación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;