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
import asignaturasCursosRouter from "../asignaturas_cursos.js";

const app = express();

app.use(express.json());
app.use("/asignaturas-cursos", asignaturasCursosRouter);

describe("Pruebas de la API de asignaturas_cursos", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("GET devuelve las cargas académicas", async () => {
        pool.query.mockResolvedValueOnce([[
            {
                id_asignatura_curso: 1,
                id_asignatura: 2,
                id_curso: 3,
                id_docente: 4,
                nombre_asignatura: "Matemáticas",
                nombre_curso: "10-01",
                docente_nombre: "Carlos",
                docente_apellido: "Pérez"
            }
        ]]);

        const response = await request(app)
            .get("/asignaturas-cursos");

        expect(response.status).toBe(200);
        expect(response.body.cargas_academicas).toHaveLength(1);
        expect(response.body.cargas_academicas[0].nombre_asignatura)
            .toBe("Matemáticas");
    });

    test("GET devuelve una lista vacía", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
            .get("/asignaturas-cursos");

        expect(response.status).toBe(200);
        expect(response.body.cargas_academicas).toEqual([]);
    });

    test("GET devuelve 500 cuando falla la consulta", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error de consulta"));

        const response = await request(app)
            .get("/asignaturas-cursos");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error de consulta");
    });

    test.each([
        [{ id_curso: 2, id_docente: 3 }],
        [{ id_asignatura: 1, id_docente: 3 }],
        [{ id_asignatura: 1, id_curso: 2 }],
        [{ id_asignatura: 0, id_curso: 2, id_docente: 3 }],
        [{ id_asignatura: 1, id_curso: 0, id_docente: 3 }],
        [{ id_asignatura: 1, id_curso: 2, id_docente: 0 }]
    ])("POST rechaza datos obligatorios incompletos o inválidos: %o", async (body) => {
        const response = await request(app)
            .post("/asignaturas-cursos")
            .send(body);

        expect(response.status).toBe(400);
        expect(response.body.error)
            .toBe("Asignatura, curso y docente son obligatorios");
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST registra una asignación correctamente", async () => {
        pool.query.mockResolvedValueOnce([{ insertId: 10 }]);

        const response = await request(app)
            .post("/asignaturas-cursos")
            .send({
                id_asignatura: 1,
                id_curso: 2,
                id_docente: 3
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            mensaje: "Asignación académica registrada",
            id_asignatura_curso: 10
        });
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO asignaturas_cursos"),
            [1, 2, 3]
        );
    });

    test("POST devuelve 500 cuando falla la inserción", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error al insertar"));

        const response = await request(app)
            .post("/asignaturas-cursos")
            .send({
                id_asignatura: 1,
                id_curso: 2,
                id_docente: 3
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error al insertar");
    });

    test("DELETE elimina una asignación existente", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const response = await request(app)
            .delete("/asignaturas-cursos/1");

        expect(response.status).toBe(200);
        expect(response.body.mensaje)
            .toBe("Asignación eliminada correctamente");
    });

    test("DELETE devuelve 404 si la asignación no existe", async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const response = await request(app)
            .delete("/asignaturas-cursos/999");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("Asignación no encontrada");
    });

    test("DELETE devuelve 500 cuando falla la eliminación", async () => {
        pool.query.mockRejectedValueOnce(new Error("Error al eliminar"));

        const response = await request(app)
            .delete("/asignaturas-cursos/1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Error al eliminar");
    });
});
