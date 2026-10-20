import request from "supertest";
import express from "express";
import pool from "../../db.js";
import estudiantesRouter from "../estudiantes.js";

jest.mock("../../db.js");

const app = express();
app.use(express.json());
app.use("/api/estudiantes", estudiantesRouter);

describe("Pruebas unitarias para la ruta de Estudiantes", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================================
  // 1. PRUEBAS GET / (Paginación y Búsqueda)
  // ======================================================
  describe("GET / (Obtener estudiantes con paginación)", () => {
    test("Debe obtener la lista de estudiantes paginada correctamente", async () => {
      const mockEstudiantes = [
        { id_estudiante: 1, id_persona: 1, codigo_lista: 101, estado: "Activo" }
      ];

      pool.query
        .mockResolvedValueOnce([mockEstudiantes])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get("/api/estudiantes");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("estudiantes");
      expect(res.body.pagination.totalItems).toBe(1);
    });

    test("Debe filtrar estudiantes cuando se envía el parámetro search", async () => {
      const mockEstudiantes = [
        { id_estudiante: 1, id_persona: 1, codigo_lista: 101, estado: "Activo" }
      ];

      pool.query
        .mockResolvedValueOnce([mockEstudiantes])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get("/api/estudiantes?search=Juan");

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.totalItems).toBe(1);
    });

    test("Debe retornar estado 500 si la consulta falla", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de BD"));

      const res = await request(app).get("/api/estudiantes");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 2. PRUEBAS GET /:id (Obtener por ID)
  // ======================================================
  describe("GET /:id (Obtener por ID)", () => {
    test("Debe obtener un estudiante por su ID", async () => {
      const mockEstudiante = {
        id_estudiante: 1,
        id_persona: 1,
        codigo_lista: 101,
        estado: "Activo"
      };

      pool.query.mockResolvedValueOnce([[mockEstudiante]]);

      const res = await request(app).get("/api/estudiantes/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockEstudiante);
    });

    test("Debe retornar 404 si el estudiante no existe", async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/estudiantes/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ mensaje: "Estudiante no encontrado" });
    });

    test("Debe retornar 500 ante un error al consultar por ID", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de BD"));

      const res = await request(app).get("/api/estudiantes/1");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 3. PRUEBAS POST / (Registrar estudiante)
  // ======================================================
  describe("POST / (Registrar estudiante)", () => {
    test("Debe retornar 400 si faltan campos obligatorios", async () => {
      const res = await request(app)
        .post("/api/estudiantes")
        .send({ estado: "Activo" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "id_persona y codigo_lista son obligatorios" });
    });

    test("Debe retornar 400 si el código de lista ya existe", async () => {
      pool.query.mockResolvedValueOnce([[{ id_estudiante: 1 }]]);

      const res = await request(app)
        .post("/api/estudiantes")
        .send({ id_persona: 1, codigo_lista: 101 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Ya existe un estudiante con ese código de lista" });
    });

    test("Debe registrar un estudiante correctamente enviando el estado explícito", async () => {
      pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 5 }]);

      const res = await request(app)
        .post("/api/estudiantes")
        .send({ id_persona: 1, codigo_lista: 102, estado: "Inactivo" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        mensaje: "Estudiante registrado correctamente",
        id_estudiante: 5
      });
    });

    // 🌟 ESTA PRUEBA CUBRE LA LÍNEA 82 (estado || "Activo")
    test("Debe registrar un estudiante asignando 'Activo' por defecto si no se envía el estado", async () => {
      pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 6 }]);

      const res = await request(app)
        .post("/api/estudiantes")
        .send({ id_persona: 2, codigo_lista: 103 }); // No enviamos 'estado'

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        mensaje: "Estudiante registrado correctamente",
        id_estudiante: 6
      });
    });

    test("Debe retornar 500 ante un error en la inserción", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error de inserción"));

      const res = await request(app)
        .post("/api/estudiantes")
        .send({ id_persona: 1, codigo_lista: 102 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 4. PRUEBAS PUT /:id (Actualizar estudiante)
  // ======================================================
  describe("PUT /:id (Actualizar estudiante)", () => {
    test("Debe actualizar los datos de un estudiante", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put("/api/estudiantes/1")
        .send({ codigo_lista: 103, estado: "Inactivo" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ mensaje: "Estudiante actualizado correctamente" });
    });

    test("Debe retornar 404 si el estudiante a actualizar no existe", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put("/api/estudiantes/999")
        .send({ codigo_lista: 103, estado: "Inactivo" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Estudiante no encontrado" });
    });

    test("Debe retornar 500 ante un error al actualizar", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al actualizar"));

      const res = await request(app)
        .put("/api/estudiantes/1")
        .send({ codigo_lista: 103, estado: "Inactivo" });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ======================================================
  // 5. PRUEBAS DELETE /:id (Eliminar estudiante)
  // ======================================================
  describe("DELETE /:id (Eliminar estudiante)", () => {
    test("Debe eliminar un estudiante por su ID", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete("/api/estudiantes/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ mensaje: "Estudiante eliminado exitosamente" });
    });

    test("Debe retornar 404 si el estudiante a eliminar no existe", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete("/api/estudiantes/999");

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "Estudiante no encontrado" });
    });

    test("Debe retornar 500 ante un error al eliminar", async () => {
      pool.query.mockRejectedValueOnce(new Error("Error al eliminar"));

      const res = await request(app).delete("/api/estudiantes/1");

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

});