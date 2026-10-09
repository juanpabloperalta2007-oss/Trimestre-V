import request from "supertest";
import express from "express";
import pool from "../../db.js";
import cursosRouter from "../cursos.js";

// Intercepta las llamadas a la base de datos usando el mock de db.js
jest.mock("../../db.js");

const app = express();
app.use(express.json());
app.use("/api/cursos", cursosRouter);

describe("Pruebas unitarias para la ruta de Cursos", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // 1. GET / (Obtener cursos paginados y búsqueda)
  // ======================================================
  describe("GET / (Obtener cursos)", () => {
    test("Debe obtener la lista de cursos con paginación correctamente", async () => {
      const mockCursos = [
        { id_curso: 1, nombre_curso: "1001", estado: "Activo" }
      ];

      pool.query
        .mockResolvedValueOnce([mockCursos])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get("/api/cursos");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("cursos");
      expect(res.body.pagination.totalItems).toBe(1);
    });

    test("Debe filtrar cursos por parámetro search", async () => {
      const mockCursos = [
        { id_curso: 1, nombre_curso: "1001", estado: "Activo" }
      ];

      pool.query
        .mockResolvedValueOnce([mockCursos])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get("/api/cursos?search=1001");

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.totalItems).toBe(1);
    });

    test("Debe retornar estado 500 si falla la consulta de cursos", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de BD"));

      const res = await request(app).get("/api/cursos");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 2. GET /:id (Obtener por ID)
  // ======================================================
  describe("GET /:id (Obtener por ID)", () => {
    test("Debe obtener un curso por su ID", async () => {
      const mockCurso = { id_curso: 1, nombre_curso: "1001", estado: "Activo" };

      pool.query.mockResolvedValueOnce([[mockCurso]]);

      const res = await request(app).get("/api/cursos/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockCurso);
    });

    test("Debe retornar 404 si el curso no existe", async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/cursos/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ mensaje: "Curso no encontrado" });
    });

    test("Debe retornar 500 ante un error al consultar por ID", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de BD"));

      const res = await request(app).get("/api/cursos/1");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 3. POST / (Crear curso)
  // ======================================================
  describe("POST / (Crear curso)", () => {
    test("Debe retornar 400 si falta el nombre_curso", async () => {
      const res = await request(app)
        .post("/api/cursos")
        .send({ estado: "Activo" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "El nombre del curso es obligatorio" });
    });

    test("Debe retornar 400 si ya existe un curso con el mismo nombre", async () => {
      pool.query.mockResolvedValueOnce([[{ id_curso: 1 }]]);

      const res = await request(app)
        .post("/api/cursos")
        .send({ nombre_curso: "1001" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Ya existe un curso con ese nombre" });
    });

    test("Debe crear un curso correctamente", async () => {
      pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 3 }]);

      const res = await request(app)
        .post("/api/cursos")
        .send({ nombre_curso: "1002", estado: "Activo" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        mensaje: "Curso creado correctamente",
        id_curso: 3
      });
    });

    test("Debe retornar 500 ante un error al insertar", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de inserción"));

      const res = await request(app)
        .post("/api/cursos")
        .send({ nombre_curso: "1002" });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 4. PUT /:id (Actualizar curso)
  // ======================================================
  describe("PUT /:id (Actualizar curso)", () => {
    test("Debe actualizar los datos de un curso", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put("/api/cursos/1")
        .send({ nombre_curso: "1001-A", estado: "Inactivo" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ mensaje: "Curso actualizado correctamente" });
    });

    test("Debe retornar 404 si el curso a actualizar no existe", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put("/api/cursos/999")
        .send({ nombre_curso: "1001-A", estado: "Inactivo" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Curso no encontrado" });
    });

    test("Debe retornar 500 ante un error al actualizar", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al actualizar"));

      const res = await request(app)
        .put("/api/cursos/1")
        .send({ nombre_curso: "1001-A", estado: "Inactivo" });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 5. DELETE /:id (Eliminar curso)
  // ======================================================
  describe("DELETE /:id (Eliminar curso)", () => {
    test("Debe eliminar un curso por su ID", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete("/api/cursos/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ mensaje: "Curso eliminado exitosamente" });
    });

    test("Debe retornar 404 si el curso a eliminar no existe", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete("/api/cursos/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Curso no encontrado" });
    });

    test("Debe retornar 500 ante un error al eliminar", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al eliminar"));

      const res = await request(app).delete("/api/cursos/1");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

});