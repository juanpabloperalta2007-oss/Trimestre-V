import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ======================================================
// 1. OBTENER TODAS LAS ASISTENCIAS
//    Con búsqueda y paginación
// ======================================================

router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 100, 1);
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

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
        ON a.id_asignatura_curso = ac.id_asignatura_curso

      INNER JOIN cursos c
        ON ac.id_curso = c.id_curso

      INNER JOIN asignaturas asi
        ON ac.id_asignatura = asi.id_asignatura
    `;

    let countQuery = `
      SELECT COUNT(*) AS total

      FROM asistencias a

      INNER JOIN estudiantes e
        ON a.id_estudiante = e.id_estudiante

      INNER JOIN personas p
        ON e.id_persona = p.id_persona

      INNER JOIN asignaturas_cursos ac
        ON a.id_asignatura_curso = ac.id_asignatura_curso

      INNER JOIN cursos c
        ON ac.id_curso = c.id_curso

      INNER JOIN asignaturas asi
        ON ac.id_asignatura = asi.id_asignatura
    `;

    const params = [];

    // ==================================================
    // BÚSQUEDA
    // ==================================================

    if (search.trim() !== "") {
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

      const buscar = `%${search.trim()}%`;

      params.push(
        buscar,
        buscar,
        buscar,
        buscar,
        buscar,
        buscar
      );
    }

    // ==================================================
    // ORDEN Y PAGINACIÓN
    // ==================================================

    query += `
      ORDER BY a.fecha DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(
      query,
      [...params, limit, offset]
    );

    const [countResult] = await pool.query(
      countQuery,
      params
    );

    const total = Number(countResult[0]?.total || 0);

    const totalPages = Math.ceil(total / limit);

    res.json({
      asistencias: rows,

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
    console.error(
      "Error al obtener asistencias:",
      error
    );

    res.status(500).json({
      error: "Error al obtener las asistencias."
    });
  }
});


// ======================================================
// 2. OBTENER ALERTAS DE INASISTENCIA
// ======================================================
//
// Agrupa las inasistencias por estudiante.
//
// 3 o más ausencias = Exceso
// 5 o más ausencias = Pérdida
//
// ======================================================

