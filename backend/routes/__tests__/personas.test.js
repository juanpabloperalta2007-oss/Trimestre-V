import request from 'supertest';
import express from 'express';
import router from '../personas.js';
 
// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';
 
// Creamos una app de Express mínima solo para las pruebas
const app = express();
app.use(express.json());
app.use('/personas', router);
 
// Datos base reutilizables
const personaValida = {
  tipo_documento: 'CC',
  numero_documento: '123',
  primer_nombre: 'Juan',
  primer_apellido: 'Perez'
};
 
describe('Pruebas de Caja Blanca - Personas', () => {
 
  // Limpia llamadas y mocks encolados entre pruebas
  beforeEach(() => {
    jest.resetAllMocks();
  });
 
  // --- GET / ---
  test('GET / sin búsqueda debe retornar lista paginada', async () => {
    // 1ra llamada devuelve rows, 2da devuelve total
    pool.query
      .mockResolvedValueOnce([[{ id_persona: 1, numero_documento: '123', primer_nombre: 'Test' }]])
      .mockResolvedValueOnce([[{ total: 25 }]]);
 
    const res = await request(app).get('/personas');
 
    expect(res.statusCode).toBe(200);
    expect(res.body.personas).toHaveLength(1);
    expect(res.body.pagination.totalPages).toBe(3); // 25 / limit 10
    expect(res.body.pagination.hasNextPage).toBe(true);
    expect(res.body.pagination.hasPrevPage).toBe(false);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });
 
  test('GET / con búsqueda debe construir query con WHERE', async () => {
    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ total: 0 }]]);
 
    await request(app).get('/personas?search=Juan');
 
    const queryEjecutada = pool.query.mock.calls[0][0];
    expect(queryEjecutada).toContain('WHERE');
    expect(queryEjecutada).toContain('numero_documento LIKE ?');
    expect(queryEjecutada).toContain('primer_nombre LIKE ?');
    expect(queryEjecutada).toContain('primer_apellido LIKE ?');
    expect(queryEjecutada).toContain('correo LIKE ?');
  });
 
  // --- GET /:id ---
  test('GET /:id debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([[]]); // Array vacío
    const res = await request(app).get('/personas/999');
    expect(res.statusCode).toBe(404);
  });
 
  test('GET /:id debe retornar la persona si existe', async () => {
    pool.query.mockResolvedValueOnce([[{ id_persona: 1, numero_documento: '123' }]]);
    const res = await request(app).get('/personas/123');
    expect(res.statusCode).toBe(200);
    expect(res.body.numero_documento).toBe('123');
  });
 
  // --- POST / ---
  test('POST / debe rechazar si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/personas')
      .send({ primer_nombre: 'Incompleto' });
 
    expect(res.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled(); // No debe tocar la BD
  });
 
  test('POST / debe rechazar documento duplicado', async () => {
    pool.query.mockResolvedValueOnce([[{ id_persona: 1 }]]); // Ya existe
    const res = await request(app).post('/personas').send(personaValida);
    expect(res.statusCode).toBe(400);
  });
 
  test('POST / debe crear persona exitosamente', async () => {
    pool.query
      .mockResolvedValueOnce([[]])                              // No existe
      .mockResolvedValueOnce([{ affectedRows: 1, insertId: 5 }]); // Insert OK
    const res = await request(app).post('/personas').send(personaValida);
    expect(res.statusCode).toBe(201);
    expect(res.body.id_persona).toBe(5);
  });
 
  // --- PUT /:id ---
  test('PUT debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).put('/personas/999').send(personaValida);
    expect(res.statusCode).toBe(404);
  });
 
  test('PUT debe actualizar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/personas/1').send({
      ...personaValida,
      segundo_nombre: 'Carlos',
      telefono: '3001234567',
      correo: 'juan@correo.com'
    });
    expect(res.statusCode).toBe(200);
  });
 
  // --- DELETE /:id ---
  test('DELETE debe retornar 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    const res = await request(app).delete('/personas/999');
    expect(res.statusCode).toBe(404);
  });
 
  test('DELETE debe eliminar exitosamente', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/personas/1');
    expect(res.statusCode).toBe(200);
  });
 
  describe('Manejo de Errores de Base de Datos (Catch)', () => {
 
    test('GET / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));
      const res = await request(app).get('/personas');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });
 
    test('GET /:id debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).get('/personas/123');
      expect(res.statusCode).toBe(500);
    });
 
    test('POST / debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).post('/personas').send(personaValida);
      expect(res.statusCode).toBe(500);
    });
 
    test('PUT /:id debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).put('/personas/1').send(personaValida);
      expect(res.statusCode).toBe(500);
    });
 
    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {
      pool.query.mockRejectedValueOnce(new Error('Fallo'));
      const res = await request(app).delete('/personas/1');
      expect(res.statusCode).toBe(500);
    });
  });
});