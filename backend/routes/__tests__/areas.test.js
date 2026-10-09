
import request from 'supertest';
import express from 'express';
import router from '../areas.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// Creamos una app de Express mínima solo para las pruebas
const app = express();
app.use(express.json());
app.use('/areas', router);

describe('Pruebas de Caja Blanca - Areas', () => {

  // --- GET / ---

  test('GET / sin búsqueda debe retornar lista paginada', async () => {

    // Primera consulta: obtiene las áreas
    // Segunda consulta: obtiene el total
    pool.query
      .mockResolvedValueOnce([
        [
          { id_area: 1, nombre_area: 'Matemáticas' }
        ]
      ])
      .mockResolvedValueOnce([
        [
          { total: 10 }
        ]
      ]);

    const res = await request(app).get('/areas');

    expect(res.statusCode).toBe(200);
    expect(res.body.areas).toHaveLength(1);
    expect(res.body.pagination.totalPages).toBe(1);
    expect(pool.query).toHaveBeenCalledTimes(2);
  });


  test('GET / con búsqueda debe construir query con WHERE', async () => {

    pool.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([
        [
          { total: 0 }
        ]
      ]);

    await request(app).get('/areas?search=Matematicas');

    const queryEjecutada = pool.query.mock.calls[0][0];

    expect(queryEjecutada).toContain('WHERE');
    expect(queryEjecutada).toContain('nombre_area LIKE ?');
  });


  // --- GET /:id ---

  test('GET /:id debe retornar 404 si el área no existe', async () => {

    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/areas/999');

    expect(res.statusCode).toBe(404);
  });


  test('GET /:id debe retornar el área si existe', async () => {

    pool.query.mockResolvedValueOnce([
      [
        {
          id_area: 1,
          nombre_area: 'Matemáticas'
        }
      ]
    ]);

    const res = await request(app).get('/areas/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.id_area).toBe(1);
    expect(res.body.nombre_area).toBe('Matemáticas');
  });


  // --- POST / ---

  test('POST / debe rechazar si falta nombre_area', async () => {

    const res = await request(app)
      .post('/areas')
      .send({});

    expect(res.statusCode).toBe(400);

    // No debe tocar la base de datos
    expect(pool.query).not.toHaveBeenCalled();
  });


  test('POST / debe crear área exitosamente', async () => {

    pool.query.mockResolvedValueOnce([
      {
        insertId: 8
      }
    ]);

    const res = await request(app)
      .post('/areas')
      .send({
        nombre_area: 'Electrónica'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id_area).toBe(8);
  });


  // --- PUT /:id ---

  test('PUT /:id debe retornar 404 si el área no existe', async () => {

    pool.query.mockResolvedValueOnce([
      {
        affectedRows: 0
      }
    ]);

    const res = await request(app)
      .put('/areas/999')
      .send({
        nombre_area: 'Matemáticas'
      });

    expect(res.statusCode).toBe(404);
  });


  test('PUT /:id debe actualizar exitosamente', async () => {

    pool.query.mockResolvedValueOnce([
      {
        affectedRows: 1
      }
    ]);

    const res = await request(app)
      .put('/areas/1')
      .send({
        nombre_area: 'Matemáticas'
      });

    expect(res.statusCode).toBe(200);
  });


  // --- DELETE /:id ---

  test('DELETE /:id debe retornar 404 si el área no existe', async () => {

    pool.query.mockResolvedValueOnce([
      {
        affectedRows: 0
      }
    ]);

    const res = await request(app)
      .delete('/areas/999');

    expect(res.statusCode).toBe(404);
  });


  test('DELETE /:id debe eliminar exitosamente', async () => {

    pool.query.mockResolvedValueOnce([
      {
        affectedRows: 1
      }
    ]);

    const res = await request(app)
      .delete('/areas/1');

    expect(res.statusCode).toBe(200);
  });


  // --- MANEJO DE ERRORES DE BASE DE DATOS ---

  describe('Manejo de Errores de Base de Datos (Catch)', () => {

    test('GET / debe capturar error de BD y retornar 500', async () => {

      pool.query.mockRejectedValueOnce(
        new Error('Fallo de conexión')
      );

      const res = await request(app)
        .get('/areas');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo de conexión');
    });


    test('GET /:id debe capturar error de BD y retornar 500', async () => {

      pool.query.mockRejectedValueOnce(
        new Error('Fallo')
      );

      const res = await request(app)
        .get('/areas/1');

      expect(res.statusCode).toBe(500);
    });


    test('POST / debe capturar error de BD y retornar 500', async () => {

      pool.query.mockRejectedValueOnce(
        new Error('Fallo')
      );

      const res = await request(app)
        .post('/areas')
        .send({
          nombre_area: 'Electrónica'
        });

      expect(res.statusCode).toBe(500);
    });


    test('PUT /:id debe capturar error de BD y retornar 500', async () => {

      pool.query.mockRejectedValueOnce(
        new Error('Fallo')
      );

      const res = await request(app)
        .put('/areas/1')
        .send({
          nombre_area: 'Matemáticas'
        });

      expect(res.statusCode).toBe(500);
    });


    test('DELETE /:id debe capturar error de BD y retornar 500', async () => {

      pool.query.mockRejectedValueOnce(
        new Error('Fallo')
      );

      const res = await request(app)
        .delete('/areas/1');

      expect(res.statusCode).toBe(500);
    });

  });

});
