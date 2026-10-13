import request from 'supertest';
import express from 'express';
import router from '../acudientes_estudiantes.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// App de Express mínima para las pruebas
const app = express();
app.use(express.json());
app.use('/acudientes-estudiantes', router);

describe('Pruebas de Caja Blanca - Acudientes Estudiantes', () => {

    beforeAll(() => {
        // Silenciar los console.log y console.error durante las pruebas
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ======================================================
    // 1. GET / (Obtener todas las relaciones)
    // ======================================================

    test('GET / debe retornar todas las relaciones acudiente-estudiante', async () => {
        pool.query.mockResolvedValueOnce([
            [
                {
                    id_acudiente: 1,
                    id_estudiante: 2,
                    parentesco: 'Padre',
                    nombre_acudiente: 'Juan',
                    apellido_acudiente: 'Pérez',
                    nombre_estudiante: 'Carlos',
                    apellido_estudiante: 'Pérez'
                }
            ]
        ]);

        const res = await request(app).get('/acudientes-estudiantes');

        expect(res.statusCode).toBe(200);
        expect(res.body.relaciones).toHaveLength(1);
        expect(res.body.relaciones[0].nombre_acudiente).toBe('Juan');
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    // ======================================================
    // 2. POST / (Crear relación directamente por IDs)
    // ======================================================

    test('POST / debe rechazar si falta id_acudiente o id_estudiante', async () => {
        const res = await request(app)
            .post('/acudientes-estudiantes')
            .send({ id_acudiente: 1 });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('id_acudiente e id_estudiante son obligatorios');
        expect(pool.query).not.toHaveBeenCalled();
    });

    test('POST / debe crear relación exitosamente con parentesco por defecto', async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 1 }
        ]);

        const res = await request(app)
            .post('/acudientes-estudiantes')
            .send({
                id_acudiente: 1,
                id_estudiante: 2
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Relación acudiente-estudiante creada');
        expect(pool.query.mock.calls[0][1][2]).toBe('Acudiente');
    });

    test('POST / debe crear relación exitosamente con parentesco personalizado', async () => {
        pool.query.mockResolvedValueOnce([
            { affectedRows: 1 }
        ]);

        const res = await request(app)
            .post('/acudientes-estudiantes')
            .send({
                id_acudiente: 1,
                id_estudiante: 2,
                parentesco: 'Madre'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Relación acudiente-estudiante creada');
        expect(pool.query.mock.calls[0][1][2]).toBe('Madre');
    });

    // ======================================================
    // 3. POST /vincular (Vincular por documento del estudiante)
    // ======================================================

    test('POST /vincular debe retornar 404 si el perfil de acudiente no existe', async () => {
        pool.query.mockResolvedValueOnce([[]]); // No encuentra acudiente por id_usuario

        const res = await request(app)
            .post('/acudientes-estudiantes/vincular')
            .send({
                id_usuario: 999,
                documento_estudiante: '12345678'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Perfil de acudiente no encontrado.');
    });

    test('POST /vincular debe retornar 404 si el estudiante no existe por documento', async () => {
        pool.query.mockResolvedValueOnce([[{ id_acudiente: 1 }]]); // Acudiente encontrado
        pool.query.mockResolvedValueOnce([[]]); // Estudiante NO encontrado

        const res = await request(app)
            .post('/acudientes-estudiantes/vincular')
            .send({
                id_usuario: 5,
                documento_estudiante: '99999999'
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('No se encontró ningún estudiante con ese número de documento.');
    });

    test('POST /vincular debe vincular estudiante exitosamente', async () => {
        pool.query.mockResolvedValueOnce([[{ id_acudiente: 1 }]]); // Acudiente
        pool.query.mockResolvedValueOnce([[{ id_estudiante: 2, primer_nombre: 'Carlos', primer_apellido: 'Pérez' }]]); // Estudiante
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Insert/Update

        const res = await request(app)
            .post('/acudientes-estudiantes/vincular')
            .send({
                id_usuario: 5,
                documento_estudiante: '12345678',
                parentesco: 'Tío'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Estudiante vinculado exitosamente');
        expect(res.body.estudiante).toBe('Carlos Pérez');
    });

    // ======================================================
    // 4. GET /mis-estudiantes/:id_usuario
    // ======================================================

    test('GET /mis-estudiantes/:id_usuario debe retornar lista de estudiantes del acudiente', async () => {
        pool.query.mockResolvedValueOnce([
            [
                {
                    id_estudiante: 2,
                    primer_nombre: 'Carlos',
                    primer_apellido: 'Pérez',
                    numero_documento: '12345678',
                    parentesco: 'Padre',
                    nombre_curso: '1001'
                }
            ]
        ]);

        const res = await request(app).get('/acudientes-estudiantes/mis-estudiantes/5');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].primer_nombre).toBe('Carlos');
    });

    // ======================================================
    // 5. DELETE /:id_acudiente/:id_estudiante
    // ======================================================

    test('DELETE /:id_acudiente/:id_estudiante debe retornar 404 si la relación no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).delete('/acudientes-estudiantes/999/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Relación no encontrada');
    });

    test('DELETE /:id_acudiente/:id_estudiante debe eliminar la relación correctamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).delete('/acudientes-estudiantes/1/2');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Relación eliminada correctamente');
    });

    // ======================================================
    // 6. MANEJO DE ERRORES DE BASE DE DATOS (CATCH)
    // ======================================================

    describe('Manejo de Errores de Base de Datos (Catch)', () => {

        test('GET / debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo de conexión'));

            const res = await request(app).get('/acudientes-estudiantes');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Fallo de conexión');
        });

        test('POST / debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo en la consulta'));

            const res = await request(app)
                .post('/acudientes-estudiantes')
                .send({ id_acudiente: 1, id_estudiante: 2 });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Fallo en la consulta');
        });

        test('POST /vincular debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo de BD al vincular'));

            const res = await request(app)
                .post('/acudientes-estudiantes/vincular')
                .send({ id_usuario: 5, documento_estudiante: '12345678' });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Fallo de BD al vincular');
        });

        test('GET /mis-estudiantes/:id_usuario debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error de BD'));

            const res = await request(app).get('/acudientes-estudiantes/mis-estudiantes/5');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error de BD');
        });

        test('DELETE /:id_acudiente/:id_estudiante debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error al eliminar'));

            const res = await request(app).delete('/acudientes-estudiantes/1/2');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error al eliminar');
        });

    });

});