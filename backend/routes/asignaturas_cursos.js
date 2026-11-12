import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ==========================================
// 1. OBTENER LISTA DE DOCENTES (id_cargo = 3)
// ==========================================
router.get("/docentes", async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.id_usuario,
                p.id_persona,
                d.id_docente,
                CONCAT_WS(' ', p.primer_nombre, p.segundo_nombre, p.primer_apellido, p.segundo_apellido) AS nombre_completo,
                u.login AS correo
            FROM usuarios u
            INNER JOIN personas p ON u.id_usuario = p.id_usuario
            LEFT JOIN docentes d ON p.id_persona = d.id_persona
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
                ac.id_curso
            FROM asignaturas_cursos ac
            JOIN asignaturas a ON ac.id_asignatura = a.id_asignatura
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
// 3. REGISTRAR O ACTUALIZAR ASIGNACIÓN DE MATERIAS EN BLOQUE (Coordinador)
// ==========================================
router.post("/", async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id_curso, asignaturas } = req.body;
        
        if (!id_curso || !Array.isArray(asignaturas)) {
            return res.status(400).json({ error: "El curso y las asignaturas son obligatorios" });
        }

        await connection.beginTransaction();

        // 1. Eliminar todas las asignaciones previas de este curso para sincronizar limpiamente
        await connection.query("DELETE FROM asignaturas_cursos WHERE id_curso = ?", [id_curso]);

        // 2. Insertar cada materia seleccionada con su respectivo docente (o null)
        for (const item of asignaturas) {
            const { id_asignatura, id_docente } = item;
            let docId = id_docente ? Number(id_docente) : null;

            if (docId) {
                const [docRows] = await connection.query(
                    `SELECT d.id_docente 
                     FROM docentes d
                     LEFT JOIN personas p ON d.id_persona = p.id_persona
                     WHERE d.id_docente = ? OR p.id_persona = ? OR p.id_usuario = ?`,
                    [docId, docId, docId]
                );

                if (docRows.length > 0) {
                    docId = docRows[0].id_docente;
                } else {
                    const [personaRows] = await connection.query(
                        "SELECT id_persona FROM personas WHERE id_persona = ? OR id_usuario = ?",
                        [docId, docId]
                    );

                    if (personaRows.length > 0) {
                        const [nuevoDoc] = await connection.query(
                            "INSERT INTO docentes (id_persona) VALUES (?)",
                            [personaRows[0].id_persona]
                        );
                        docId = nuevoDoc.insertId;
                    } else {
                        docId = null;
                    }
                }
            }

            await connection.query(
                `INSERT INTO asignaturas_cursos (id_asignatura, id_curso, id_docente) 
                 VALUES (?, ?, ?)`,
                [id_asignatura, id_curso, docId]
            );
        }

        await connection.commit();
        connection.release();

        res.status(200).json({ mensaje: "Configuración guardada correctamente" });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error detallado en POST /api/asignaturas_cursos:", error);
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