router.get("/alertas", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT

        e.id_estudiante,

        CONCAT(
          COALESCE(p.primer_nombre, ''),
          ' ',
          COALESCE(p.segundo_nombre, ''),
          ' ',
          COALESCE(p.primer_apellido, ''),
          ' ',
          COALESCE(p.segundo_apellido, '')
        ) AS estudiante,

        p.numero_documento AS documento,

        COALESCE(
          GROUP_CONCAT(
            DISTINCT c.nombre_curso
            ORDER BY c.nombre_curso
            SEPARATOR ', '
          ),
          'Sin curso'
        ) AS curso,

        COUNT(
          CASE
            WHEN a.estado = 'Ausente'
            THEN 1
          END
        ) AS inasistencias,

        COUNT(
          CASE
            WHEN a.estado = 'Tarde'
            THEN 1
          END
        ) AS tardanzas,

        COUNT(a.id_asistencia) AS total_registros,

        CASE

          WHEN COUNT(
            CASE
              WHEN a.estado = 'Ausente'
              THEN 1
            END
          ) >= 5
          THEN 'Pérdida'

          WHEN COUNT(
            CASE
              WHEN a.estado = 'Ausente'
              THEN 1
            END
          ) >= 3
          THEN 'Exceso'

          ELSE 'Normal'

        END AS estado

      FROM asistencias a

      INNER JOIN estudiantes e
        ON a.id_estudiante = e.id_estudiante

      INNER JOIN personas p
        ON e.id_persona = p.id_persona

      INNER JOIN asignaturas_cursos ac
        ON a.id_asignatura_curso = ac.id_asignatura_curso

      INNER JOIN cursos c
        ON ac.id_curso = c.id_curso

      GROUP BY
        e.id_estudiante,
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.numero_documento

      HAVING
        COUNT(
          CASE
            WHEN a.estado = 'Ausente'
            THEN 1
          END
        ) >= 3

      ORDER BY inasistencias DESC
    `);

    const alertas = rows.map((dato) => ({
      id_estudiante: dato.id_estudiante,

      estudiante: (dato.estudiante || "")
        .replace(/\s+/g, " ")
        .trim(),

      documento: dato.documento,

      curso: dato.curso,

      inasistencias:
        Number(dato.inasistencias) || 0,

      tardanzas:
        Number(dato.tardanzas) || 0,

      total_registros:
        Number(dato.total_registros) || 0,

      estado: dato.estado
    }));

    console.log(
      "ALERTAS GENERADAS:",
      alertas
    );

    res.json(alertas);

  } catch (error) {
    console.error(
      "Error al obtener alertas:",
      error
    );

    res.status(500).json({
      error: "Error al obtener las alertas de inasistencia."
    });
  }
});


// ======================================================
// 3. CREAR ASISTENCIA
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
        error: "Faltan datos obligatorios."
      });
    }

    const [result] = await pool.query(
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
      mensaje: "Asistencia registrada correctamente.",
      id_asistencia: result.insertId
    });

  } catch (error) {
    console.error(
      "Error al crear asistencia:",
      error
    );

    res.status(500).json({
      error: "Error al registrar la asistencia."
    });
  }
});


// ======================================================
// 4. ACTUALIZAR ASISTENCIA
// ======================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

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
        error: "Faltan datos obligatorios."
      });
    }

    const [result] = await pool.query(
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

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Asistencia no encontrada."
      });
    }

    res.json({
      mensaje: "Asistencia actualizada correctamente."
    });

  } catch (error) {
    console.error(
      "Error al actualizar asistencia:",
      error
    );

    res.status(500).json({
      error: "Error al actualizar la asistencia."
    });
  }
});


// ======================================================
// 5. ELIMINAR ASISTENCIA
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
        DELETE FROM asistencias
        WHERE id_asistencia = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Asistencia no encontrada."
      });
    }

    res.json({
      mensaje: "Asistencia eliminada correctamente."
    });

  } catch (error) {
    console.error(
      "Error al eliminar asistencia:",
      error
    );

    res.status(500).json({
      error: "Error al eliminar la asistencia."
    });
  }
});


// ======================================================
// 6. ESTADÍSTICAS MENSUALES DE ASISTENCIA
// ======================================================

router.get(
  "/estadisticas/:id_estudiante",
  async (req, res) => {
    const { id_estudiante } = req.params;
    const { mes } = req.query;

    try {
      const [filas] = await pool.query(
        `
          SELECT

            SUM(
              CASE
                WHEN LOWER(estado) LIKE '%asistencia%'
                  OR LOWER(estado) = 'presente'
                THEN 1
                ELSE 0
              END
            ) AS asistencias,

            SUM(
              CASE
                WHEN LOWER(estado) LIKE '%sin justificar%'
                THEN 1
                ELSE 0
              END
            ) AS fallas_sin_justificar,

            SUM(
              CASE
                WHEN LOWER(estado) LIKE '%justificada%'
                THEN 1
                ELSE 0
              END
            ) AS fallas_justificadas,

            SUM(
              CASE
                WHEN LOWER(estado) LIKE '%retardo%'
                  OR LOWER(estado) LIKE '%tarde%'
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

      const datos = filas[0] || {};

      res.json({
        asistencias:
          Number(datos.asistencias) || 0,

        fallas_sin_justificar:
          Number(datos.fallas_sin_justificar) || 0,

        fallas_justificadas:
          Number(datos.fallas_justificadas) || 0,

        retardos:
          Number(datos.retardos) || 0
      });

    } catch (error) {
      console.error(
        "Error al obtener estadísticas:",
        error
      );

      res.status(500).json({
        error:
          "Error al obtener las estadísticas de asistencia."
      });
    }
  }
);


// ======================================================
// 7. RADICAR EXCUSA
// ======================================================
//
// Actualiza una asistencia existente a
// "Falla Justificada".
//
// Si no existe una asistencia para esa fecha,
// crea una nueva.
// ======================================================

router.post("/excusa", async (req, res) => {
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
      `[EXCUSA - ${motivo || "General"}]: ${descripcion}`;

    // Buscar asistencia existente
    const [existente] = await pool.query(
      `
        SELECT id_asistencia
        FROM asistencias
        WHERE id_estudiante = ?
          AND DATE(fecha) = DATE(?)
        LIMIT 1
      `,
      [
        id_estudiante,
        fecha_inasistencia
      ]
    );

    if (existente.length > 0) {

      await pool.query(
        `
          UPDATE asistencias
          SET
            estado = 'Falla Justificada',
            observaciones = ?
          WHERE id_asistencia = ?
        `,
        [
          detalleObservacion,
          existente[0].id_asistencia
        ]
      );

    } else {

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
          VALUES (
            ?,
            'Falla Justificada',
            ?,
            ?,
            1
          )
        `,
        [
          fecha_inasistencia,
          detalleObservacion,
          id_estudiante
        ]
      );
    }

    res.status(201).json({
      mensaje: "Excusa radicada exitosamente."
    });

  } catch (error) {
    console.error(
      "Error al radicar excusa:",
      error
    );

    res.status(500).json({
      error:
        "Error al radicar la excusa."
    });
  }
});


// ======================================================
// EXPORTAR ROUTER
// ======================================================

export default router;