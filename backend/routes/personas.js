import { Router } from "express";
import pool from "../db.js";

const router = Router();


//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_persona, tipo_documento, numero_documento, 
            primer_nombre, segundo_nombre, primer_apellido, 
            segundo_apellido, telefono, correo, id_usuario
            FROM personas`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Obtener todas las personas (con paginación y búsqueda)
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = "SELECT * FROM personas";
        let countQuery = "SELECT COUNT(*) AS total FROM personas";
        const params = [];

        if (search) {
            const searchCondition = `
                WHERE numero_documento LIKE ?
                OR primer_nombre LIKE ?
                OR primer_apellido LIKE ?
                OR correo LIKE ?
            `;
            query += searchCondition;
            countQuery += searchCondition;

            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        query += " ORDER BY primer_apellido ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
            personas: rows,
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
        res.status(500).json({ error: error.message });
    }
});

// Obtener persona por ID o documento
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM personas WHERE id_persona = ? OR numero_documento = ?",
            [req.params.id, req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "Persona no encontrada" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear persona
router.post("/", async (req, res) => {
    try {
        const {
            tipo_documento,
            numero_documento,
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            telefono,
            correo,
            id_usuario
        } = req.body;

        if (!tipo_documento || !numero_documento || !primer_nombre || !primer_apellido) {
            return res.status(400).json({
                error: "Tipo de documento, número, primer nombre y primer apellido son obligatorios"
            });
        }

        const [existing] = await pool.query(
            "SELECT id_persona FROM personas WHERE numero_documento = ?",
            [numero_documento]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: "Ya existe una persona con ese número de documento" });
        }

        const [result] = await pool.query(
            `INSERT INTO personas (
                tipo_documento, numero_documento, primer_nombre, segundo_nombre,
                primer_apellido, segundo_apellido, telefono, correo, id_usuario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tipo_documento,
                numero_documento,
                primer_nombre,
                segundo_nombre || null,
                primer_apellido,
                segundo_apellido || null,
                telefono || null,
                correo || null,
                id_usuario || null
            ]
        );

        res.status(201).json({
            mensaje: "Persona registrada correctamente",
            id_persona: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar persona
router.put("/:id", async (req, res) => {
    try {
        const {
            tipo_documento,
            numero_documento,
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            telefono,
            correo,
            id_usuario
        } = req.body;

        const [result] = await pool.query(
            `UPDATE personas SET
                tipo_documento = ?,
                numero_documento = ?,
                primer_nombre = ?,
                segundo_nombre = ?,
                primer_apellido = ?,
                segundo_apellido = ?,
                telefono = ?,
                correo = ?,
                id_usuario = ?
            WHERE id_persona = ?`,
            [
                tipo_documento,
                numero_documento,
                primer_nombre,
                segundo_nombre || null,
                primer_apellido,
                segundo_apellido || null,
                telefono || null,
                correo || null,
                id_usuario || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Persona no encontrada" });
        }

        res.json({ mensaje: "Persona actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar persona
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM personas WHERE id_persona = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Persona no encontrada" });
        }

        res.json({ mensaje: "Persona eliminada exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;