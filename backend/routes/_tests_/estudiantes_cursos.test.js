import request from "supertest";
import express from "express";
import pool from "../../db.js";
import estudiantesCursosRouter from "../estudiantes_cursos.js";

jest.mock("../../db.js");

const app = express();
app.use(express.json());
app.use("/api/estudiantes-cursos", estudiantesCursosRouter);

describe("Pruebas unitarias para la ruta de Estudiantes-Cursos", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // 1. GET / (Obtener todas las matrículas)
  // ======================================================
  describe("GET / (Obtener matrículas)", () => {
    test("Debe obtener la lista de matrículas correctamente", async () => {
      const mockMatriculas = [
        {
          id_estudiante: 1,
          id_curso: 2,
          anio: 2026,
          primer_nombre: "Juan",
          primer_apellido: "Pérez",
          nombre_curso: "1001"
        }
      ];

      pool.query.mockResolvedValueOnce([mockMatriculas]);

      const res = await request(app).get("/api/estudiantes-cursos");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ matriculas: mockMatriculas });
    });

    test("Debe retornar estado 500 si la consulta falla", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de BD"));

      const res = await request(app).get("/api/estudiantes-cursos");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 2. POST / (Matricular estudiante)
  // ======================================================
  describe("POST / (Matricular estudiante)", () => {
    test("Debe retornar 400 si faltan id_estudiante o id_curso", async () => {
      const res = await request(app)
        .post("/api/estudiantes-cursos")
        .send({ id_estudiante: 1 }); // Falta id_curso

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "id_estudiante e id_curso son obligatorios" });
    });

    test("Debe matricular un estudiante correctamente con año explícito", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post("/api/estudiantes-cursos")
        .send({ id_estudiante: 1, id_curso: 2, anio: 2026 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ mensaje: "Estudiante matriculado en curso correctamente" });
    });

    test("Debe matricular un estudiante usando el año actual si no se proporciona anio", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post("/api/estudiantes-cursos")
        .send({ id_estudiante: 1, id_curso: 2 }); // Sin campo anio

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ mensaje: "Estudiante matriculado en curso correctamente" });
    });

    test("Debe retornar estado 500 si falla la inserción", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al insertar"));

      const res = await request(app)
        .post("/api/estudiantes-cursos")
        .send({ id_estudiante: 1, id_curso: 2 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 3. DELETE /:id_estudiante/:id_curso/:anio (Eliminar matrícula)
  // ======================================================
  describe("DELETE /:id_estudiante/:id_curso/:anio", () => {
    test("Debe eliminar una matrícula correctamente", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete("/api/estudiantes-cursos/1/2/2026");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ mensaje: "Matrícula eliminada correctamente" });
    });

    test("Debe retornar 404 si la matrícula no existe", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete("/api/estudiantes-cursos/99/99/2026");

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Matrícula no encontrada" });
    });

    test("Debe retornar estado 500 ante un error al eliminar", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al eliminar"));

      const res = await request(app).delete("/api/estudiantes-cursos/1/2/2026");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

});