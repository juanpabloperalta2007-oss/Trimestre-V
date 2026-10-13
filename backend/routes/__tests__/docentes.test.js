import request from 'supertest';
import express from 'express';
import router from '../docentes.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// Creamos una app de Express para las pruebas
const app = express();
app.use(express.json());
app.use('/docentes', router);

describe('Pruebas de Caja Blanca - Docentes', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // GET / - LISTAR DOCENTES
  // =========================

  test('GET / debe retornar lista paginada de docentes', async () => {
    pool.query
      .mockResolvedValueOnce([[
        {
          id_docente: 1,
          id_persona: 2,
          id_cargo: 1,
          primer_nombre: 'Juan',
          primer_apellido: 'Perez',
          numero_documento: '123456'
        }
      ]])
      .mockResolvedValueOnce([[{ total: 10 }]]);

    const res = await request(app).get('/docentes');

    expect(res.statusCode).toBe(200);
    expect(res.body.docentes).toHaveLength(1);
    expect(res.body.pagination.totalItems).toBe(10);
    expect(res.body.pagination.totalPages).toBe(1);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('GET / con búsqueda debe construir consulta con WHERE', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);

    const res = await request(app).get('/docentes?search=Juan');

    expect(res.statusCode).toBe(200);

    const queryEjecutada = pool.query.mock.calls[0][0];

    expect(queryEjecutada).toContain('WHERE');
    expect(queryEjecutada).toContain('primer_nombre LIKE ?');
    expect(queryEjecutada).toContain('primer_apellido LIKE ?');
    expect(queryEjecutada).toContain('numero_documento LIKE ?');
  });

  test('GET / debe indicar que hay página siguiente cuando corresponde', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 25 }]]);

    const res = await request(app).get('/docentes?page=1&limit=10');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(false);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  test('GET / debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).get('/docentes');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // GET /:id - CONSULTAR DOCENTE
  // =========================

  test('GET /:id debe retornar 404 si el docente no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/docentes/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toBe('Docente no encontrado');
  });

  test('GET /:id debe retornar el docente si existe', async () => {
    pool.query.mockResolvedValueOnce([[
      {
        id_docente: 1,
        id_persona: 2,
        id_cargo: 1,
        primer_nombre: 'Juan',
        primer_apellido: 'Perez'
      }
    ]]);

    const res = await request(app).get('/docentes/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.id_docente).toBe(1);
    expect(res.body.primer_nombre).toBe('Juan');
  });

  test('GET /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).get('/docentes/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // POST / - REGISTRAR DOCENTE
  // =========================

  test('POST / debe rechazar el registro si falta id_persona', async () => {
    const res = await request(app)
      .post('/docentes')
      .send({ id_cargo: 1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El id_persona es obligatorio');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST / debe rechazar una persona que ya está registrada como docente', async () => {
    pool.query.mockResolvedValueOnce([[
      { id_docente: 1 }
    ]]);

    const res = await request(app)
      .post('/docentes')
      .send({
        id_persona: 2,
        id_cargo: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      'Esta persona ya está registrada como docente'
    );
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('POST / debe registrar un docente correctamente', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post('/docentes')
      .send({
        id_persona: 3,
        id_cargo: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Docente registrado correctamente');
    expect(res.body.id_docente).toBe(5);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('POST / debe permitir registrar docente sin cargo', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 6 }]);

    const res = await request(app)
      .post('/docentes')
      .send({ id_persona: 4 });

    expect(res.statusCode).toBe(201);

    const parametrosInsert = pool.query.mock.calls[1][1];

    expect(parametrosInsert).toEqual([4, null]);
  });

  test('POST / debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app)
      .post('/docentes')
      .send({
        id_persona: 3,
        id_cargo: 1
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // PUT /:id - ACTUALIZAR DOCENTE
  // =========================

  test('PUT /:id debe retornar 404 si el docente no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .put('/docentes/999')
      .send({ id_cargo: 2 });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Docente no encontrado');
  });

  test('PUT /:id debe actualizar el cargo correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/docentes/1')
      .send({ id_cargo: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Docente actualizado correctamente');
  });

  test('PUT /:id debe permitir dejar el cargo en null', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/docentes/1')
      .send({});

    expect(res.statusCode).toBe(200);

    const parametrosUpdate = pool.query.mock.calls[0][1];

    expect(parametrosUpdate).toEqual([null, '1']);
  });

  test('PUT /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app)
      .put('/docentes/1')
      .send({ id_cargo: 2 });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // DELETE /:id - ELIMINAR DOCENTE
  // =========================

  test('DELETE /:id debe retornar 404 si el docente no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/docentes/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Docente no encontrado');
  });

  test('DELETE /:id debe eliminar el docente correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/docentes/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Docente eliminado exitosamente');
  });

  test('DELETE /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).delete('/docentes/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

});
