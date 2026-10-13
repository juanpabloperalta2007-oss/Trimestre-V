import { Router } from "express";
import pool from "../db.js";

const router = Router();


// ======================================================
// OBTENER EXCUSAS
// GET /api/excusas
// ======================================================

router.get("/", async (req, res) => {
    try {

        const [rows] = await pool.query(`
            SELECT
                a.id_asistencia AS id,

                CONCAT(
                    COALESCE(p.primer_nombre, ''),
                    ' ',
                    COALESCE(p.segundo_nombre, ''),
                    ' ',
                    COALESCE(p.primer_apellido, ''),
                    ' ',
                    COALESCE(p.segundo_apellido, '')
                ) AS estudiante,

                DATE_FORMAT(a.fecha, '%Y-%m-%d') AS fecha,

                a.observaciones,

                a.estado

            FROM asistencias a

            INNER JOIN estudiantes e
                ON a.id_estudiante = e.id_estudiante

            INNER JOIN personas p
                ON e.id_persona = p.id_persona

            WHERE
                a.observaciones IS NOT NULL
                AND (
                    a.observaciones LIKE '%EXCUSA%'
                    OR a.estado = 'Excusa Pendiente'
                    OR a.estado = 'Excusa Rechazada'
                )

            ORDER BY a.fecha DESC
        `);


        const excusas = rows.map((fila) => {

            let motivo = "General";


            // ==========================================
            // EXTRAER MOTIVO
            // Ejemplo:
            // [EXCUSA - Médica]: Enfermedad
            // ==========================================

            if (fila.observaciones) {

                const coincidencia =
                    fila.observaciones.match(
                        /\[EXCUSA\s*-\s*(.*?)\]:/i
                    );

                if (
                    coincidencia &&
                    coincidencia[1]
                ) {
                    motivo =
                        coincidencia[1].trim();
                }
            }


            // ==========================================
            // CONVERTIR ESTADO DE BD
            // A ESTADO PARA LA INTERFAZ
            // ==========================================

            let estado = "Pendiente";


            if (
                fila.estado === "Excusa Pendiente"
            ) {

                estado = "Pendiente";

            } else if (
                fila.estado === "Falla Justificada"
            ) {

                estado = "Aprobada";

            } else if (
                fila.estado === "Excusa Rechazada"
            ) {

                estado = "Rechazada";

            } else {

                estado = fila.estado || "Pendiente";
            }


            return {

                id: fila.id,

                estudiante:
                    fila.estudiante
                        .replace(/\s+/g, " ")
                        .trim(),

                fecha: fila.fecha,

                motivo: motivo,

                estado: estado,

                observaciones:
                    fila.observaciones || ""
            };

        });


        console.log(
            "EXCUSAS ENCONTRADAS:",
            excusas.length
        );


        console.log(
            "DATOS DE EXCUSAS:",
            excusas
        );


        res.json(excusas);


    } catch (error) {

        console.error(
            "ERROR AL OBTENER EXCUSAS:",
            error
        );


        res.status(500).json({

            error:
                "Error al consultar las excusas.",

            detalle:
                error.message
        });
    }
});


// ======================================================
// APROBAR EXCUSA
// PUT /api/excusas/aprobar/:id
// ======================================================

router.put(
    "/aprobar/:id",
    async (req, res) => {

        try {

            const { id } = req.params;


            const [result] =
                await pool.query(
                    `
                    UPDATE asistencias

                    SET estado =
                        'Falla Justificada'

                    WHERE
                        id_asistencia = ?

                    AND
                        observaciones IS NOT NULL

                    AND
                        observaciones LIKE '%EXCUSA%'
                    `,
                    [id]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    error:
                        "Excusa no encontrada."
                });
            }


            res.json({

                mensaje:
                    "Excusa aprobada correctamente."
            });


        } catch (error) {

            console.error(
                "ERROR AL APROBAR EXCUSA:",
                error
            );


            res.status(500).json({

                error:
                    "Error al aprobar la excusa.",

                detalle:
                    error.message
            });
        }

    }
);


// ======================================================
// RECHAZAR EXCUSA
// PUT /api/excusas/rechazar/:id
// ======================================================

router.put(
    "/rechazar/:id",
    async (req, res) => {

        try {

            const { id } = req.params;


            const [result] =
                await pool.query(
                    `
                    UPDATE asistencias

                    SET estado =
                        'Excusa Rechazada'

                    WHERE
                        id_asistencia = ?

                    AND
                        observaciones IS NOT NULL

                    AND
                        observaciones LIKE '%EXCUSA%'
                    `,
                    [id]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    error:
                        "Excusa no encontrada."
                });
            }


            res.json({

                mensaje:
                    "Excusa rechazada correctamente."
            });


        } catch (error) {

            console.error(
                "ERROR AL RECHAZAR EXCUSA:",
                error
            );


            res.status(500).json({

                error:
                    "Error al rechazar la excusa.",

                detalle:
                    error.message
            });
        }

    }
);


export default router;