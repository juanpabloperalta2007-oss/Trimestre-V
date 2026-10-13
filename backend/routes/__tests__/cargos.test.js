import request from 'supertest';
import express from 'express';
import router from '../cargos.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// Creamos una app de Express para las pruebas
const app = express();
app.use(express.json());
app.use('/cargos', router);

describe('Pruebas de Caja Blanca - Cargos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // GET / - LISTAR CARGOS
  // =========================

  test('GET / debe retornar lista paginada de cargos', async () => {
    pool.query
      .mockResolvedValueOnce([[
        { id_cargo: 1, nombre_cargo: 'Administrador' },
        { id_cargo: 2, nombre_cargo: 'Docente' }
      ]])
      .mockResolvedValueOnce([[{ total: 10 }]]);

    const res = await request(app).get('/cargos');

    expect(res.statusCode).toBe(200);
    expect(res.body.cargos).toHaveLength(2);
    expect(res.body.pagination.totalItems).toBe(10);
    expect(res.body.pagination.totalPages).toBe(1);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });

  test('GET / con búsqueda debe construir consulta con WHERE', async () => {
    pool.query
      .mockResolvedValueOnce([[
        { id_cargo: 1, nombre_cargo: 'Docente' }
      ]])
      .mockResolvedValueOnce([[{ total: 1 }]]);

    const res = await request(app).get('/cargos?search=Docente');

    expect(res.statusCode).toBe(200);

    const queryEjecutada = pool.query.mock.calls[0][0];

    expect(queryEjecutada).toContain('WHERE nombre_cargo LIKE ?');

    const parametros = pool.query.mock.calls[0][1];
    expect(parametros).toEqual(['%Docente%', 10, 0]);
  });

  test('GET / sin búsqueda debe consultar todos los cargos paginados', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);

    const res = await request(app).get('/cargos');

    expect(res.statusCode).toBe(200);

    const queryEjecutada = pool.query.mock.calls[0][0];

    expect(queryEjecutada).not.toContain('WHERE');
    expect(res.body.cargos).toHaveLength(0);
    expect(res.body.pagination.totalPages).toBe(0);
  });

  test('GET / debe calcular correctamente la paginación', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 25 }]]);

    const res = await request(app)
      .get('/cargos?page=2&limit=10');

    expect(res.statusCode).toBe(200);
    expect(res.body.pagination.currentPage).toBe(2);
    expect(res.body.pagination.totalPages).toBe(3);
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(true);
  });

  test('GET / debe retornar error 500 si falla la consulta de cargos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).get('/cargos');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  test('GET / debe retornar error 500 si falla la consulta del total', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockRejectedValueOnce(new Error('Error al contar cargos'));

    const res = await request(app).get('/cargos');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al contar cargos');
  });

  // =========================
  // GET /:id - CONSULTAR CARGO
  // =========================

  test('GET /:id debe retornar 404 si el cargo no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/cargos/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.mensaje).toBe('Cargo no encontrado');
  });

  test('GET /:id debe retornar el cargo si existe', async () => {
    pool.query.mockResolvedValueOnce([[
      { id_cargo: 1, nombre_cargo: 'Administrador' }
    ]]);

    const res = await request(app).get('/cargos/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.id_cargo).toBe(1);
    expect(res.body.nombre_cargo).toBe('Administrador');
  });

  test('GET /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).get('/cargos/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // POST / - CREAR CARGO
  // =========================

  test('POST / debe rechazar el registro si falta nombre_cargo', async () => {
    const res = await request(app)
      .post('/cargos')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El nombre del cargo es obligatorio');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST / debe rechazar nombre_cargo vacío', async () => {
    const res = await request(app)
      .post('/cargos')
      .send({ nombre_cargo: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El nombre del cargo es obligatorio');
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST / debe crear un cargo correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 5 }]);

    const res = await request(app)
      .post('/cargos')
      .send({ nombre_cargo: 'Coordinador' });

    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Cargo creado correctamente');
    expect(res.body.id_cargo).toBe(5);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('POST / debe enviar el nombre correcto a la consulta SQL', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 6 }]);

    await request(app)
      .post('/cargos')
      .send({ nombre_cargo: 'Docente' });

    expect(pool.query.mock.calls[0][1]).toEqual(['Docente']);
  });

  test('POST / debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app)
      .post('/cargos')
      .send({ nombre_cargo: 'Docente' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // PUT /:id - ACTUALIZAR CARGO
  // =========================

  test('PUT /:id debe retornar 404 si el cargo no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .put('/cargos/999')
      .send({ nombre_cargo: 'Docente' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Cargo no encontrado');
  });

  test('PUT /:id debe actualizar el cargo correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .put('/cargos/1')
      .send({ nombre_cargo: 'Administrador' });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Cargo actualizado correctamente');
  });

  test('PUT /:id debe enviar los parámetros correctos a SQL', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await request(app)
      .put('/cargos/2')
      .send({ nombre_cargo: 'Docente' });

    expect(pool.query.mock.calls[0][1]).toEqual(['Docente', '2']);
  });

  test('PUT /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app)
      .put('/cargos/1')
      .send({ nombre_cargo: 'Docente' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

  // =========================
  // DELETE /:id - ELIMINAR CARGO
  // =========================

  test('DELETE /:id debe retornar 404 si el cargo no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app).delete('/cargos/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Cargo no encontrado');
  });

  test('DELETE /:id debe eliminar el cargo correctamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).delete('/cargos/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toBe('Cargo eliminado exitosamente');
  });

  test('DELETE /:id debe enviar el id correcto a SQL', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await request(app).delete('/cargos/3');

    expect(pool.query.mock.calls[0][1]).toEqual(['3']);
  });

  test('DELETE /:id debe retornar error 500 si falla la base de datos', async () => {
    pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

    const res = await request(app).delete('/cargos/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Fallo de conexión');
  });

});
