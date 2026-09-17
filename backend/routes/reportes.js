import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ======================================================
// OBTENER REPORTES MENSUALES
// ======================================================

router.get("/", async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT
                c.id_curso,
                c.nombre_curso AS curso,

                DATE_FORMAT(
                    a.fecha,
                    '%Y-%m'
                ) AS mes,

                COUNT(*) AS total_clases,

                SUM(
                    CASE
                        WHEN a.estado = 'Presente'
                        THEN 1
                        ELSE 0
                    END
                ) AS presentes,

                SUM(
                    CASE
                        WHEN a.estado = 'Ausente'
                        THEN 1
                        ELSE 0
                    END
                ) AS ausentes,

                SUM(
                    CASE
                        WHEN a.estado = 'Tarde'
                        THEN 1
                        ELSE 0
                    END
                ) AS tardes,

                ROUND(
                    (
                        SUM(
                            CASE
                                WHEN a.estado = 'Presente'
                                THEN 1
                                ELSE 0
                            END
                        ) / COUNT(*)
                    ) * 100,
                    2
                ) AS porcentaje

            FROM asistencias a

            INNER JOIN estudiantes_cursos ec
                ON a.id_estudiante = ec.id_estudiante

            INNER JOIN cursos c
                ON ec.id_curso = c.id_curso

            GROUP BY
                c.id_curso,
                c.nombre_curso,
                DATE_FORMAT(
                    a.fecha,
                    '%Y-%m'
                )

            ORDER BY
                mes DESC,
                c.nombre_curso ASC
        `);

        // ==================================================
        // PREPARAR DATOS PARA REACT
        // ==================================================

        const reportes = rows.map((reporte) => ({
            id_curso: reporte.id_curso,

            curso: reporte.curso,

            mes: reporte.mes,

            total_clases: Number(reporte.total_clases) || 0,

            presentes: Number(reporte.presentes) || 0,

            ausentes: Number(reporte.ausentes) || 0,

            tardes: Number(reporte.tardes) || 0,

            porcentaje: Number(reporte.porcentaje) || 0
        }));

        // ==================================================
        // RESPUESTA
        // ==================================================

        res.status(200).json(reportes);

    } catch (error) {

        console.error(
            "ERROR AL OBTENER REPORTES:",
            error
        );

        res.status(500).json({
            error: "Error al obtener los reportes",
            detalle: error.message
        });
    }
});

export default router;