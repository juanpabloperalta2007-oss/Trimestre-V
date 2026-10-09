import request from 'supertest';
import express from 'express';
import router from '../acudientes.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// Creamos una app de Express mínima solo para las pruebas
const app = express();
app.use(express.json());
app.use('/acudientes', router);

describe('Pruebas de Caja Blanca - Acudientes', () => {

  // Limpia llamadas y mocks encolados entre pruebas
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // --- GET / ---
  test('GET / sin búsqueda debe retornar lista paginada', async () => {
    // 1ra llamada devuelve rows, 2da devuelve total
    pool.query
      .mockResolvedValueOnce([[{ id_acudiente: 1, id_persona: 10, direccion: 'Calle 1', primer_nombre: 'Test' }]])
      .mockResolvedValueOnce([[{ total: 25 }]]);

    const res = await request(app).get('/acudientes');

    expect(res.statusCode).toBe(200);
    expect(res.body.acudientes).toHaveLength(1);
    expect(res.body.pagination.totalPages).toBe(3); // 25 / limit 10
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(false);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('GET / con búsqueda debe construir query con WHERE', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);

    await request(app).get('/acudientes?search=Juan');

    const queryEjecutada = pool.query.mock.calls[0][0];
    const paramsEjecutados = pool.query.mock.calls[0][1];
    expect(queryEjecutada).toContain('WHERE');
    expect(queryEjecutada).toContain('p.primer_nombre LIKE ?');
    expect(queryEjecutada).toContain('p.primer_apellido LIKE ?');
    expect(queryEjecutada).toContain('p.numero_documento LIKE ?');
    // 3 parámetros de búsqueda + limit + offset
    expect(paramsEjecutados).toEqual(['%Juan%', '%Juan%', '%Juan%', 10, 0]);
  });

  test('GET / con page=2 debe marcar hasPrevPage como true', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 25 }]]);

    const res = await request(app).get('/acudientes?page=2&limit=10');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.currentPage).toBe(2);
    expect(res.body.pagination.hasPrevPage).toBe(true);
  });

  // --- GET /exist/:documento ---
  test('GET /exist/:documento debe retornar exists true si existe', async () => {
    pool.query.mockResolvedValueOnce([[{ 1: 1 }]]);
    const res = await request(app).get('/acudientes/exist/123');
    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(true);
  });

  test('GET /exist/:documento debe retornar exists false si no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/acudientes/exist/999');
    expect(res.statusCode).toBe(200);
    expect(res.body.exists).toBe(false);
  });

  // --- GET /:id ---
  test('GET /:id debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]); // Array vacío
    const res = await request(app).get('/acudientes/999');
    expect(res.statusCode).toBe(404);
  });

  test('GET /:id debe retornar el acudiente si existe', async () => {
    pool.query.mockResolvedValueOnce([[{ id_acudiente: 1, id_persona: 10 }]]);
    const res = await request(app).get('/acudientes/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id_acudiente).toBe(1);
  });

  // --- POST / ---
  test('POST / debe rechazar si falta id_persona', async () => {
    const res = await request(app)
      .post('/acudientes')
      .send({ direccion: 'Calle 1' });

    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled(); // No debe tocar la BD
  });

  test('POST / debe rechazar persona ya registrada como acudiente', async () => {
    pool.query.mockResolvedValueOnce([[{ id_acudiente: 1 }]]); // Ya existe
    const res = await request(app).post('/acudientes').send({
      id_persona: 10, direccion: 'Calle 1'
    });
    expect(res.statusCode).toBe(400);
  });

  test('POST / debe crear acudiente exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce([[]])                              // No existe
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 7 }]); // Insert OK
    const res = await request(app).post('/acudientes').send({
      id_persona: 10, direccion: 'Calle 1'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.id_acudiente).toBe(7);
  });

  test('POST / sin dirección debe guardar null', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 8 }]);
    const res = await request(app).post('/acudientes').send({ id_persona: 11 });
    expect(res.statusCode).toBe(201);
    expect(pool.query.mock.calls[1][1]).toEqual([11, null]);
  });

  // --- PUT /:id ---
  test('PUT debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/acudientes/999').send({ direccion: 'X' });
    expect(res.statusCode).toBe(404);
  });

  test('PUT debe actualizar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/acudientes/1').send({ direccion: 'Nueva calle' });
    expect(res.statusCode).toBe(200);
  });

  // --- DELETE /:id ---
  test('DELETE debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/acudientes/999');
    expect(res.statusCode).toBe(404);
  });

  test('DELETE debe eliminar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/acudientes/1');
    expect(res.statusCode).toBe(200);
  });

  describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
      const res = await request(app).get('/acudientes');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });

    test('GET /exist/:documento debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).get('/acudientes/exist/123');
      expect(res.statusCode).toBe(500);
    });

    test('GET /:id debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).get('/acudientes/1');
      expect(res.statusCode).toBe(500);
    });

    test('POST / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).post('/acudientes').send({
        id_persona: 10, direccion: 'Calle 1'
      });
      expect(res.statusCode).toBe(500);
    });

    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).put('/acudientes/1').send({ direccion: 'X' });
      expect(res.statusCode).toBe(500);
    });

    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).delete('/acudientes/1');
      expect(res.statusCode).toBe(500);
    });
  });
});