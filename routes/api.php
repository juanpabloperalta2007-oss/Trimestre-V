<?php

use Illuminate\http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\cargosControlador;
use App\Http\Controllers\areasControlador;
use App\Http\Controllers\usuariosControlador;
use App\Http\Controllers\personasControlador;
use App\Http\Controllers\docentesControlador;
use App\Http\Controllers\acudienteControlador;
use App\Http\Controllers\estudiantesControlador;
use App\Http\Controllers\coordinadoresControlador;
use App\Http\Controllers\cursosControlador;
use App\Http\Controllers\acudientes_estudiantesControlador;
use App\Http\Controllers\asignaturasControlador;
use App\Http\Controllers\asignaturas_cursosControlador;
use App\Http\Controllers\asistenciasControlador;
use App\Http\Controllers\calendario_escolarControlador;
use App\Http\Controllers\coordinadores_cursosControlador;
use App\Http\Controllers\correos_notificacionesControlador;
use App\Http\Controllers\estudiantes_cursosControlador;




Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

//Route::middleware(['jwt.auth']) ->group(function(){

    //rutas de autenticacion

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);


    // rutas para cargos
    Route::get('cargos', [cargosControlador::class, 'index']);
    Route::post('/cargos', [cargosControlador::class, 'store']);
    Route::get('/cargos/{id_cargos}', [cargosControlador::class, 'show']);
    Route::delete('/cargos/{id_cargos}', [cargosControlador::class, 'destroy']);
    Route::put('/cargos/{id_cargos}', [cargosControlador::class, 'update']);

    // rutas para areas
    Route::get('areas', [areasControlador::class, 'index']);
    Route::post('/areas', [areasControlador::class, 'store']);
    Route::get('/areas/{id_area}', [areasControlador::class, 'show']);
    Route::delete('/areas/{id_area}', [areasControlador::class, 'destroy']);
    Route::put('/areas/{id_area}', [areasControlador::class, 'update']);


    // rutas para usuarios
    Route::get('usuarios', [usuariosControlador::class, 'index']);
    Route::post('/usuarios', [usuariosControlador::class, 'store']);
    Route::get('/usuarios/{id_usuario}', [usuariosControlador::class, 'show']);
    Route::delete('/usuarios/{id_usuario}', [usuariosControlador::class, 'destroy']);
    Route::put('/usuarios/{id_usuario}', [usuariosControlador::class, 'update']);


    // rutas para personas
    Route::get('personas', [personasControlador::class, 'index']);
    Route::post('/personas', [personasControlador::class, 'store']);
    Route::get('/personas/{id_persona}', [personasControlador::class, 'show']);
    Route::delete('/personas/{id_persona}', [personasControlador::class, 'destroy']);
    Route::put('/personas/{id_persona}', [personasControlador::class, 'update']);


    // rutas para docentes 
    Route::get('docentes', [docentesControlador::class, 'index']);
    Route::post('/docentes', [docentesControlador::class, 'store']);
    Route::get('/docentes/{id_docente}', [docentesControlador::class, 'show']);
    Route::delete('/docentes/{id_docente}', [docentesControlador::class, 'destroy']);
    Route::put('/docentes/{id_docente}', [docentesControlador::class, 'update']);


    // rutas para acudiente 
    Route::get('/acudiente', [acudienteControlador::class, 'index']);
    Route::post('/acudiente', [acudienteControlador::class, 'store']);
    Route::get('/acudiente/{id_acudiente}', [acudienteControlador::class, 'show']);
    Route::delete('/acudiente/{id_acudiente}', [acudienteControlador::class, 'destroy']);
    Route::put('/acudiente/{id_acudiente}', [acudienteControlador::class, 'update']);


    // rutas para estudiantes
    Route::get('estudiantes', [estudiantesControlador::class, 'index']);
    Route::post('/estudiantes', [estudiantesControlador::class, 'store']);
    Route::get('/estudiantes/{id_estudiante}', [estudiantesControlador::class, 'show']);
    Route::delete('/estudiantes/{id_estudiante}', [estudiantesControlador::class, 'destroy']);
    Route::put('/estudiantes/{id_estudiante}', [estudiantesControlador::class, 'update']);


    // rutas para coordinadores
    Route::get('coordinadores', [coordinadoresControlador::class, 'index']);
    Route::post('/coordinadores', [coordinadoresControlador::class, 'store']);
    Route::get('/coordinadores/{id_coordinador}', [coordinadoresControlador::class, 'show']);
    Route::delete('/coordinadores/{id_coordinador}', [coordinadoresControlador::class, 'destroy']);
    Route::put('/coordinadores/{id_coordinador}', [coordinadoresControlador::class, 'update']);


    // rutas para cursos
    Route::get('cursos', [cursosControlador::class, 'index']);
    Route::post('/cursos', [cursosControlador::class, 'store']);
    Route::get('/cursos/{id_curso}', [cursosControlador::class, 'show']);
    Route::delete('/cursos/{id_curso}', [cursosControlador::class, 'destroy']);
    Route::put('/cursos/{id_curso}', [cursosControlador::class, 'update']);


    // rutas para acudientes_estudiantes
    Route::get('acudientes_estudiantes', [acudientes_estudiantesControlador::class, 'index']);
    Route::post('/acudientes_estudiantes', [acudientes_estudiantesControlador::class, 'store']);
    Route::get('/acudientes_estudiantes/{id_acudiente_estudiante}', [acudientes_estudiantesControlador::class, 'show']);
    Route::delete('/acudientes_estudiantes/{id_acudiente_estudiante}', [acudientes_estudiantesControlador::class, 'destroy']);
    Route::put('/acudientes_estudiantes/{id_acudiente_estudiante}', [acudientes_estudiantesControlador::class, 'update']);

    // rutas para asignatura
    Route::get('asignaturas', [asignaturasControlador::class, 'index']);
    Route::post('/asignaturas', [asignaturasControlador::class, 'store']);
    Route::get('/asignaturas/{id_asignatura}', [asignaturasControlador::class, 'show']);
    Route::delete('/asignaturas/{id_asignaturas}', [asignaturasControlador::class, 'destroy']);
    Route::put('/asignaturas/{id_asignaturas}', [asignaturasControlador::class, 'update']);

    // rutas para asignar_curso 
    Route::get('/asignaturas_cursos', [asignaturas_cursosControlador::class, 'index']);
    Route::post('/asignaturas_cursos', [asignaturas_cursosControlador::class, 'store']);
    Route::get('/asignaturas_cursos/{id_asignatura_curso}', [asignaturas_cursosControlador::class, 'show']);
    Route::delete('/asignaturas_cursos/{id_asignatura_curso}', [asignaturas_cursosControlador::class, 'destroy']);
    Route::put('asignaturas_cursos/{id_asignatura_curso}', [asignaturas_cursosControlador::class, 'update']);
    
    // rutas para asistencia 
    Route::get('/asistencias', [asistenciasControlador::class, 'index']);
    Route::post('/asistencias', [asistenciasControlador::class, 'store']);
    Route::get('/asistencias/{id_asistencia}}', [asistenciasControlador::class, 'show']);
    Route::delete('/asistencias/{id_asistencia}', [asistenciasControlador::class, 'destroy']);
    Route::put('asistencias/{id_asistencia}', [asistenciasControlador::class, 'update']);

    //rutas para candelario escolar 
    Route::get('/calendario_escolar', [calendario_escolarControlador::class, 'index']);
    Route::post('/calendario_escolar', [calendario_escolarControlador::class, 'store']);
    Route::get('/calendario_escolar/{id_evento}', [calendario_escolarControlador::class, 'show']);
    Route::delete('/calendario_escolar/{id_evento}', [calendario_escolarControlador::class, 'destroy']);
    Route::put('calendario_escolar/{id_evento}', [calendario_escolarControlador::class, 'update']);

    // rutas para coordinador curso
    Route::get('/coordinadores_cursos', [coordinadores_cursosControlador::class, 'index']);
    Route::post('/coordinadores_cursos', [coordinadores_cursosControlador::class, 'store']);
    Route::get('/coordinadores_cursos/{id_coordinadores_cursos}', [coordinadores_cursosControlador::class, 'show']);
    Route::delete('/coordinadores_cursos/{id_coordinadores_cursos}', [coordinadores_cursosControlador::class, 'destroy']);
    Route::put('coordinadores_cursos/{id_coordinadores_cursos}', [coordinadores_cursosControlador::class, 'update']);

    // rutas para correos
    Route::get('/correos_notificaciones', [correos_notificacionesControlador::class, 'index']);
    Route::post('/correos_notificaciones', [correos_notificacionesControlador::class, 'store']);
    Route::get('/correos_notificaciones/{id_correo}', [correos_notificacionesControlador::class, 'show']);
    Route::delete('/correos_notificaciones/{id_correo}', [correos_notificacionesControlador::class, 'destroy']);
    Route::put('correos_notificaciones/{id_correo}', [correos_notificacionesControlador::class, 'update']);

    // rutas para estudiantes curso 
    Route::get('/estudiantes_cursos', [estudiantes_cursosControlador::class, 'index']);
    Route::post('/estudiantes_cursos', [estudiantes_cursosControlador::class, 'store']);
    Route::get('/estudiantes_cursos/{id_estudiante_curso}', [estudiantes_cursosControlador::class, 'show']);
    Route::delete('/estudiantes_cursos/{id_estudiante_curso}', [estudiantes_cursosControlador::class, 'destroy']);
    Route::put('/estudiantes_cursos/{id_estudiante_curso}', [estudiantes_cursosControlador::class, 'update']);



//});