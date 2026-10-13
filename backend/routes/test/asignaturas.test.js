import { jest } from "@jest/globals";

jest.mock("../../db.js", () => ({
    __esModule: true,
    default: {
        query: jest.fn()
    }
}));

import pool from "../../db.js";
import request from "supertest";
import express from "express";
import asignaturasRouter from "../asignaturas.js";

const app = express();

app.use(express.json());
app.use("/asignaturas", asignaturasRouter);

describe("Pruebas de la API de asignaturas", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // GET /

    test("GET devuelve todas las asignaturas", async () => {
        pool.query.mockResolvedValueOnce([[
            {
                id_asignatura: 1,
                nombre_asignatura: "Matemáticas",
                id_area: 1
            }
        ]]);

        const response = await request(app).get("/asignaturas");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].nombre_asignatura).toBe("Matemáticas");
    });

    test("GET devuelve error 500 si falla la consulta general", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error de consulta"));

        const response = await request(app).get("/asignaturas");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error de consulta");
    });

    // GET / con paginación

    test("GET con paginación y búsqueda devuelve resultados", async () => {
        pool.query
            .mockResolvedValueOnce([[
                {
                    id_asignatura: 1,
                    nombre_asignatura: "Matemáticas",
                    nombre_area: "Ciencias"
                }
            ]])
            .mockResolvedValueOnce([[{ total: 20 }]]);

        const response = await request(app)
            .get("/asignaturas?page=1&limit=10&search=Mate");

        expect(response.status).toBe(200);
        expect(response.body.asignaturas).toHaveLength(1);
        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.totalPages).toBe(2);
        expect(response.body.pagination.hasNextPage).toBe(true);
        expect(response.body.pagination.hasPrevPage).toBe(false);
        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("GET con paginación sin búsqueda y página siguiente", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 20 }]]);

        const response = await request(app)
            .get("/asignaturas?page=2&limit=10");

        expect(response.status).toBe(200);
        expect(response.body.pagination.currentPage).toBe(2);
        expect(response.body.pagination.hasNextPage).toBe(false);
        expect(response.body.pagination.hasPrevPage).toBe(true);
    });

    test("GET aplica los valores predeterminados de paginación", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        const response = await request(app)
            .get("/asignaturas?search=");

        expect(response.status).toBe(200);
        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
        expect(response.body.pagination.totalPages).toBe(0);
        expect(response.body.pagination.hasNextPage).toBe(false);
        expect(response.body.pagination.hasPrevPage).toBe(false);
    });

    test("GET devuelve error 500 si falla la consulta paginada", async () => {
        pool.query.mockRejectedValueOnce(new Error("Fallo paginación"));

        const response = await request(app)
            .get("/asignaturas?page=1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Fallo paginación");
    });

    test("GET devuelve error 500 si falla el conteo", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockRejectedValueOnce(new Error("Fallo conteo"));

        const response = await request(app)
            .get("/asignaturas?page=1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Fallo conteo");
    });

    test("GET utiliza el límite indicado", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 5 }]]);

        const response = await request(app)
            .get("/asignaturas?limit=5");

        expect(response.status).toBe(200);
        expect(response.body.pagination.limit).toBe(5);
    });

    // GET /:id

    test("GET por ID devuelve la asignatura encontrada", async () => {
        pool.query.mockResolvedValueOnce([[
            {
                id_asignatura: 1,
                nombre_asignatura: "Matemáticas"
            }
        ]]);

        const response = await request(app).get("/asignaturas/1");

        expect(response.status).toBe(200);
        expect(response.body.nombre_asignatura).toBe("Matemáticas");
    });

    test("GET por ID devuelve 404 si no existe", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app).get("/asignaturas/999");

        expect(response.status).toBe(404);
        expect(response.body.mensaje).toBe("Asignatura no encontrada");
    });

    test("GET por ID devuelve 500 si ocurre un error", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error por ID"));

        const response = await request(app).get("/asignaturas/1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error por ID");
    });

    // POST /

    test("POST devuelve 400 si falta el nombre", async () => {
        const response = await request(app)
            .post("/asignaturas")
            .send({ id_area: 1 });

        expect(response.status).toBe(400);
        expect(response.body.error)
            .toBe("El nombre de la asignatura es obligatorio");
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve 400 si el nombre está vacío", async () => {
        const response = await request(app)
            .post("/asignaturas")
            .send({ nombre_asignatura: "" });

        expect(response.status).toBe(400);
    });

    test("POST crea una asignatura con área", async () => {
        pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

        const response = await request(app)
            .post("/asignaturas")
            .send({
                nombre_asignatura: "Matemáticas",
                id_area: 1
            });

        expect(response.status).toBe(201);
        expect(response.body.id_asignatura).toBe(5);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            ["Matemáticas", 1]
        );
    });

    test("POST crea una asignatura sin área", async () => {
        pool.query.mockResolvedValueOnce([{ insertId: 6 }]);

        const response = await request(app)
            .post("/asignaturas")
            .send({ nombre_asignatura: "Historia" });

        expect(response.status).toBe(201);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            ["Historia", null]
        );
    });

    test("POST devuelve 500 si falla la inserción", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error al insertar"));

        const response = await request(app)
            .post("/asignaturas")
            .send({ nombre_asignatura: "Matemáticas" });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error al insertar");
    });

    // PUT /:id

    test("PUT actualiza una asignatura con área", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const response = await request(app)
            .put("/asignaturas/1")
            .send({
                nombre_asignatura: "Física",
                id_area: 2
            });

        expect(response.status).toBe(200);
        expect(response.body.mensaje)
            .toBe("Asignatura actualizada correctamente");
    });

    test("PUT actualiza una asignatura sin área", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const response = await request(app)
            .put("/asignaturas/1")
            .send({ nombre_asignatura: "Física" });

        expect(response.status).toBe(200);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            ["Física", null, "1"]
        );
    });

    test("PUT devuelve 404 si no encuentra la asignatura", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const response = await request(app)
            .put("/asignaturas/999")
            .send({ nombre_asignatura: "Física" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Asignatura no encontrada");
    });

    test("PUT devuelve 500 si ocurre un error", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error al actualizar"));

        const response = await request(app)
            .put("/asignaturas/1")
            .send({ nombre_asignatura: "Física" });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error al actualizar");
    });

    // DELETE /:id

    test("DELETE elimina una asignatura", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const response = await request(app).delete("/asignaturas/1");

        expect(response.status).toBe(200);
        expect(response.body.mensaje)
            .toBe("Asignatura eliminada exitosamente");
    });

    test("DELETE devuelve 404 si no encuentra la asignatura", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const response = await request(app).delete("/asignaturas/999");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Asignatura no encontrada");
    });

    test("DELETE devuelve 500 si ocurre un error", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error al eliminar"));

        const response = await request(app).delete("/asignaturas/1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error al eliminar");
    });
});