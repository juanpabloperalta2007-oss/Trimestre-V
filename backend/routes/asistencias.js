import { Router } from "express";
import pool from "../db.js";

const router = Router();


// ======================================================
// 1. OBTENER TODAS LAS ASISTENCIAS
// ======================================================

router.get("/", async (req, res) => {

    try {

        const page =
            parseInt(req.query.page) || 1;

        const limit =
            parseInt(req.query.limit) || 100;

        const search =
            req.query.search || "";

        const offset =
            (page - 1) * limit;


        let query = `
            SELECT
                a.id_asistencia,
                a.fecha,
                a.estado,
                a.observaciones,
                a.id_estudiante,
                a.id_asignatura_curso,

                p.primer_nombre,
                p.segundo_nombre,
                p.primer_apellido,
                p.segundo_apellido,
                p.numero_documento,

                c.id_curso,
                c.nombre_curso,

                asi.id_asignatura,
                asi.nombre_asignatura

            FROM asistencias a

            INNER JOIN estudiantes e
                ON a.id_estudiante = e.id_estudiante

            INNER JOIN personas p
                ON e.id_persona = p.id_persona

            INNER JOIN asignaturas_cursos ac
                ON a.id_asignatura_curso =
                   ac.id_asignatura_curso

            INNER JOIN cursos c
                ON ac.id_curso = c.id_curso

            INNER JOIN asignaturas asi
                ON ac.id_asignatura =
                   asi.id_asignatura
        `;


        let countQuery = `
            SELECT COUNT(*) AS total

            FROM asistencias a

            INNER JOIN estudiantes e
                ON a.id_estudiante = e.id_estudiante

            INNER JOIN personas p
                ON e.id_persona = p.id_persona

            INNER JOIN asignaturas_cursos ac
                ON a.id_asignatura_curso =
                   ac.id_asignatura_curso

            INNER JOIN cursos c
                ON ac.id_curso = c.id_curso

            INNER JOIN asignaturas asi
                ON ac.id_asignatura =
                   asi.id_asignatura
        `;


        const params = [];


        if (
            search.trim() !== ""
        ) {

            const condicion = `
                WHERE
                    p.numero_documento LIKE ?
                    OR p.primer_nombre LIKE ?
                    OR p.primer_apellido LIKE ?
                    OR a.estado LIKE ?
                    OR c.nombre_curso LIKE ?
                    OR asi.nombre_asignatura LIKE ?
            `;


            query += condicion;

            countQuery += condicion;


            const buscar =
                `%${search}%`;


            params.push(
                buscar,
                buscar,
                buscar,
                buscar,
                buscar,
                buscar
            );

        }


        query += `
            ORDER BY a.fecha DESC
            LIMIT ? OFFSET ?
        `;


        const [rows] =
            await pool.query(
                query,
                [
                    ...params,
                    limit,
                    offset
                ]
            );


        const [countResult] =
            await pool.query(
                countQuery,
                params
            );


        const total =
            Number(
                countResult[0].total
            ) || 0;


        const totalPages =
            Math.ceil(
                total / limit
            );


        res.json({

            asistencias:
                rows,

            pagination: {

                currentPage:
                    page,

                totalPages:
                    totalPages,

                totalItems:
                    total,

                limit:
                    limit,

                hasNextPage:
                    page < totalPages,

                hasPrevPage:
                    page > 1

            }

        });

    }

    catch (error) {

        console.error(
            "Error al obtener asistencias:",
            error
        );


        res.status(500).json({

            error:
                "Error al obtener las asistencias."

        });

    }

});


// ======================================================
// 2. OBTENER ALERTAS DE INASISTENCIA
// ======================================================

