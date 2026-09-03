import { Router } from "express";
import pool from "../db.js";

const router = Router();

//Obtener registros de todos los datos
router.get('/', async (req, res) => { 
    try{
        // Importante para que la api muestre las filas de la tabla en formato json
        const [rows] = await pool.query(
            `SELECT id_usuario, login, password_hash, estado
            FROM usuarios`);
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

        let query = "SELECT id_usuario, login, estado FROM usuarios";
        let countQuery = "SELECT COUNT(*) AS total FROM usuarios";
        const params = [];

        if (search) {
            const searchCondition = " WHERE login LIKE ? OR estado LIKE ? ";
            query += searchCondition;
            countQuery += searchCondition;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam);
        }

        query += " ORDER BY login ASC LIMIT ? OFFSET ?";

        const [rows] = await pool.query(query, [...params, limit, offset]);
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;
        res.json({
            usuarios: rows,
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

router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id_usuario, login, estado FROM usuarios WHERE id_usuario = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { login, password_hash, estado } = req.body;
        if (!login || !password_hash) return res.status(400).json({ error: "Login y password_hash son obligatorios" });

        const [existing] = await pool.query("SELECT id_usuario FROM usuarios WHERE login = ?", [login]);
        if (existing.length > 0) return res.status(400).json({ error: "Ya existe un usuario con ese login" });

        const [result] = await pool.query(
            "INSERT INTO usuarios (login, password_hash, estado) VALUES (?, ?, ?)",
            [login, password_hash, estado || "Activo"]
        );

        res.status(201).json({ mensaje: "Usuario creado correctamente", id_usuario: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { login, password_hash, estado, id_cargo } = req.body;

        // COALESCE(?, password_hash) evita fallos de NOT NULL si password_hash viene vacío/null
        const [result] = await pool.query(
            "UPDATE usuarios SET login = ?, password_hash = COALESCE(?, password_hash), estado = ?, id_cargo = ? WHERE id_usuario = ?",
            [login, password_hash || null, estado, id_cargo, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error SQL en UPDATE:", error.message);
        res.status(500).json({ error: error.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json({ mensaje: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;