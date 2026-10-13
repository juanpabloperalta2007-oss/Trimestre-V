import request from 'supertest';
import express from 'express';
import router from '../coordinadores.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// Creamos una app de Express para las pruebas
const app = express();
app.use(express.json());
app.use('/coordinadores', router);

describe('Pruebas de Caja Blanca - Coordinadores', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // GET / - LISTAR COORDINADORES
  // =========================

  test('GET / debe retornar lista paginada de coordinadores', async () => {
    pool.query
      .mockResolvedValueOnce([[
        {
          id_coordinador: 1,
          id_persona: 2,
          area_asignada: 'Coordinación Académica',
          estado: 'Activo',
          primer_nombre: 'Carlos',
          primer_apellido: 'Perez',
          numero_documento: '123456'
        }
      ]])
      .mockResolvedValueOnce([[{ total: 10 }]]);

    const res = await request(app).get('/coordinadores');

    expect(res.statusCode).toBe(200);
    expect(res.body.coordinadores).toHaveLength(1);
    expect(res.body.pagination.totalItems).toBe(10);
    expect(res.body.pagination.totalPages).toBe(1);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('GET / con búsqueda debe construir consulta con WHERE', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);

    const res = await request(app)
      .get('/coordinadores?search=Academica');

    expect(res.statusCode).toBe(200);

    const queryEjecutada = pool.query.mock.calls[0][0];

    expect(queryEjecutada).toContain('WHERE');
    expect(queryEjecutada).toContain('primer_nombre LIKE ?');
    expect(queryEjecutada).toContain('primer_apellido LIKE ?');
    expect(queryEjecutada).toContain('area_asignada LIKE ?');
  });

  test('GET / debe calcular correctamente la paginación', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 25 }]]);

    const res = await request(app)
      .get('/coordinadores?page=1&limit=10');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.currentPage).toBe(1);
    expect(res.body.pagination.totalPages).toBe(3);
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(false);
  });

  test('GET / debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).get('/coordinadores');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // GET /:id - CONSULTAR COORDINADOR
  // =========================

  test('GET /:id debe retornar 404 si el coordinador no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/coordinadores/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toBe('Coordinador no encontrado');
  });

  test('GET /:id debe retornar el coordinador si existe', async () => {
    pool.query.mockResolvedValueOnce([[
      {
        id_coordinador: 1,
        id_persona: 2,
        area_asignada: 'Coordinación Académica',
        estado: 'Activo',
        primer_nombre: 'Carlos',
        primer_apellido: 'Perez'
      }
    ]]);

    const res = await request(app).get('/coordinadores/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.id_coordinador).toBe(1);
    expect(res.body.area_asignada).toBe('Coordinación Académica');
  });

  test('GET /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).get('/coordinadores/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // POST / - REGISTRAR COORDINADOR
  // =========================

  test('POST / debe rechazar el registro si falta id_persona', async () => {
    const res = await request(app)
      .post('/coordinadores')
      .send({
        area_asignada: 'Coordinación Académica',
        estado: 'Activo'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El id_persona es obligatorio');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST / debe registrar un coordinador correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post('/coordinadores')
      .send({
        id_persona: 3,
        area_asignada: 'Coordinación Académica',
        estado: 'Activo'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Coordinador registrado correctamente');
    expect(res.body.id_coordinador).toBe(5);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('POST / debe usar null si no se envía area_asignada', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 6 }]);

    const res = await request(app)
      .post('/coordinadores')
      .send({ id_persona: 4 });

    expect(res.statusCode).toBe(201);

    const parametrosInsert = pool.query.mock.calls[0][1];

    expect(parametrosInsert).toEqual([4, null, 'Activo']);
  });

  test('POST / debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app)
      .post('/coordinadores')
      .send({
        id_persona: 3,
        area_asignada: 'Coordinación Académica',
        estado: 'Activo'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // PUT /:id - ACTUALIZAR COORDINADOR
  // =========================

  test('PUT /:id debe retornar 404 si el coordinador no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .put('/coordinadores/999')
      .send({
        area_asignada: 'Coordinación de Convivencia',
        estado: 'Activo'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Coordinador no encontrado');
  });

  test('PUT /:id debe actualizar el coordinador correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/coordinadores/1')
      .send({
        area_asignada: 'Coordinación de Convivencia',
        estado: 'Activo'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Coordinador actualizado correctamente');
  });

  test('PUT /:id debe usar null si no se envía area_asignada', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/coordinadores/1')
      .send({ estado: 'Inactivo' });

    expect(res.statusCode).toBe(200);

    const parametrosUpdate = pool.query.mock.calls[0][1];

    expect(parametrosUpdate).toEqual([null, 'Inactivo', '1']);
  });

  test('PUT /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app)
      .put('/coordinadores/1')
      .send({
        area_asignada: 'Coordinación Académica',
        estado: 'Activo'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // DELETE /:id - ELIMINAR COORDINADOR
  // =========================

  test('DELETE /:id debe retornar 404 si el coordinador no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/coordinadores/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Coordinador no encontrado');
  });

  test('DELETE /:id debe eliminar el coordinador correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/coordinadores/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Coordinador eliminado exitosamente');
  });

  test('DELETE /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).delete('/coordinadores/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

});

