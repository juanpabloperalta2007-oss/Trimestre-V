<?php

use Illuminate\http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\cargosControlador;
use App\Http\Controllers\estudiantes_cursosControlador;
use App\Http\Controllers\asignaturas_cursosControlador;
use App\Http\Controllers\coordinadores_cursosControlador;
use App\Http\Controllers\asistenciasControlador;
use App\Http\Controllers\calendario_escolarControlador;
use App\Http\Controllers\correos_notificacionesControlador;
use App\Http\Controllers\cursosModelo;
use App\Http\Controllers\Api\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

// rutas requieren token JWT
// Route::middleware(['jwt.auth'])->group(function () { 

    //rutas de auntenticacion
    Route::post('\logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);


// rutas existentes

Route::get('/cargos', [cargosControlador::class, 'index']);
Route::post('/cargos', [cargosControlador::class, 'store']);
Route::get('/cargos/{id_cargo', [cargosControlador::class, 'show']);
Route::delete('/cargos/{id_cargo}', [cargosControlador::class, 'destroy']);
Route::put('/cargos/{id_cargo}', [cargosControlador::class, 'update']);

Route::get('/estudiantes_cursos', [estudiantes_cursosControlador::class, 'index']);
Route::post('/estudiantes_cursos', [estudiantes_cursosControlador::class, 'store']);
Route::get('/estudiantes_cursos/{id_estudiante_curso}', [estudiantes_cursosControlador::class, 'show']);
Route::delete('/estudiantes_cursos/{id_estudiante_curso}', [estudiantes_cursosControlador::class, 'destroy']);
Route::put('/estudiantes_cursos/{id_estudiante_curso}', [estudiantes_cursosControlador::class, 'update']);


Route::get('/asignaturas_cursos', [asignaturas_cursosControlador::class, 'index']);
Route::post('/asignaturas_cursos', [asignaturas_cursosControlador::class, 'store']);
Route::get('/asignaturas_cursos/{id_asignatura_curso}', [asignaturas_cursosControlador::class, 'show']);
Route::delete('/asignaturas_cursos/{id_asignatura_curso}', [asignaturas_cursosControlador::class, 'destroy']);
Route::put('asignaturas_cursos/{id_asignatura_curso}', [asignaturas_cursosControlador::class, 'update']);


Route::get('/coordinadores_cursos', [coordinadores_cursosControlador::class, 'index']);
Route::post('/coordinadores_cursos', [coordinadores_cursosControlador::class, 'store']);
Route::get('/coordinadores_cursos/{id_coordinadores_cursos}', [coordinadores_cursosControlador::class, 'show']);
Route::delete('/coordinadores_cursos/{id_coordinadores_cursos}', [coordinadores_cursosControlador::class, 'destroy']);
Route::put('coordinadores_cursos/{id_coordinadores_cursos}', [coordinadores_cursosControlador::class, 'update']);


Route::get('/asistencias', [asistenciasControlador::class, 'index']);
Route::post('/asistencias', [asistenciasControlador::class, 'store']);
Route::get('/asistencias/{id_asistencia}}', [asistenciasControlador::class, 'show']);
Route::delete('/asistencias/{id_asistencia}', [asistenciasControlador::class, 'destroy']);
Route::put('asistencias/{id_asistencia}', [asistenciasControlador::class, 'update']);

Route::get('/calendario_escolar', [calendario_escolarControlador::class, 'index']);
Route::post('/calendario_escolar', [calendario_escolarControlador::class, 'store']);
Route::get('/calendario_escolar/{id_evento}', [calendario_escolarControlador::class, 'show']);
Route::delete('/calendario_escolar/{id_evento}', [calendario_escolarControlador::class, 'destroy']);
Route::put('calendario_escolar/{id_evento}', [calendario_escolarControlador::class, 'update']);


Route::get('/correos_notificaciones', [correos_notificacionesControlador::class, 'index']);
Route::post('/correos_notificaciones', [correos_notificacionesControlador::class, 'store']);
Route::get('/correos_notificaciones/{id_correo}', [correos_notificacionesControlador::class, 'show']);
Route::delete('/correos_notificaciones/{id_correo}', [correos_notificacionesControlador::class, 'destroy']);
Route::put('correos_notificaciones/{id_correo}', [correos_notificacionesControlador::class, 'update']);


Route::get('/cursos', [cursosControlador::class, 'index']);
Route::post('/cursos', [cursosControlador::class, 'store']);
Route::get('/cursos/{id_curso}', [cursosControlador::class, 'show']);
Route::delete('/cursos/{id_curso}', [cursosControlador::class, 'destroy']);
Route::put('cursos/{id_curso}', [cursosControlador::class, 'update']);



//});correos_notificacionesControlador::class, 'update'