router.get(
    "/alertas",
    async (req, res) => {

        try {

            const [rows] =
                await pool.query(`

                    SELECT

                        e.id_estudiante,

                        CONCAT(
                            COALESCE(
                                p.primer_nombre,
                                ''
                            ),
                            ' ',
                            COALESCE(
                                p.segundo_nombre,
                                ''
                            ),
                            ' ',
                            COALESCE(
                                p.primer_apellido,
                                ''
                            ),
                            ' ',
                            COALESCE(
                                p.segundo_apellido,
                                ''
                            )
                        ) AS estudiante,

                        p.numero_documento
                            AS documento,

                        COALESCE(
                            GROUP_CONCAT(
                                DISTINCT
                                c.nombre_curso
                                ORDER BY
                                c.nombre_curso
                                SEPARATOR ', '
                            ),
                            'Sin curso'
                        ) AS curso,

                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            a.estado,
                                            ''
                                        )
                                    )
                                ) = 'A'
                                THEN 1
                                ELSE 0
                            END
                        ) AS inasistencias,

                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            a.estado,
                                            ''
                                        )
                                    )
                                ) = 'T'
                                THEN 1
                                ELSE 0
                            END
                        ) AS tardanzas,

                        COUNT(
                            a.id_asistencia
                        ) AS total_registros,

                        CASE

                            WHEN SUM(
                                CASE
                                    WHEN UPPER(
                                        TRIM(
                                            COALESCE(
                                                a.estado,
                                                ''
                                            )
                                        )
                                    ) = 'A'
                                    THEN 1
                                    ELSE 0
                                END
                            ) >= 10

                            THEN 'Pérdida'


                            WHEN SUM(
                                CASE
                                    WHEN UPPER(
                                        TRIM(
                                            COALESCE(
                                                a.estado,
                                                ''
                                            )
                                        )
                                    ) = 'A'
                                    THEN 1
                                    ELSE 0
                                END
                            ) >= 5

                            THEN 'Exceso'


                            ELSE 'Normal'

                        END AS estado

                    FROM asistencias a

                    INNER JOIN estudiantes e
                        ON a.id_estudiante =
                           e.id_estudiante

                    INNER JOIN personas p
                        ON e.id_persona =
                           p.id_persona

                    INNER JOIN asignaturas_cursos ac
                        ON a.id_asignatura_curso =
                           ac.id_asignatura_curso

                    INNER JOIN cursos c
                        ON ac.id_curso =
                           c.id_curso

                    GROUP BY

                        e.id_estudiante,

                        p.primer_nombre,
                        p.segundo_nombre,
                        p.primer_apellido,
                        p.segundo_apellido,

                        p.numero_documento

                    HAVING
                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            a.estado,
                                            ''
                                        )
                                    )
                                ) = 'A'
                                THEN 1
                                ELSE 0
                            END
                        ) >= 5

                    ORDER BY
                        inasistencias DESC

                `);


            const alertas =
                rows.map(
                    (dato) => ({

                        id_estudiante:
                            dato.id_estudiante,

                        estudiante:
                            String(
                                dato.estudiante || ""
                            )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim(),

                        documento:
                            dato.documento,

                        curso:
                            dato.curso,

                        inasistencias:
                            Number(
                                dato.inasistencias
                            ) || 0,

                        tardanzas:
                            Number(
                                dato.tardanzas
                            ) || 0,

                        total_registros:
                            Number(
                                dato.total_registros
                            ) || 0,

                        estado:
                            dato.estado

                    })
                );


            res.json(
                alertas
            );

        }

        catch (error) {

            console.error(
                "Error al obtener alertas:",
                error
            );


            res.status(500).json({

                error:
                    "Error al obtener las alertas de inasistencia."

            });

        }

    }
);


// ======================================================
// 3. CREAR ASISTENCIA MANUAL
// ======================================================

router.post("/", async (req, res) => {

    try {

        const {
            fecha,
            estado,
            observaciones,
            id_estudiante,
            id_asignatura_curso
        } = req.body;


        if (
            !fecha ||
            !estado ||
            !id_estudiante ||
            !id_asignatura_curso
        ) {

            return res.status(400).json({

                error:
                    "Faltan datos obligatorios."

            });

        }


        const [result] =
            await pool.query(

                `
                INSERT INTO asistencias
                (
                    fecha,
                    estado,
                    observaciones,
                    id_estudiante,
                    id_asignatura_curso
                )
                VALUES (?, ?, ?, ?, ?)
                `,

                [
                    fecha,
                    estado,
                    observaciones || null,
                    id_estudiante,
                    id_asignatura_curso
                ]

            );


        res.status(201).json({

            mensaje:
                "Asistencia registrada correctamente.",

            id_asistencia:
                result.insertId

        });

    }

    catch (error) {

        console.error(
            "Error al crear asistencia:",
            error
        );


        res.status(500).json({

            error:
                "Error al registrar la asistencia."

        });

    }

});


// ======================================================
// 4. ACTUALIZAR ASISTENCIA
// ======================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const {
                fecha,
                estado,
                observaciones,
                id_estudiante,
                id_asignatura_curso
            } = req.body;


            const [result] =
                await pool.query(

                    `
                    UPDATE asistencias

                    SET
                        fecha = ?,
                        estado = ?,
                        observaciones = ?,
                        id_estudiante = ?,
                        id_asignatura_curso = ?

                    WHERE id_asistencia = ?
                    `,

                    [
                        fecha,
                        estado,
                        observaciones || null,
                        id_estudiante,
                        id_asignatura_curso,
                        id
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    error:
                        "Asistencia no encontrada."

                });

            }


            res.json({

                mensaje:
                    "Asistencia actualizada correctamente."

            });

        }

        catch (error) {

            console.error(
                "Error al actualizar asistencia:",
                error
            );


            res.status(500).json({

                error:
                    "Error al actualizar la asistencia."

            });

        }

    }
);


