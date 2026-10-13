import request from 'supertest';
import express from 'express';
import router from '../excusas.js';

// Simulamos el módulo de la base de datos
jest.mock('../../db.js');
import pool from '../../db.js';

// App de Express mínima para las pruebas de Excusas
const app = express();
app.use(express.json());
app.use('/excusas', router);

describe('Pruebas de Caja Blanca - Excusas', () => {

    beforeAll(() => {
        // Silenciar console.log y console.error para mantener limpia la consola durante los tests
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
    // 1. GET / (Obtener todas las excusas)
    // ======================================================

    test('GET / debe obtener la lista de excusas y formatear motivo/estado correctamente', async () => {
        pool.query.mockResolvedValueOnce([
            [
                {
                    id: 1,
                    estudiante: 'Juan   Carlos  Pérez  González ',
                    fecha: '2026-05-10',
                    observaciones: '[EXCUSA - Médica]: Cita con el especialista',
                    estado: 'Excusa Pendiente'
                },
                {
                    id: 2,
                    estudiante: 'María López',
                    fecha: '2026-05-11',
                    observaciones: '[EXCUSA - Personal]: Asunto familiar',
                    estado: 'Falla Justificada'
                },
                {
                    id: 3,
                    estudiante: 'Pedro Gómez',
                    fecha: '2026-05-12',
                    observaciones: 'Falta sin formato claro',
                    estado: 'Excusa Rechazada'
                },
                {
                    id: 4,
                    estudiante: 'Ana Martínez',
                    fecha: '2026-05-13',
                    observaciones: null,
                    estado: 'Otro Estado'
                }
            ]
        ]);

        const res = await request(app).get('/excusas');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(4);

        // Registro 1: Extracción de motivo 'Médica' y estado 'Pendiente'
        expect(res.body[0].estudiante).toBe('Juan Carlos Pérez González');
        expect(res.body[0].motivo).toBe('Médica');
        expect(res.body[0].estado).toBe('Pendiente');

        // Registro 2: Estado 'Aprobada' por Falla Justificada
        expect(res.body[1].motivo).toBe('Personal');
        expect(res.body[1].estado).toBe('Aprobada');

        // Registro 3: Motivo 'General' por defecto y estado 'Rechazada'
        expect(res.body[2].motivo).toBe('General');
        expect(res.body[2].estado).toBe('Rechazada');

        // Registro 4: Observaciones nulas y mantenimiento de estado por defecto
        expect(res.body[3].observaciones).toBe('');
        expect(res.body[3].estado).toBe('Otro Estado');
    });

    // ======================================================
    // 2. PUT /aprobar/:id (Aprobar excusa)
    // ======================================================

    test('PUT /aprobar/:id debe retornar 404 si la excusa no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).put('/excusas/aprobar/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Excusa no encontrada.');
    });

    test('PUT /aprobar/:id debe aprobar la excusa exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).put('/excusas/aprobar/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Excusa aprobada correctamente.');
    });

    // ======================================================
    // 3. PUT /rechazar/:id (Rechazar excusa)
    // ======================================================

    test('PUT /rechazar/:id debe retornar 404 si la excusa no existe', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const res = await request(app).put('/excusas/rechazar/999');

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Excusa no encontrada.');
    });

    test('PUT /rechazar/:id debe rechazar la excusa exitosamente', async () => {
        pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        const res = await request(app).put('/excusas/rechazar/1');

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Excusa rechazada correctamente.');
    });

    // ======================================================
    // 4. MANEJO DE ERRORES DE BASE DE DATOS (CATCH)
    // ======================================================

    describe('Manejo de Errores de Base de Datos (Catch)', () => {

        test('GET / debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Error en consulta SQL'));

            const res = await request(app).get('/excusas');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error al consultar las excusas.');
            expect(res.body.detalle).toBe('Error en consulta SQL');
        });

        test('PUT /aprobar/:id debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al actualizar'));

            const res = await request(app).put('/excusas/aprobar/1');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error al aprobar la excusa.');
            expect(res.body.detalle).toBe('Fallo al actualizar');
        });

        test('PUT /rechazar/:id debe capturar error de BD y retornar 500', async () => {
            pool.query.mockRejectedValueOnce(new Error('Fallo al actualizar'));

            const res = await request(app).put('/excusas/rechazar/1');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toBe('Error al rechazar la excusa.');
            expect(res.body.detalle).toBe('Fallo al actualizar');
        });

    });

});