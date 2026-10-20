import request from 'supertest';
import express from 'express';
import routerCursos from '../cursos.js';  // Subes 1 nivel a routes/cursos.js
import pool from '../../db.js';           // Subes 2 niveles a backend/db.js

// Mock exacto a db.js (sube 2 niveles desde _tests_)
jest.mock('../../db.js', () => ({
  query: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api/cursos', routerCursos);

describe('Pruebas de Caja Blanca - Router Cursos (API)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/cursos
  // ============================================
  describe('GET /api/cursos', () => {
    it('Debe obtener la lista de cursos paginada con éxito (Sin filtro)', async () => {
      const mockCursos = [{ id_curso: 1, nombre_curso: '10-A', estado: 'Activo' }];
      pool.query
        .mockResolvedValueOnce([mockCursos])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get('/api/cursos');

      expect(res.statusCode).toBe(200);
      expect(res.body.cursos).toEqual(mockCursos);
      expect(res.body.pagination.currentPage).toBe(1);
    });

    it('Debe obtener cursos aplicando el filtro de búsqueda (search)', async () => {
      const mockCursos = [{ id_curso: 2, nombre_curso: '11-B', estado: 'Activo' }];
      pool.query
        .mockResolvedValueOnce([mockCursos])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get('/api/cursos?search=11&page=2&limit=5');

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(2);
    });

    it('Debe retornar status 500 en GET / si la BD falla', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error en BD'));

      const res = await request(app).get('/api/cursos');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Error en BD');
    });
  });

  // ============================================
  // GET /api/cursos/:id
  // ============================================
  describe('GET /api/cursos/:id', () => {
    it('Debe obtener un curso por su ID', async () => {
      const mockCurso = { id_curso: 1, nombre_curso: '10-A', estado: 'Activo' };
      pool.query.mockResolvedValueOnce([[mockCurso]]);

      const res = await request(app).get('/api/cursos/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockCurso);
    });

    it('Debe retornar 404 si el curso no existe', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/cursos/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('mensaje', 'Curso no encontrado');
    });

    it('Debe retornar status 500 en GET /:id si ocurre un error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error inesperado'));

      const res = await request(app).get('/api/cursos/1');

      expect(res.statusCode).toBe(500);
    });
  });

  // ============================================
  // POST /api/cursos
  // ============================================
  describe('POST /api/cursos', () => {
    it('Debe retornar 400 si falta el nombre del curso', async () => {
      const res = await request(app).post('/api/cursos').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'El nombre del curso es obligatorio');
    });

    it('Debe retornar 400 si el curso ya existe', async () => {
      pool.query.mockResolvedValueOnce([[{ id_curso: 1 }]]);

      const res = await request(app)
        .post('/api/cursos')
        .send({ nombre_curso: '10-A' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Ya existe un curso con ese nombre');
    });

    it('Debe crear un curso con un estado específico enviado en el body', async () => {
      pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 5 }]);

      const res = await request(app)
        .post('/api/cursos')
        .send({ nombre_curso: '9-B', estado: 'Inactivo' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('mensaje', 'Curso creado correctamente');
      expect(res.body).toHaveProperty('id_curso', 5);
    });

    // CUBRE LÍNEA 87 DE CURSOS.JS (estado || "Activo")
    it('Debe crear un curso asignando el estado "Activo" por defecto si no se envía el parámetro estado', async () => {
      pool.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 6 }]);

      const res = await request(app)
        .post('/api/cursos')
        .send({ nombre_curso: '8-C' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id_curso', 6);
    });

    it('Debe retornar status 500 en POST / ante fallos en el servidor', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo al insertar'));

      const res = await request(app)
        .post('/api/cursos')
        .send({ nombre_curso: 'Error Course' });

      expect(res.statusCode).toBe(500);
    });
  });

  // ============================================
  // PUT /api/cursos/:id
  // ============================================
  describe('PUT /api/cursos/:id', () => {
    it('Debe actualizar un curso con éxito', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put('/api/cursos/1')
        .send({ nombre_curso: '10-A Editado', estado: 'Activo' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje', 'Curso actualizado correctamente');
    });

    it('Debe retornar 404 si intenta actualizar un curso inexistente', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put('/api/cursos/999')
        .send({ nombre_curso: 'No existe', estado: 'Inactivo' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Curso no encontrado');
    });

    it('Debe retornar status 500 en PUT /:id si la base de datos falla', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo en UPDATE'));

      const res = await request(app)
        .put('/api/cursos/1')
        .send({ nombre_curso: '10-A', estado: 'Activo' });

      expect(res.statusCode).toBe(500);
    });
  });

  // ============================================
  // DELETE /api/cursos/:id
  // ============================================
  describe('DELETE /api/cursos/:id', () => {
    it('Debe eliminar un curso con éxito', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete('/api/cursos/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje', 'Curso eliminado exitosamente');
    });

    it('Debe retornar 404 si intenta eliminar un curso inexistente', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete('/api/cursos/999');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Curso no encontrado');
    });

    it('Debe retornar status 500 en DELETE /:id si ocurre un fallo', async () => {
      pool.query.mockRejectedValueOnce(new Error('Error en DELETE'));

      const res = await request(app).delete('/api/cursos/1');

      expect(res.statusCode).toBe(500);
    });
  });

});