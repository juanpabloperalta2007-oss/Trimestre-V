import request from "supertest";
import express from "express";
import pool from "../../db.js";
import reportesRouter from "../reportes.js";

// Intercepta las llamadas a la base de datos usando el mock de __mocks__/db.js
jest.mock("../../db.js");

const app = express();
app.use(express.json());
app.use("/api/reportes", reportesRouter);

describe("Pruebas unitarias para la ruta de Reportes", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // 1. GET / (Obtener todos los reportes)
  // ======================================================
  describe("GET / (Obtener todos los reportes)", () => {
    test("Debe obtener la lista de reportes formateada correctamente", async () => {
      const mockRows = [
        {
          id_asistencia: 1,
          fecha: "2026-10-09",
          estado: "presente",
          observaciones: "Llegó a tiempo",
          id_estudiante: 10,
          numero_documento: "12345678",
          primer_nombre: "Juan",
          segundo_nombre: "Carlos",
          primer_apellido: "Pérez",
          segundo_apellido: "Gómez"
        }
      ];

      pool.query.mockResolvedValueOnce([mockRows]);

      const res = await request(app).get("/api/reportes");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        reportes: [
          {
            id_asistencia: 1,
            id_estudiante: 10,
            numero_documento: "12345678",
            nombre_estudiante: "Juan Carlos Pérez Gómez",
            fecha: "2026-10-09",
            estado: "presente",
            observaciones: "Llegó a tiempo"
          }
        ],
        total: 1
      });
    });

    test("Debe manejar adecuadamente nombres sin segundo nombre o segundo apellido", async () => {
      const mockRows = [
        {
          id_asistencia: 2,
          fecha: "2026-10-09",
          estado: "falla",
          observaciones: null,
          id_estudiante: 11,
          numero_documento: "87654321",
          primer_nombre: "Ana",
          segundo_nombre: null,
          primer_apellido: "Rojas",
          segundo_apellido: null
        }
      ];

      pool.query.mockResolvedValueOnce([mockRows]);

      const res = await request(app).get("/api/reportes");

      expect(res.statusCode).toBe(200);
      expect(res.body.reportes[0].nombre_estudiante).toBe("Ana Rojas");
    });

    test("Debe retornar estado 500 ante un error en la consulta de reportes", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al consultar reportes"));

      const res = await request(app).get("/api/reportes");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Error al obtener los reportes");
      expect(res.body).toHaveProperty("detalle", "Error al consultar reportes");
    });
  });

  // ======================================================
  // 2. GET /resumen (Resumen del dashboard)
  // ======================================================
  describe("GET /resumen (Obtener resumen de asistencia)", () => {
    test("Debe retornar el resumen de asistencia formateado correctamente con números", async () => {
      const mockResumen = [{
        total_registros: "50",
        asistencias: "30",
        inasistencias: "10",
        justificadas: "5",
        retardos: "5"
      }];

      pool.query.mockResolvedValueOnce([mockResumen]);

      const res = await request(app).get("/api/reportes/resumen");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        total_registros: 50,
        asistencias: 30,
        inasistencias: 10,
        justificadas: 5,
        retardos: 5
      });
    });

    test("Debe retornar ceros por defecto si no existen registros", async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/reportes/resumen");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        total_registros: 0,
        asistencias: 0,
        inasistencias: 0,
        justificadas: 0,
        retardos: 0
      });
    });

    test("Debe retornar estado 500 si falla la consulta del resumen", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al calcular resumen"));

      const res = await request(app).get("/api/reportes/resumen");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Error al obtener el resumen");
      expect(res.body).toHaveProperty("detalle", "Error al calcular resumen");
    });
  });

  // ======================================================
  // 3. GET /estudiante/:id (Reporte por estudiante)
  // ======================================================
  describe("GET /estudiante/:id (Obtener reporte por estudiante)", () => {
    test("Debe obtener la lista de asistencias del estudiante especificado", async () => {
      const mockRows = [
        {
          id_asistencia: 3,
          fecha: "2026-10-09",
          estado: "presente",
          observaciones: "Asistió",
          id_estudiante: 10,
          numero_documento: "12345678",
          primer_nombre: "Juan",
          segundo_nombre: null,
          primer_apellido: "Pérez",
          segundo_apellido: "Gómez"
        }
      ];

      pool.query.mockResolvedValueOnce([mockRows]);

      const res = await request(app).get("/api/reportes/estudiante/10");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        reportes: [
          {
            id_asistencia: 3,
            id_estudiante: 10,
            numero_documento: "12345678",
            nombre_estudiante: "Juan Pérez Gómez",
            fecha: "2026-10-09",
            estado: "presente",
            observaciones: "Asistió"
          }
        ],
        total: 1
      });
    });

    test("Debe retornar una lista vacía si el estudiante no tiene asistencias", async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/reportes/estudiante/999");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        reportes: [],
        total: 0
      });
    });

    test("Debe retornar estado 500 ante un error al consultar por estudiante", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error en la consulta por estudiante"));

      const res = await request(app).get("/api/reportes/estudiante/10");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error", "Error al obtener el reporte del estudiante");
      expect(res.body).toHaveProperty("detalle", "Error en la consulta por estudiante");
    });
  });

});