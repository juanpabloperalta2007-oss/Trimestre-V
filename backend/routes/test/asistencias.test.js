import request from 'supertest';
import express from 'express';
import router from '../asistencias.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

const app = express();
app.use(express.json());
app.use('/asistencias', router);

describe('Pruebas de Caja Blanca - Asistencias (100% Cobertura)', () => {

    beforeAll(() => {
        // Silenciar console.log y console.error durante la ejecución de los tests
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
    // 1. GET / (Obtener todas las asistencias)
    // ======================================================

    test('GET / sin parámetros debe tomar valores paginados por defecto (page 1, limit 10)', async () => {
        pool.query
            .mockResolvedValueOnce([[
                { id_asistencia: 1, fecha: '2026-05-10', estado: 'P', observaciones: null, id_estudiante: 10, id_asignatura_curso: 5 }
            ]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        const res = await request(app).get('/asistencias');

        expect(res.statusCode).toBe(200);
        expect(res.body.asistencias).toHaveLength(1);
        expect(res.body.pagination.currentPage).toBe(1);
        expect(res.body.pagination.limit).toBe(10); // Cambiado a 10
        expect(res.body.pagination.hasNextPage).toBe(false);
        expect(res.body.pagination.hasPrevPage).toBe(false);
    });

    test('GET / con paginación avanzada (page 2, limit 5)', async () => {
        pool.query
            .mockResolvedValueOnce([[
                { id_asistencia: 1, fecha: '2026-05-10', estado: 'P' }
            ]])
            .mockResolvedValueOnce([[{ total: 20 }]]);

        const res = await request(app).get('/asistencias?page=2&limit=5');

        expect(res.statusCode).toBe(200);
        expect(res.body.pagination.currentPage).toBe(2);
        expect(res.body.pagination.totalPages).toBe(4);
        expect(res.body.pagination.hasNextPage).toBe(true);
        expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    test('GET / con búsqueda por filtro search', async () => {
        pool.query
            .mockResolvedValueOnce([[]])
            .mockResolvedValueOnce([[{ total: 0 }]]);

        await request(app).get('/asistencias?search=Carlos');

        const queryEjecutada = pool.query.mock.calls[0][0];
        expect(queryEjecutada).toContain('WHERE');
        expect(queryEjecutada).toContain('p.primer_nombre LIKE ?');
    });

    // ======================================================
    // 2. GET /alertas (Obtener alertas)
    // ======================================================

    test('GET /alertas debe retornar lista formateada y lidiar con valores nulos', async () => {
        pool.query.mockResolvedValueOnce([
            [
                {
                    id_estudiante: 10,
                    estudiante: null, // Probar respaldo de cadena vacía
                    documento: '12345678',
                    curso: '1001',
                    inasistencias: null,
                    tardanzas: null,
                    total_registros: null,
                    estado: 'Normal'
                }
            ]
        ]);

        const res = await request(app).get('/asistencias/alertas');

        expect(res.statusCode).toBe(200);
        expect(res.body[0].estudiante).toBe('');
        expect(res.body[0].inasistencias).toBe(0);
        expect(res.body[0].tardanzas).toBe(0);
        expect(res.body[0].total_registros).toBe(0);
    });

    // ======================================================
    // 3. POST / (Crear asistencia manual)
    // ======================================================

    test('POST / debe rechazar si faltan campos obligatorios', async () => {
        const res = await request(app).post('/asistencias').send({ fecha: '2026-05-10' });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Fecha, estado, estudiante y asignatura son obligatorios');
    });

    test('POST / debe crear asistencia exitosamente (con observaciones vacías)', async () => {
        pool.query.mockResolvedValueOnce([{ insertId: 15 }]);

        const res = await request(app)
            .post('/asistencias')
            .send({
                fecha: '2026-05-10',
                estado: 'P',
                id_estudiante: 10,
                id_asignatura_curso: 5
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.id_asistencia).toBe(15);
    });

    // ======================================================
    // 4. PUT /:id (Actualizar asistencia)
    // ======================================================

    test('PUT /:id debe retornar 404 si la asistencia no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app)
            .put('/asistencias/999')
            .send({ fecha: '2026-05-10', estado: 'A', id_estudiante: 10, id_asignatura_curso: 5 });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Asistencia no encontrada');
    });

    test('PUT /:id debe actualizar asistencia correctamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .put('/asistencias/1')
            .send({ fecha: '2026-05-10', estado: 'A', id_estudiante: 10, id_asignatura_curso: 5 });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Asistencia actualizada correctamente');
    });

    // ======================================================
    // 5. DELETE /:id (Eliminar asistencia)
    // ======================================================

    test('DELETE /:id debe retornar 404 si la asistencia no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).delete('/asistencias/999');

        expect(res.statusCode).toBe(404);
    });

    test('DELETE /:id debe eliminar exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).delete('/asistencias/1');

        expect(res.statusCode).toBe(200);
    });

    // ======================================================
    // 6. GET /estadisticas/:id_estudiante
    // ======================================================

    test('GET /estadisticas/:id_estudiante debe retornar conteos acumulados sin mes', async () => {
        pool.query.mockResolvedValueOnce([[
            { asistencias: '10', fallas_sin_justificar: '1', fallas_justificadas: '0', retardos: '2' }
        ]]);

        const res = await request(app).get('/asistencias/estadisticas/10');

        expect(res.statusCode).toBe(200);
        expect(res.body.asistencias).toBe(10);
    });

    test('GET /estadisticas/:id_estudiante respondiendo ceros cuando los datos son nulos', async () => {
        pool.query.mockResolvedValueOnce([[
            { asistencias: 0, fallas_sin_justificar: 0, fallas_justificadas: 0, retardos: 0 }
        ]]);

        const res = await request(app).get('/asistencias/estadisticas/10?mes=5');

        expect(res.statusCode).toBe(200);
        expect(res.body.asistencias).toBe(0);
    });

    // ======================================================
    // 7. POST /excusa
    // ======================================================

    test('POST /excusa debe rechazar si faltan datos requeridos', async () => {
        const res = await request(app).post('/asistencias/excusa').send({ id_estudiante: 10 });
        expect(res.statusCode).toBe(400);
    });

    test('POST /excusa actualiza asistencia si existe (motivo por defecto)', async () => {
        pool.query.mockResolvedValueOnce([[{ id_asistencia: 10 }]]);
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .post('/asistencias/excusa')
            .send({
                id_estudiante: 10,
                fecha_inasistencia: '2026-05-10',
                descripcion: 'Incapacidad médica'
            });

        expect(res.statusCode).toBe(201);
    });

    test('POST /excusa inserta nueva asistencia si no existe', async () => {
        pool.query.mockResolvedValueOnce([[]]);
        pool.query.mockResolvedValueOnce([{ insertId: 20 }]);

        const res = await request(app)
            .post('/asistencias/excusa')
            .send({
                id_estudiante: 10,
                motivo: 'Familiar',
                fecha_inasistencia: '2026-05-10',
                descripcion: 'Permiso personal'
            });

        expect(res.statusCode).toBe(201);
    });

    // ======================================================
    // 8. GET /lista/:id_asignatura_curso
    // ======================================================

    test('GET /lista/:id_asignatura_curso rechaza si no hay fecha', async () => {
        const res = await request(app).get('/asistencias/lista/5');
        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('La fecha es obligatoria.');
    });

    test('GET /lista/:id_asignatura_curso rechaza si id_asignatura_curso es inválido', async () => {
        const res = await request(app).get('/asistencias/lista/abc?fecha=2026-05-10');
        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('El ID de la asignatura/curso no es válido.');
    });

    test('GET /lista/:id_asignatura_curso obtiene lista correctamente', async () => {
        pool.query.mockResolvedValueOnce([[
            { id_estudiante: 10, numero_documento: '12345678', nombre_completo: 'Carlos Pérez', estado: 'P' }
        ]]);

        const res = await request(app).get('/asistencias/lista/5?fecha=2026-05-10');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    // ======================================================
    // 9. POST /lista (Guardar/Actualizar desde lista)
    // ======================================================

    test('POST /lista rechaza si falta fecha', async () => {
        const res = await request(app).post('/asistencias/lista').send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('La fecha de asistencia es obligatoria.');
    });

    test('POST /lista rechaza si falta estado', async () => {
        const res = await request(app).post('/asistencias/lista').send({ fecha: '2026-05-10' });
        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('El estado de asistencia es obligatorio.');
    });

    test('POST /lista rechaza si el estado es inválido', async () => {
        const res = await request(app)
            .post('/asistencias/lista')
            .send({ fecha: '2026-05-10', estado: 'invalido' });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('El estado de asistencia no es válido.');
    });

    test('POST /lista rechaza si id_estudiante es inválido', async () => {
        const res = await request(app)
            .post('/asistencias/lista')
            .send({ fecha: '2026-05-10', estado: 'presente', id_estudiante: 'abc' });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('El ID del estudiante no es válido.');
    });

    test('POST /lista rechaza si id_asignatura_curso es inválido', async () => {
        const res = await request(app)
            .post('/asistencias/lista')
            .send({ fecha: '2026-05-10', estado: 'p', id_estudiante: 10, id_asignatura_curso: 0 });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('El ID de la asignatura/curso no es válido.');
    });

    test('POST /lista rechaza si el estudiante no existe', async () => {
        pool.query.mockResolvedValueOnce([[]]); // Estudiante no existe

        const res = await request(app)
            .post('/asistencias/lista')
            .send({ fecha: '2026-05-10', estado: 'ausente', id_estudiante: 999, id_asignatura_curso: 5 });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('El estudiante no existe.');
    });

    test('POST /lista rechaza si la asignatura/curso no existe', async () => {
        pool.query.mockResolvedValueOnce([[{ id_estudiante: 10 }]]); // Estudiante existe
        pool.query.mockResolvedValueOnce([[]]); // Asignatura no existe

        const res = await request(app)
            .post('/asistencias/lista')
            .send({ fecha: '2026-05-10', estado: 'tardia', id_estudiante: 10, id_asignatura_curso: 999 });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje).toBe('La asignatura/curso no existe.');
    });

    test('POST /lista actualiza la asistencia si ya existe para esa fecha', async () => {
        pool.query.mockResolvedValueOnce([[{ id_estudiante: 10 }]]);
        pool.query.mockResolvedValueOnce([[{ id_asignatura_curso: 5 }]]);
        pool.query.mockResolvedValueOnce([[{ id_asistencia: 50 }]]); // Asistencia existe
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app)
            .post('/asistencias/lista')
            .send({
                fecha: '2026-05-10',
                estado: 'justificado',
                observaciones: 'Permiso',
                id_estudiante: 10,
                id_asignatura_curso: 5
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Asistencia actualizada correctamente.');
        expect(res.body.estado).toBe('J');
    });

    test('POST /lista inserta nueva asistencia si no existe para esa fecha', async () => {
        pool.query.mockResolvedValueOnce([[{ id_estudiante: 10 }]]);
        pool.query.mockResolvedValueOnce([[{ id_asignatura_curso: 5 }]]);
        pool.query.mockResolvedValueOnce([[]]); // No existe
        pool.query.mockResolvedValueOnce([{ insertId: 60 }]);

        const res = await request(app)
            .post('/asistencias/lista')
            .send({
                fecha: '2026-05-10',
                estado: 'tarde',
                id_estudiante: 10,
                id_asignatura_curso: 5
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.mensaje).toBe('Asistencia registrada correctamente.');
        expect(res.body.estado).toBe('T');
    });

    // ======================================================
    // 10. MANEJO DE ERRORES DE BASE DE DATOS (CATCH)
    // ======================================================

    describe('Manejo de Errores de Base de Datos (Catch)', () => {

        test('GET / responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app).get('/asistencias');
            expect(res.statusCode).toBe(500);
        });

        test('GET /alertas responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app).get('/asistencias/alertas');
            expect(res.statusCode).toBe(500);
        });

        test('POST / responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app)
                .post('/asistencias')
                .send({ fecha: '2026-05-10', estado: 'P', id_estudiante: 10, id_asignatura_curso: 5 });
            expect(res.statusCode).toBe(500);
        });

        test('PUT /:id responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app)
                .put('/asistencias/1')
                .send({ fecha: '2026-05-10', estado: 'P', id_estudiante: 10, id_asignatura_curso: 5 });
            expect(res.statusCode).toBe(500);
        });

        test('DELETE /:id responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app).delete('/asistencias/1');
            expect(res.statusCode).toBe(500);
        });

        test('GET /estadisticas/:id_estudiante responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app).get('/asistencias/estadisticas/10');
            expect(res.statusCode).toBe(500);
        });

        test('POST /excusa responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app)
                .post('/asistencias/excusa')
                .send({ id_estudiante: 10, fecha_inasistencia: '2026-05-10', descripcion: 'Excusa' });
            expect(res.statusCode).toBe(500);
        });

        test('GET /lista/:id_asignatura_curso responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app).get('/asistencias/lista/5?fecha=2026-05-10');
            expect(res.statusCode).toBe(500);
        });

        test('POST /lista responde 500 en error de BD', async () => {
            pool.query.mockRejectedValueOnce(new Error('BD Error'));
            const res = await request(app)
                .post('/asistencias/lista')
                .send({ fecha: '2026-05-10', estado: 'P', id_estudiante: 10, id_asignatura_curso: 5 });
            expect(res.statusCode).toBe(500);
        });

    });

});