import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import poll from './db.js';

import acudientes_estudiantesRoutes from './routes/acudientes_estudiantes.js';
import acudientesRoutes from './routes/acudientes.js';
import areasRoutes from './routes/areas.js';
import asignaturas_cursosRoutes from './routes/asignaturas_cursos.js';
import asignaturasRoutes from './routes/asignaturas.js';
import asistenciasRoutes from './routes/asistencias.js';
import calendario_escolarRoutes from './routes/calendario_escolar.js';
import cargosRoutes from './routes/cargos.js';
import coordinadores_cursosRoutes from './routes/coordinadores_cursos.js';
import coordinadoresRoutes from './routes/coordinadores.js';
import correos_notificacionesRoutes from './routes/correos_notificaciones.js';
import cursosRoutes from './routes/cursos.js';
import docentesRoutes from './routes/docentes.js';
import estudiantes_cursosRoutes from './routes/estudiantes_cursos.js';
import estudiantesRoutes from './routes/estudiantes.js';
import personasRoutes from './routes/personas.js';
import usuariosRoutes from './routes/usuarios.js';


const app = express();


// ======================================================
// CONFIGURACIÓN
// ======================================================

const PORT = process.env.PORT || 5000;


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// RUTAS DE LA API
// ======================================================

app.use(
    '/api/acudientes_estudiantes',
    acudientes_estudiantesRoutes
);

app.use(
    '/api/acudientes',
    acudientesRoutes
);

app.use(
    '/api/areas',
    areasRoutes
);

app.use(
    '/api/asignaturas_cursos',
    asignaturas_cursosRoutes
);

// CORREGIDO:
// Antes estaba usando areasRoutes
app.use(
    '/api/asignaturas',
    asignaturasRoutes
);

app.use(
    '/api/asistencias',
    asistenciasRoutes
);

app.use(
    '/api/calendario_escolar',
    calendario_escolarRoutes
);

app.use(
    '/api/cargos',
    cargosRoutes
);

app.use(
    '/api/coordinadores_cursos',
    coordinadores_cursosRoutes
);

app.use(
    '/api/coordinadores',
    coordinadoresRoutes
);

app.use(
    '/api/correos_notificaciones',
    correos_notificacionesRoutes
);

app.use(
    '/api/cursos',
    cursosRoutes
);

app.use(
    '/api/docentes',
    docentesRoutes
);

app.use(
    '/api/estudiantes_cursos',
    estudiantes_cursosRoutes
);

app.use(
    '/api/estudiantes',
    estudiantesRoutes
);

app.use(
    '/api/personas',
    personasRoutes
);


// ======================================================
// USUARIOS
// ======================================================

app.use(
    '/api/usuarios',
    usuariosRoutes
);


// ======================================================
// RUTA PRINCIPAL
// ======================================================

app.get('/', (req, res) => {

    res.send(
        'Hola, estoy en el servidor'
    );

});


// ======================================================
// COMPROBAR CONEXIÓN DEL BACKEND
// ======================================================

app.get('/api/mensaje', (req, res) => {

    res.json({
        mensaje:
            'Conexión exitosa. El backend responde correctamente.'
    });

});


// ======================================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });

});


// ======================================================
// MANEJO GENERAL DE ERRORES
// ======================================================

app.use((error, req, res, next) => {

    console.error(
        'Error del servidor:',
        error
    );

    res.status(500).json({
        error: 'Error interno del servidor.'
    });

});


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
    PORT,
    () => {

        console.log(
            '======================================'
        );

        console.log(
            `Servidor del backend escuchando en http://localhost:${PORT}`
        );

        console.log(
            `API de usuarios: http://localhost:${PORT}/api/usuarios`
        );

        console.log(
            '======================================'
        );

    }
);