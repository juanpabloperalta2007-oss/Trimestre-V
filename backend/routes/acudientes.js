import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_acudiente, id_persona, direccion
            FROM acudientes`);
        res.json(rows);
        //
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const offset = (page - 1) * limit;

        let query = `
            SELECT a.*, p.primer_nombre, p.primer_apellido, p.numero_documento, p.telefono, p.correo
            FROM acudientes a
            JOIN personas p ON a.id_persona = p.id_persona
        `;
        let countQuery = `
            SELECT COUNT(*) AS total FROM acudientes a
            JOIN personas p ON a.id_persona = p.id_persona
        `;
        const params = [];

        if (search) {
            const searchCondition = " WHERE p.primer_nombre LIKE ? OR p.primer_apellido LIKE ? OR p.numero_documento LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        query += " ORDER BY p.primer_apellido ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        res.json({
            acudientes: rows,
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

router.get('/exist/:documento', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT 1 FROM acudientes WHERE numero_documento = ?', 
            [req.params.documento]
        );
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT a.*, p.primer_nombre, p.primer_apellido, p.numero_documento, p.telefono, p.correo
            FROM acudientes a
            JOIN personas p ON a.id_persona = p.id_persona
            WHERE a.id_acudiente = ?`, [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ mensaje: "Acudiente no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { id_persona, direccion } = req.body;
        if (!id_persona) return res.status(400).json({ error: "El id_persona es obligatorio" });

        const [existing] = await pool.query("SELECT id_acudiente FROM acudientes WHERE id_persona = ?", [id_persona]);
        if (existing.length > 0) return res.status(400).json({ error: "Esta persona ya está registrada como acudiente" });

        const [result] = await pool.query("INSERT INTO acudientes (id_persona, direccion) VALUES (?, ?)", [id_persona, direccion || null]);
        res.status(201).json({ mensaje: "Acudiente registrado correctamente", id_acudiente: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { direccion } = req.body;
        const [result] = await pool.query("UPDATE acudientes SET direccion = ? WHERE id_acudiente = ?", [direccion || null, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Acudiente no encontrado" });
        res.json({ mensaje: "Acudiente actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM acudientes WHERE id_acudiente = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Acudiente no encontrado" });
        res.json({ mensaje: "Acudiente eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;