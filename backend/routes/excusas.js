import { Router } from "express";
import pool from "../db.js";

const router = Router();

/*
=========================================================
OBTENER TODAS LAS EXCUSAS
GET /api/excusas
=========================================================
*/

router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                e.id_excusa,
                e.id_estudiante,
                e.id_acudiente,
                DATE_FORMAT(e.fecha, '%Y-%m-%d') AS fecha,
                e.motivo,
                e.estado,
                e.observaciones,
                e.fecha_creacion,

                CONCAT_WS(
                    ' ',
                    ep.primer_nombre,
                    ep.segundo_nombre,
                    ep.primer_apellido,
                    ep.segundo_apellido
                ) AS estudiante,

                CONCAT_WS(
                    ' ',
                    ap.primer_nombre,
                    ap.segundo_nombre,
                    ap.primer_apellido,
                    ap.segundo_apellido
                ) AS acudiente,

                c.nombre_curso AS curso

            FROM excusas e

            INNER JOIN estudiantes es
                ON e.id_estudiante = es.id_estudiante

            INNER JOIN personas ep
                ON es.id_persona = ep.id_persona

            INNER JOIN acudientes ac
                ON e.id_acudiente = ac.id_acudiente

            INNER JOIN personas ap
                ON ac.id_persona = ap.id_persona

            LEFT JOIN estudiantes_cursos ec
                ON es.id_estudiante = ec.id_estudiante
                AND ec.anio = YEAR(e.fecha)

            LEFT JOIN cursos c
                ON ec.id_curso = c.id_curso

            ORDER BY e.fecha_creacion DESC
        `);

        res.json(rows);

    } catch (error) {

        console.error("Error al obtener excusas:", error);

        res.status(500).json({
            error: "Error al obtener las excusas.",
            detalle: error.message
        });
    }
});


/*
=========================================================
CREAR UNA EXCUSA
POST /api/excusas
=========================================================
*/

router.post("/", async (req, res) => {

    try {

        const {
            id_estudiante,
            id_acudiente,
            fecha,
            motivo
        } = req.body;

        if (
            !id_estudiante ||
            !id_acudiente ||
            !fecha ||
            !motivo
        ) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios."
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO excusas
            (
                id_estudiante,
                id_acudiente,
                fecha,
                motivo,
                estado
            )
            VALUES (?, ?, ?, ?, 'Pendiente')
            `,
            [
                id_estudiante,
                id_acudiente,
                fecha,
                motivo
            ]
        );

        res.status(201).json({
            mensaje: "Excusa registrada correctamente.",
            id_excusa: result.insertId
        });

    } catch (error) {

        console.error("Error al crear excusa:", error);

        res.status(500).json({
            error: "Error al registrar la excusa.",
            detalle: error.message
        });
    }
});


/*
=========================================================
APROBAR EXCUSA
PUT /api/excusas/aprobar/:id
=========================================================
*/

router.put("/aprobar/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await pool.query(
            `
            UPDATE excusas
            SET estado = 'Aprobada'
            WHERE id_excusa = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                error: "Excusa no encontrada."
            });
        }

        res.json({
            mensaje: "Excusa aprobada correctamente."
        });

    } catch (error) {

        console.error("Error al aprobar excusa:", error);

        res.status(500).json({
            error: "Error al aprobar la excusa.",
            detalle: error.message
        });
    }
});


/*
=========================================================
RECHAZAR EXCUSA
PUT /api/excusas/rechazar/:id
=========================================================
*/

router.put("/rechazar/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await pool.query(
            `
            UPDATE excusas
            SET estado = 'Rechazada'
            WHERE id_excusa = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                error: "Excusa no encontrada."
            });
        }

        res.json({
            mensaje: "Excusa rechazada correctamente."
        });

    } catch (error) {

        console.error("Error al rechazar excusa:", error);

        res.status(500).json({
            error: "Error al rechazar la excusa.",
            detalle: error.message
        });
    }
});


export default router;