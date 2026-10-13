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
import calendarioEscolarRouter from "../calendario_escolar.js";

const app = express();

app.use(express.json());
app.use("/calendario-escolar", calendarioEscolarRouter);

describe("Pruebas de la API de calendario escolar", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // GET /todos

    test("GET devuelve todos los eventos", async () => {
        pool.query.mockResolvedValueOnce([[
            {
                id_evento: 1,
                titulo: "Reunión de padres",
                descripcion: "Reunión general",
                fecha_inicio: "2026-10-15",
                fecha_fin: "2026-10-15",
                tipo_evento: "Académico",
                id_curso: 1
            }
        ]]);

        const response = await request(app)
            .get("/calendario-escolar/todos");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].titulo).toBe("Reunión de padres");
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("GET todos devuelve error 500 si falla la consulta", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error de consulta")
        );

        const response = await request(app)
            .get("/calendario-escolar/todos");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error de consulta");
    });

    // GET / con paginación y búsqueda

    test("GET devuelve eventos con paginación y búsqueda", async () => {
        pool.query
            .mockResolvedValueOnce([[
                {
                    id_evento: 1,
                    titulo: "Reunión de padres",
                    tipo_evento: "Académico",
                    nombre_curso: "10-01"
                }
            ]])
            .mockResolvedValueOnce([[
                { total: 20 }
            ]]);

        const response = await request(app)
            .get("/calendario-escolar?page=1&limit=10&search=Reunión");

        expect(response.status).toBe(200);
        expect(response.body.eventos).toHaveLength(1);
        expect(response.body.eventos[0].titulo)
            .toBe("Reunión de padres");

        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.totalPages).toBe(2);
        expect(response.body.pagination.totalItems).toBe(20);
        expect(response.body.pagination.limit).toBe(10);
        expect(response.body.pagination.hasNextPage).toBe(true);
        expect(response.body.pagination.hasPrevPage).toBe(false);

        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("GET devuelve eventos de la página siguiente", async () => {
        pool.query
            .mockResolvedValueOnce([[
                {
                    id_evento: 11,
                    titulo: "Día deportivo",
                    tipo_evento: "Deportivo"
                }
            ]])
            .mockResolvedValueOnce([[
                { total: 20 }
            ]]);

        const response = await request(app)
            .get("/calendario-escolar?page=2&limit=10");

        expect(response.status).toBe(200);
        expect(response.body.pagination.currentPage).toBe(2);
        expect(response.body.pagination.hasNextPage).toBe(false);
        expect(response.body.pagination.hasPrevPage).toBe(true);
    });

    test("GET aplica la paginación predeterminada", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[
                { total: 0 }
            ]]);

        const response = await request(app)
            .get("/calendario-escolar");

        expect(response.status).toBe(200);
        expect(response.body.eventos).toEqual([]);
        expect(response.body.pagination.currentPage).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
        expect(response.body.pagination.totalPages).toBe(0);
        expect(response.body.pagination.hasNextPage).toBe(false);
        expect(response.body.pagination.hasPrevPage).toBe(false);
    });

    test("GET devuelve error 500 si falla la consulta paginada", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Fallo en la consulta paginada")
        );

        const response = await request(app)
            .get("/calendario-escolar?page=1");

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Fallo en la consulta paginada");
    });

    test("GET devuelve error 500 si falla el conteo", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockRejectedValueOnce(
                new Error("Fallo en el conteo")
            );

        const response = await request(app)
            .get("/calendario-escolar?page=1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Fallo en el conteo");
    });

    test("GET utiliza el límite indicado en la consulta", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[
                { total: 5 }
            ]]);

        const response = await request(app)
            .get("/calendario-escolar?limit=5");

        expect(response.status).toBe(200);
        expect(response.body.pagination.limit).toBe(5);
    });

    // POST /

    test("POST devuelve 400 si falta el título", async () => {
        const response = await request(app)
            .post("/calendario-escolar")
            .send({
                descripcion: "Evento escolar",
                fecha_inicio: "2026-10-15",
                fecha_fin: "2026-10-15"
            });

        expect(response.status).toBe(400);
        expect(response.body.error)
            .toBe("Título, fecha_inicio y fecha_fin son obligatorios");
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve 400 si falta la fecha de inicio", async () => {
        const response = await request(app)
            .post("/calendario-escolar")
            .send({
                titulo: "Reunión",
                fecha_fin: "2026-10-15"
            });

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve 400 si falta la fecha de finalización", async () => {
        const response = await request(app)
            .post("/calendario-escolar")
            .send({
                titulo: "Reunión",
                fecha_inicio: "2026-10-15"
            });

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST crea un evento con todos sus datos", async () => {
        pool.query.mockResolvedValueOnce([
            { insertId: 5 }
        ]);

        const response = await request(app)
            .post("/calendario-escolar")
            .send({
                titulo: "Reunión de padres",
                descripcion: "Reunión general",
                fecha_inicio: "2026-10-15",
                fecha_fin: "2026-10-15",
                tipo_evento: "Académico",
                id_curso: 1
            });

        expect(response.status).toBe(201);
        expect(response.body.mensaje)
            .toBe("Evento creado correctamente");
        expect(response.body.id_evento).toBe(5);

        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            [
                "Reunión de padres",
                "Reunión general",
                "2026-10-15",
                "2026-10-15",
                "Académico",
                1
            ]
        );
    });

    test("POST crea un evento con valores predeterminados", async () => {
        pool.query.mockResolvedValueOnce([
            { insertId: 6 }
        ]);

        const response = await request(app)
            .post("/calendario-escolar")
            .send({
                titulo: "Actividad institucional",
                fecha_inicio: "2026-10-20",
                fecha_fin: "2026-10-20"
            });

        expect(response.status).toBe(201);
        expect(response.body.id_evento).toBe(6);

        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            [
                "Actividad institucional",
                null,
                "2026-10-20",
                "2026-10-20",
                "General",
                null
            ]
        );
    });

    test("POST devuelve error 500 si falla la inserción", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al insertar evento")
        );

        const response = await request(app)
            .post("/calendario-escolar")
            .send({
                titulo: "Reunión",
                fecha_inicio: "2026-10-15",
                fecha_fin: "2026-10-15"
            });

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al insertar evento");
    });

    // PUT /:id

    test("PUT actualiza un evento existente", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 1 }
        ]);

        const response = await request(app)
            .put("/calendario-escolar/1")
            .send({
                titulo: "Reunión actualizada",
                descripcion: "Nueva descripción",
                fecha_inicio: "2026-10-16",
                fecha_fin: "2026-10-16",
                tipo_evento: "Académico",
                id_curso: 2
            });

        expect(response.status).toBe(200);
        expect(response.body.mensaje)
            .toBe("Evento actualizado correctamente");

        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            [
                "Reunión actualizada",
                "Nueva descripción",
                "2026-10-16",
                "2026-10-16",
                "Académico",
                2,
                "1"
            ]
        );
    });

    test("PUT actualiza un evento sin curso asociado", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 1 }
        ]);

        const response = await request(app)
            .put("/calendario-escolar/1")
            .send({
                titulo: "Día cultural",
                descripcion: "Actividad cultural",
                fecha_inicio: "2026-10-18",
                fecha_fin: "2026-10-18",
                tipo_evento: "Cultural"
            });

        expect(response.status).toBe(200);

        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            [
                "Día cultural",
                "Actividad cultural",
                "2026-10-18",
                "2026-10-18",
                "Cultural",
                null,
                "1"
            ]
        );
    });

    test("PUT devuelve 404 si el evento no existe", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 0 }
        ]);

        const response = await request(app)
            .put("/calendario-escolar/999")
            .send({
                titulo: "Evento inexistente",
                descripcion: "Prueba",
                fecha_inicio: "2026-10-18",
                fecha_fin: "2026-10-18",
                tipo_evento: "General",
                id_curso: null
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Evento no encontrado");
    });

    test("PUT devuelve error 500 si falla la actualización", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al actualizar evento")
        );

        const response = await request(app)
            .put("/calendario-escolar/1")
            .send({
                titulo: "Evento actualizado",
                descripcion: "Prueba",
                fecha_inicio: "2026-10-18",
                fecha_fin: "2026-10-18",
                tipo_evento: "General"
            });

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al actualizar evento");
    });

    // DELETE /:id

    test("DELETE elimina un evento existente", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 1 }
        ]);

        const response = await request(app)
            .delete("/calendario-escolar/1");

        expect(response.status).toBe(200);
        expect(response.body.mensaje)
            .toBe("Evento eliminado exitosamente");

        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            ["1"]
        );
    });

    test("DELETE devuelve 404 si el evento no existe", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 0 }
        ]);

        const response = await request(app)
            .delete("/calendario-escolar/999");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Evento no encontrado");
    });

    test("DELETE devuelve error 500 si falla la eliminación", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al eliminar evento")
        );

        const response = await request(app)
            .delete("/calendario-escolar/1");

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al eliminar evento");
    });
});