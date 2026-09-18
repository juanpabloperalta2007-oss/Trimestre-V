import { Router } from "express";
import pool from "../db.js";

const router = Router();

/*
==========================================================
GET /api/reportes
Obtener información para los reportes
==========================================================
*/
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                a.id_asistencia,
                a.fecha,
                a.estado,
                a.observaciones,

                e.id_estudiante,

                p.numero_documento,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido

            FROM asistencias a

            INNER JOIN estudiantes e
                ON a.id_estudiante = e.id_estudiante

            INNER JOIN personas p
                ON e.id_persona = p.id_persona

            ORDER BY a.fecha DESC
        `);

        const reportes = rows.map((registro) => ({
            id_asistencia: registro.id_asistencia,

            id_estudiante: registro.id_estudiante,

            numero_documento: registro.numero_documento,

            nombre_estudiante: [
                registro.primer_nombre,
                registro.segundo_nombre,
                registro.primer_apellido,
                registro.segundo_apellido
            ]
                .filter(Boolean)
                .join(" "),

            fecha: registro.fecha,

            estado: registro.estado,

            observaciones: registro.observaciones
        }));

        res.status(200).json({
            reportes,
            total: reportes.length
        });

    } catch (error) {
        console.error("ERROR AL OBTENER REPORTES:", error);

        res.status(500).json({
            error: "Error al obtener los reportes",
            detalle: error.message
        });
    }
});


/*
==========================================================
GET /api/reportes/resumen
Resumen general para el dashboard de reportes
==========================================================
*/
router.get("/resumen", async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT

                COUNT(*) AS total_registros,

                SUM(
                    CASE
                        WHEN LOWER(COALESCE(estado, '')) LIKE '%asistencia%'
                        OR LOWER(COALESCE(estado, '')) = 'presente'
                        THEN 1
                        ELSE 0
                    END
                ) AS asistencias,

                SUM(
                    CASE
                        WHEN LOWER(COALESCE(estado, '')) LIKE '%sin justificar%'
                        OR LOWER(COALESCE(estado, '')) LIKE '%injustificada%'
                        OR LOWER(COALESCE(estado, '')) = 'falla'
                        THEN 1
                        ELSE 0
                    END
                ) AS inasistencias,

                SUM(
                    CASE
                        WHEN LOWER(COALESCE(estado, '')) LIKE '%justificada%'
                        THEN 1
                        ELSE 0
                    END
                ) AS justificadas,

                SUM(
                    CASE
                        WHEN LOWER(COALESCE(estado, '')) LIKE '%retardo%'
                        OR LOWER(COALESCE(estado, '')) LIKE '%tarde%'
                        THEN 1
                        ELSE 0
                    END
                ) AS retardos

            FROM asistencias
        `);

        const resumen = rows[0] || {};

        res.status(200).json({
            total_registros: Number(resumen.total_registros) || 0,
            asistencias: Number(resumen.asistencias) || 0,
            inasistencias: Number(resumen.inasistencias) || 0,
            justificadas: Number(resumen.justificadas) || 0,
            retardos: Number(resumen.retardos) || 0
        });

    } catch (error) {

        console.error("ERROR AL OBTENER RESUMEN:", error);

        res.status(500).json({
            error: "Error al obtener el resumen",
            detalle: error.message
        });
    }
});


/*
==========================================================
GET /api/reportes/estudiante/:id
Reporte de un estudiante específico
==========================================================
*/
router.get("/estudiante/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT
                a.id_asistencia,
                a.fecha,
                a.estado,
                a.observaciones,

                e.id_estudiante,

                p.numero_documento,
                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido

            FROM asistencias a

            INNER JOIN estudiantes e
                ON a.id_estudiante = e.id_estudiante

            INNER JOIN personas p
                ON e.id_persona = p.id_persona

            WHERE e.id_estudiante = ?

            ORDER BY a.fecha DESC
        `, [id]);

        const reportes = rows.map((registro) => ({
            id_asistencia: registro.id_asistencia,

            id_estudiante: registro.id_estudiante,

            numero_documento: registro.numero_documento,

            nombre_estudiante: [
                registro.primer_nombre,
                registro.segundo_nombre,
                registro.primer_apellido,
                registro.segundo_apellido
            ]
                .filter(Boolean)
                .join(" "),

            fecha: registro.fecha,

            estado: registro.estado,

            observaciones: registro.observaciones
        }));

        res.status(200).json({
            reportes,
            total: reportes.length
        });

    } catch (error) {

        console.error("ERROR AL OBTENER REPORTE DEL ESTUDIANTE:", error);

        res.status(500).json({
            error: "Error al obtener el reporte del estudiante",
            detalle: error.message
        });
    }
});


export default router;