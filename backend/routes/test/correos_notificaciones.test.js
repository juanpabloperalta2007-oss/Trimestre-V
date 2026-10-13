
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
import correosNotificacionesRouter from "../correos_notificaciones.js";

const app = express();

app.use(express.json());
app.use("/correos-notificaciones", correosNotificacionesRouter);

describe("Pruebas de la API de correos y notificaciones", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ==========================================
    // 1. GET / - OBTENER TODOS LOS CORREOS
    // ==========================================

    test("GET devuelve los correos con información de paginación", async () => {
        pool.query
            .mockResolvedValueOnce([[
                {
                    id_correo: 1,
                    asunto: "Alerta de inasistencia",
                    mensaje: "El estudiante no asistió a clase",
                    fecha_envio: "2026-10-13",
                    tipo_notificacion: "Inasistencia",
                    estado_envio: "Enviado",
                    id_docente: 1,
                    id_acudiente: 2,
                    id_estudiante: 3
                },
                {
                    id_correo: 2,
                    asunto: "Reunión académica",
                    mensaje: "Se informa sobre una reunión",
                    fecha_envio: "2026-10-12",
                    tipo_notificacion: "Académico",
                    estado_envio: "Enviado",
                    id_docente: 1,
                    id_acudiente: 2,
                    id_estudiante: 3
                }
            ]])
            .mockResolvedValueOnce([[
                { total: 20 }
            ]]);

        const response = await request(app)
            .get("/correos-notificaciones?page=1&limit=10");

        expect(response.status).toBe(200);
        expect(response.body.correos).toHaveLength(2);

        expect(response.body.correos[0].asunto)
            .toBe("Alerta de inasistencia");

        expect(response.body.pagination).toEqual({
            currentPage: 1,
            totalPages: 2,
            totalItems: 20,
            limit: 10
        });

        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("GET utiliza los valores predeterminados de paginación", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[
                { total: 0 }
            ]]);

        const response = await request(app)
            .get("/correos-notificaciones");

        expect(response.status).toBe(200);
        expect(response.body.correos).toEqual([]);

        expect(response.body.pagination).toEqual({
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            limit: 10
        });

        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("GET devuelve error 500 si falla la consulta de correos", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al consultar correos")
        );

        const response = await request(app)
            .get("/correos-notificaciones");

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al consultar correos");

        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("GET devuelve error 500 si falla el conteo de correos", async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockRejectedValueOnce(
                new Error("Error al contar correos")
            );

        const response = await request(app)
            .get("/correos-notificaciones");

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al contar correos");

        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    // ==========================================
    // 2. GET /acudiente/:id_acudiente
    // ==========================================

    test("GET devuelve las notificaciones de un acudiente", async () => {
        pool.query.mockResolvedValueOnce([[
            {
                id_correo: 1,
                asunto: "Alerta de inasistencia",
                mensaje: "El estudiante presentó una inasistencia",
                fecha_envio: "2026-10-13",
                tipo_notificacion: "Inasistencia",
                estado_envio: "Enviado",
                remitente_nombre: "Carlos Andrés Pérez Gómez",
                rol: "Docente"
            }
        ]]);

        const response = await request(app)
            .get("/correos-notificaciones/acudiente/5");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);

        expect(response.body[0]).toEqual({
            id_correo: 1,
            asunto: "Alerta de inasistencia",
            mensaje: "El estudiante presentó una inasistencia",
            fecha_envio: "2026-10-13",
            tipo_notificacion: "Inasistencia",
            estado_envio: "Enviado",
            remitente_nombre: "Carlos Andrés Pérez Gómez",
            rol: "Docente"
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE cn.id_acudiente = ?"),
            ["5"]
        );
    });

    test("GET devuelve un arreglo vacío si el acudiente no tiene notificaciones", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
            .get("/correos-notificaciones/acudiente/999");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("WHERE cn.id_acudiente = ?"),
            ["999"]
        );
    });

    test("GET por acudiente devuelve error 500 si falla la consulta", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al consultar notificaciones")
        );

        const response = await request(app)
            .get("/correos-notificaciones/acudiente/5");

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al consultar notificaciones");
    });

    // ==========================================
    // 3. POST / - REGISTRAR NOTIFICACIÓN
    // ==========================================

    test("POST registra una notificación correctamente", async () => {
        pool.query.mockResolvedValueOnce([
            { insertId: 10 }
        ]);

        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                asunto: "Alerta de inasistencia",
                mensaje: "El estudiante no asistió a clase",
                tipo_notificacion: "Inasistencia",
                estado_envio: "Enviado",
                id_docente: 1,
                id_acudiente: 2,
                id_estudiante: 3
            });

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            mensaje: "Notificación registrada",
            id_correo: 10
        });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO correos_notificaciones"),
            [
                "Alerta de inasistencia",
                "El estudiante no asistió a clase",
                "Inasistencia",
                "Enviado",
                1,
                2,
                3
            ]
        );
    });

    test("POST registra una notificación con valores predeterminados", async () => {
        pool.query.mockResolvedValueOnce([
            { insertId: 11 }
        ]);

        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                asunto: "Notificación general",
                mensaje: "Mensaje de prueba",
                id_docente: 1,
                id_acudiente: 2
            });

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            mensaje: "Notificación registrada",
            id_correo: 11
        });

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO correos_notificaciones"),
            [
                "Notificación general",
                "Mensaje de prueba",
                "Inasistencia",
                "Enviado",
                1,
                2,
                null
            ]
        );
    });

    test("POST devuelve error 400 si falta el asunto", async () => {
        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                mensaje: "Mensaje de prueba",
                id_docente: 1,
                id_acudiente: 2
            });

        expect(response.status).toBe(400);

        expect(response.body.error)
            .toBe("Asunto, mensaje, docente y acudiente son obligatorios");

        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve error 400 si falta el mensaje", async () => {
        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                asunto: "Notificación",
                id_docente: 1,
                id_acudiente: 2
            });

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve error 400 si falta el docente", async () => {
        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                asunto: "Notificación",
                mensaje: "Mensaje de prueba",
                id_acudiente: 2
            });

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve error 400 si falta el acudiente", async () => {
        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                asunto: "Notificación",
                mensaje: "Mensaje de prueba",
                id_docente: 1
            });

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("POST devuelve error 500 si falla el registro", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al registrar notificación")
        );

        const response = await request(app)
            .post("/correos-notificaciones")
            .send({
                asunto: "Notificación",
                mensaje: "Mensaje de prueba",
                id_docente: 1,
                id_acudiente: 2
            });

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al registrar notificación");
    });

    // ==========================================
    // 4. DELETE /:id
    // ==========================================

    test("DELETE elimina una notificación existente", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 1 }
        ]);

        const response = await request(app)
            .delete("/correos-notificaciones/10");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            mensaje: "Registro eliminado exitosamente"
        });

        expect(pool.query).toHaveBeenCalledWith(
            "DELETE FROM correos_notificaciones WHERE id_correo = ?",
            ["10"]
        );
    });

    test("DELETE devuelve error 404 si el correo no existe", async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 0 }
        ]);

        const response = await request(app)
            .delete("/correos-notificaciones/999");

        expect(response.status).toBe(404);

        expect(response.body).toEqual({
            error: "Correo no encontrado"
        });
    });

    test("DELETE devuelve error 500 si falla la eliminación", async () => {
        pool.query.mockRejectedValueOnce(
            new Error("Error al eliminar correo")
        );

        const response = await request(app)
            .delete("/correos-notificaciones/10");

        expect(response.status).toBe(500);
        expect(response.body.error)
            .toBe("Error al eliminar correo");
    });
});