// ======================================================
// 5. ELIMINAR ASISTENCIA
// ======================================================

router.delete(
    "/:id",
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const [result] =
                await pool.query(

                    `
                    DELETE FROM asistencias
                    WHERE id_asistencia = ?
                    `,

                    [id]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    error:
                        "Asistencia no encontrada."

                });

            }


            res.json({

                mensaje:
                    "Asistencia eliminada correctamente."

            });

        }

        catch (error) {

            console.error(
                "Error al eliminar asistencia:",
                error
            );


            res.status(500).json({

                error:
                    "Error al eliminar la asistencia."

            });

        }

    }
);


// ======================================================
// 6. ESTADÍSTICAS MENSUALES
// ======================================================

router.get(
    "/estadisticas/:id_estudiante",
    async (req, res) => {

        const {
            id_estudiante
        } = req.params;

        const {
            mes
        } = req.query;


        try {

            const [filas] =
                await pool.query(

                    `
                    SELECT

                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            estado,
                                            ''
                                        )
                                    )
                                ) = 'P'
                                THEN 1
                                ELSE 0
                            END
                        ) AS asistencias,

                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            estado,
                                            ''
                                        )
                                    )
                                ) = 'A'
                                THEN 1
                                ELSE 0
                            END
                        ) AS fallas_sin_justificar,

                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            estado,
                                            ''
                                        )
                                    )
                                ) = 'J'
                                THEN 1
                                ELSE 0
                            END
                        ) AS fallas_justificadas,

                        SUM(
                            CASE
                                WHEN UPPER(
                                    TRIM(
                                        COALESCE(
                                            estado,
                                            ''
                                        )
                                    )
                                ) = 'T'
                                THEN 1
                                ELSE 0
                            END
                        ) AS retardos

                    FROM asistencias

                    WHERE id_estudiante = ?

                    AND (
                        ? IS NULL
                        OR MONTH(fecha) = ?
                    )
                    `,

                    [
                        id_estudiante,
                        mes || null,
                        mes || null
                    ]

                );


            res.json({

                asistencias:
                    Number(
                        filas[0]
                            ?.asistencias
                    ) || 0,

                fallas_sin_justificar:
                    Number(
                        filas[0]
                            ?.fallas_sin_justificar
                    ) || 0,

                fallas_justificadas:
                    Number(
                        filas[0]
                            ?.fallas_justificadas
                    ) || 0,

                retardos:
                    Number(
                        filas[0]
                            ?.retardos
                    ) || 0

            });

        }

        catch (error) {

            console.error(
                "Error en estadísticas:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// 7. RADICAR EXCUSA
// ======================================================

router.post(
    "/excusa",
    async (req, res) => {

        try {

            const {
                id_estudiante,
                motivo,
                fecha_inasistencia,
                descripcion
            } = req.body;


            if (
                !id_estudiante ||
                !fecha_inasistencia ||
                !descripcion
            ) {

                return res.status(400).json({

                    error:
                        "Faltan datos requeridos para radicar la excusa."

                });

            }


            const detalleObservacion =
                `[EXCUSA - ${
                    motivo || "General"
                }]: ${descripcion}`;


            const [
                existente
            ] = await pool.query(

                `
                SELECT
                    id_asistencia
                FROM asistencias
                WHERE id_estudiante = ?
                  AND DATE(fecha) =
                      DATE(?)
                LIMIT 1
                `,

                [
                    id_estudiante,
                    fecha_inasistencia
                ]

            );


            if (
                existente.length > 0
            ) {

                await pool.query(

                    `
                    UPDATE asistencias

                    SET
                        estado = 'J',
                        observaciones = ?

                    WHERE id_asistencia = ?
                    `,

                    [
                        detalleObservacion,
                        existente[0]
                            .id_asistencia
                    ]

                );

            }

            else {

                await pool.query(

                    `
                    INSERT INTO asistencias
                    (
                        fecha,
                        estado,
                        observaciones,
                        id_estudiante,
                        id_asignatura_curso
                    )
                    VALUES
                    (?, 'J', ?, ?, 1)
                    `,

                    [
                        fecha_inasistencia,
                        detalleObservacion,
                        id_estudiante
                    ]

                );

            }


            res.status(201).json({

                mensaje:
                    "Excusa radicada exitosamente."

            });

        }

        catch (error) {

            console.error(
                "Error al radicar excusa:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// 8. OBTENER LISTA DE ESTUDIANTES
// ======================================================

router.get(
    "/lista/:id_asignatura_curso",
    async (req, res) => {

        try {

            const {
                id_asignatura_curso
            } = req.params;


            const {
                fecha
            } = req.query;


            if (!fecha) {

                return res.status(400).json({

                    mensaje:
                        "La fecha es obligatoria."

                });

            }


            const id =
                Number(
                    id_asignatura_curso
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return res.status(400).json({

                    mensaje:
                        "El ID de la asignatura/curso no es válido."

                });

            }


            const [rows] =
                await pool.query(

                    `
                    SELECT

                        e.id_estudiante,

                        p.numero_documento,

                        p.primer_nombre,

                        p.segundo_nombre,

                        p.primer_apellido,

                        p.segundo_apellido,

                        CONCAT(
                            COALESCE(
                                p.primer_nombre,
                                ''
                            ),
                            ' ',
                            COALESCE(
                                p.segundo_nombre,
                                ''
                            ),
                            ' ',
                            COALESCE(
                                p.primer_apellido,
                                ''
                            ),
                            ' ',
                            COALESCE(
                                p.segundo_apellido,
                                ''
                            )
                        ) AS nombre_completo,

                        c.id_curso,

                        c.nombre_curso,

                        ac.id_asignatura_curso,

                        asi.id_asignatura,

                        asi.nombre_asignatura,

                        a.id_asistencia,

                        a.fecha,

                        a.estado,

                        a.observaciones

                    FROM estudiantes e

                    INNER JOIN personas p
                        ON p.id_persona =
                           e.id_persona

                    INNER JOIN estudiantes_cursos ec
                        ON ec.id_estudiante =
                           e.id_estudiante

                    INNER JOIN cursos c
                        ON c.id_curso =
                           ec.id_curso

                    INNER JOIN asignaturas_cursos ac
                        ON ac.id_curso =
                           c.id_curso

                    INNER JOIN asignaturas asi
                        ON asi.id_asignatura =
                           ac.id_asignatura

                    LEFT JOIN asistencias a
                        ON a.id_estudiante =
                           e.id_estudiante

                        AND a.id_asignatura_curso =
                            ac.id_asignatura_curso

                        AND DATE(a.fecha) =
                            DATE(?)

                    WHERE
                        ac.id_asignatura_curso = ?

                    ORDER BY
                        p.primer_apellido ASC,
                        p.primer_nombre ASC
                    `,

                    [
                        fecha,
                        id
                    ]

                );


            res.json(
                rows
            );

        }

        catch (error) {

            console.error(
                "Error al obtener lista:",
                error
            );


            res.status(500).json({

                mensaje:
                    "Error al obtener la lista de estudiantes.",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// 9. GUARDAR / ACTUALIZAR ASISTENCIA DESDE LISTA
// ======================================================

router.post(
    "/lista",
    async (req, res) => {

        try {

            console.log(
                "===================================="
            );

            console.log(
                "POST /api/asistencias/lista"
            );

            console.log(
                "BODY RECIBIDO:",
                req.body
            );

            console.log(
                "===================================="
            );


            const {
                fecha,
                estado,
                observaciones,
                id_estudiante,
                id_asignatura_curso
            } = req.body || {};


            // ------------------------------------------
            // FECHA
            // ------------------------------------------

            if (!fecha) {

                return res.status(400).json({

                    mensaje:
                        "La fecha de asistencia es obligatoria."

                });

            }


            // ------------------------------------------
            // ESTADO
            // ------------------------------------------

            if (!estado) {

                return res.status(400).json({

                    mensaje:
                        "El estado de asistencia es obligatorio."

                });

            }


            // ------------------------------------------
            // CONVERTIR ESTADO
            // ------------------------------------------

            const estadoTexto =
                String(estado)
                    .toLowerCase()
                    .trim();


            let estadoBD = null;


            if (
                estadoTexto === "p" ||
                estadoTexto === "presente"
            ) {

                estadoBD = "P";

            }

            else if (
                estadoTexto === "a" ||
                estadoTexto === "ausente"
            ) {

                estadoBD = "A";

            }

            else if (
                estadoTexto === "t" ||
                estadoTexto === "tardia" ||
                estadoTexto === "tardía" ||
                estadoTexto === "tarde"
            ) {

                estadoBD = "T";

            }

            else if (
                estadoTexto === "j" ||
                estadoTexto === "justificado"
            ) {

                estadoBD = "J";

            }


            if (!estadoBD) {

                return res.status(400).json({

                    mensaje:
                        "El estado de asistencia no es válido.",

                    estado_recibido:
                        estado

                });

            }


            // ------------------------------------------
            // ID ESTUDIANTE
            // ------------------------------------------

            const estudianteId =
                Number(
                    id_estudiante
                );


            if (
                !Number.isInteger(
                    estudianteId
                ) ||
                estudianteId <= 0
            ) {

                return res.status(400).json({

                    mensaje:
                        "El ID del estudiante no es válido.",

                    id_estudiante:
                        id_estudiante

                });

            }


            // ------------------------------------------
            // ID ASIGNATURA CURSO
            // ------------------------------------------

            const asignaturaCursoId =
                Number(
                    id_asignatura_curso
                );


            if (
                !Number.isInteger(
                    asignaturaCursoId
                ) ||
                asignaturaCursoId <= 0
            ) {

                return res.status(400).json({

                    mensaje:
                        "El ID de la asignatura/curso no es válido.",

                    id_asignatura_curso:
                        id_asignatura_curso

                });

            }


            // ------------------------------------------
            // VERIFICAR ESTUDIANTE
            // ------------------------------------------

            const [
                estudianteExiste
            ] = await pool.query(

                `
                SELECT
                    id_estudiante
                FROM estudiantes
                WHERE id_estudiante = ?
                LIMIT 1
                `,

                [
                    estudianteId
                ]

            );


            if (
                estudianteExiste.length === 0
            ) {

                return res.status(400).json({

                    mensaje:
                        "El estudiante no existe.",

                    id_estudiante:
                        estudianteId

                });

            }


            // ------------------------------------------
            // VERIFICAR ASIGNATURA CURSO
            // ------------------------------------------

            const [
                asignaturaExiste
            ] = await pool.query(

                `
                SELECT
                    id_asignatura_curso
                FROM asignaturas_cursos
                WHERE id_asignatura_curso = ?
                LIMIT 1
                `,

                [
                    asignaturaCursoId
                ]

            );


            if (
                asignaturaExiste.length === 0
            ) {

                return res.status(400).json({

                    mensaje:
                        "La asignatura/curso no existe.",

                    id_asignatura_curso:
                        asignaturaCursoId

                });

            }


            // ------------------------------------------
            // BUSCAR ASISTENCIA EXISTENTE
            // ------------------------------------------

            const [
                existente
            ] = await pool.query(

                `
                SELECT
                    id_asistencia
                FROM asistencias

                WHERE
                    id_estudiante = ?

                    AND id_asignatura_curso = ?

                    AND DATE(fecha) =
                        DATE(?)

                LIMIT 1
                `,

                [
                    estudianteId,
                    asignaturaCursoId,
                    fecha
                ]

            );


            // ------------------------------------------
            // ACTUALIZAR
            // ------------------------------------------

            if (
                existente.length > 0
            ) {

                const idAsistencia =
                    existente[0]
                        .id_asistencia;


                await pool.query(

                    `
                    UPDATE asistencias

                    SET
                        estado = ?,
                        observaciones = ?

                    WHERE
                        id_asistencia = ?
                    `,

                    [
                        estadoBD,

                        observaciones ||
                            null,

                        idAsistencia
                    ]

                );


                console.log(
                    "Asistencia actualizada:",
                    idAsistencia
                );


                return res.json({

                    mensaje:
                        "Asistencia actualizada correctamente.",

                    id_asistencia:
                        idAsistencia,

                    estado:
                        estadoBD

                });

            }


            // ------------------------------------------
            // INSERTAR
            // ------------------------------------------

            const [
                resultado
            ] = await pool.query(

                `
                INSERT INTO asistencias
                (
                    fecha,
                    estado,
                    observaciones,
                    id_estudiante,
                    id_asignatura_curso
                )

                VALUES
                (?, ?, ?, ?, ?)
                `,

                [
                    fecha,

                    estadoBD,

                    observaciones ||
                        null,

                    estudianteId,

                    asignaturaCursoId
                ]

            );


            console.log(
                "Asistencia registrada:",
                resultado.insertId
            );


            return res.status(201).json({

                mensaje:
                    "Asistencia registrada correctamente.",

                id_asistencia:
                    resultado.insertId,

                estado:
                    estadoBD

            });

        }

        catch (error) {

            console.error(
                "===================================="
            );

            console.error(
                "ERROR POST /api/asistencias/lista:"
            );

            console.error(
                error
            );

            console.error(
                "===================================="
            );


            return res.status(500).json({

                mensaje:
                    "Error interno al registrar la asistencia.",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// EXPORTAR ROUTER
// ======================================================

export default router;