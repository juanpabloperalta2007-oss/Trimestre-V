import "dotenv/config";

import express from "express";
import cors from "cors";

import pool from "./db.js";


// ======================================================
// RUTAS
// ======================================================

import acudientes_estudiantesRoutes
    from "./routes/acudientes_estudiantes.js";

import acudientesRoutes
    from "./routes/acudientes.js";

import areasRoutes
    from "./routes/areas.js";

import asignaturas_cursosRoutes
    from "./routes/asignaturas_cursos.js";

import asignaturasRoutes
    from "./routes/asignaturas.js";

import asistenciasRoutes
    from "./routes/asistencias.js";

import excusasRoutes
    from "./routes/excusas.js";

import calendario_escolarRoutes
    from "./routes/calendario_escolar.js";

import cargosRoutes
    from "./routes/cargos.js";

import coordinadores_cursosRoutes
    from "./routes/coordinadores_cursos.js";

import coordinadoresRoutes
    from "./routes/coordinadores.js";

import correos_notificacionesRoutes
    from "./routes/correos_notificaciones.js";

import cursosRoutes
    from "./routes/cursos.js";

import docentesRoutes
    from "./routes/docentes.js";

import estudiantes_cursosRoutes
    from "./routes/estudiantes_cursos.js";

import estudiantesRoutes
    from "./routes/estudiantes.js";

import personasRoutes
    from "./routes/personas.js";

import usuariosRoutes
    from "./routes/usuarios.js";

import reportesRoutes
    from "./routes/reportes.js";


// ======================================================
// EXPRESS
// ======================================================

const app =
    express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors()
);


// MUY IMPORTANTE
app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// RUTA PRINCIPAL
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            mensaje:
                "API GAE funcionando correctamente."

        });

    }
);


// ======================================================
// RUTAS API
// ======================================================

app.use(
    "/api/acudientes_estudiantes",
    acudientes_estudiantesRoutes
);


app.use(
    "/api/acudientes",
    acudientesRoutes
);


app.use(
    "/api/areas",
    areasRoutes
);


app.use(
    "/api/asignaturas_cursos",
    asignaturas_cursosRoutes
);


app.use(
    "/api/asignaturas",
    asignaturasRoutes
);


app.use(
    "/api/asistencias",
    asistenciasRoutes
);


app.use(
    "/api/excusas",
    excusasRoutes
);


app.use(
    "/api/calendario_escolar",
    calendario_escolarRoutes
);


app.use(
    "/api/cargos",
    cargosRoutes
);


app.use(
    "/api/coordinadores_cursos",
    coordinadores_cursosRoutes
);


app.use(
    "/api/coordinadores",
    coordinadoresRoutes
);


app.use(
    "/api/correos_notificaciones",
    correos_notificacionesRoutes
);


// Alias utilizado por el frontend
app.use(
    "/api/notificaciones",
    correos_notificacionesRoutes
);


app.use(
    "/api/cursos",
    cursosRoutes
);


app.use(
    "/api/docentes",
    docentesRoutes
);


app.use(
    "/api/estudiantes_cursos",
    estudiantes_cursosRoutes
);


app.use(
    "/api/estudiantes",
    estudiantesRoutes
);


app.use(
    "/api/personas",
    personasRoutes
);


app.use(
    "/api/usuarios",
    usuariosRoutes
);


app.use(
    "/api/reportes",
    reportesRoutes
);


// ======================================================
// MANEJO DE RUTA NO ENCONTRADA
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({

            error:
                "Ruta no encontrada.",

            ruta:
                req.originalUrl

        });

    }
);


// ======================================================
// MANEJO DE ERRORES
// ======================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "ERROR GLOBAL DEL SERVIDOR:",
            error
        );


        res.status(
            error.status || 500
        ).json({

            error:
                error.message ||
                "Error interno del servidor."

        });

    }
);


// ======================================================
// PUERTO
// ======================================================

const PORT =
    process.env.PORT || 5000;


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor del backend escuchando en http://localhost:${PORT}`
        );

    }
);