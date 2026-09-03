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

const app  = express (); // permite inicializar las aplicacionesy configurar las urls
const PORT = process.env.PORT || 5000; // configuracion del puerto del backend

app.use(cors());  //permite la solicitud desde cualquier origen
app.use(express.json()); // por si tiene que leer algun formato JSON
app.use('/api/acudientes_estudiantes', acudientes_estudiantesRoutes);
app.use('/api/acudientes', acudientesRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/asignaturas_cursos', asignaturas_cursosRoutes);
app.use('/api/asignaturas', areasRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/calendario_escolar', calendario_escolarRoutes);
app.use('/api/cargos', cargosRoutes);
app.use('/api/coordinadores_cursos', coordinadores_cursosRoutes);
app.use('/api/coordinadores', coordinadoresRoutes);
app.use('/api/correos_notificaciones', correos_notificacionesRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/estudiantes_cursos', estudiantes_cursosRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/personas', personasRoutes);
app.use('/api/usuarios', usuariosRoutes);






app.get ('/', (req, res) =>{
    res.send('hola estoy en el servidor')

})

app.get('/api/mensaje', (req, res ) => {
    res .json({mensaje: 'conexion Exitosa!! el backend responde correctamente'})

})
app.listen(PORT, () =>{

    console.log(`Servidor del backend escuchando en http://localhost: ${PORT}`)

})