<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\asistenciasModelo;
use Illuminate\Support\Facades\Validator;

class asistenciasControlador extends Controller

{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $asistencias = asistenciasModelo::all(); // traer datos de la tabla
        
        if($asistencias->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($asistencias, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'fecha' => 'required',
            'estado' => 'required',
            'observaciones' => 'required',
            'id_estudiante' => 'required',
            'id_asignatura_curso' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $asistencias = asistenciasModelo::create([
            'fecha' => $request->fecha,
            'estado' => $request->estado,
            'observaciones' => $request->observaciones,
            'id_estudiante' => $request->id_estudiante,
            'id_asignatura_curso' => $request->id_asignatura_curso
        ]);

        if(!$asistencias){
            $data = [
                'message' => 'Error al crear el asistencia',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'asistencia creada Correctamente',
            'asistencia' => $asistencias,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_asistencia){
        $asistencias = asistenciasModelo::find($id_asistencia);
        
        if(!$asistencias){ 
            $data = [
                'message' => 'asistencia no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'asistencia' => $asistencias,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_asistencia){
        $asistencias = asistenciasModelo::find($id_asistencia);

        if(!$asistencias){
            $data = [
                'message' => 'asistencia no encontrada', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $asistencias->delete();
        
        $data = [
            'message' => 'asistencia eliminada',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_asistencia){
    
        $asistencias = asistenciasModelo::find($id_asistencia );
       if(!$asistencias){
            $data = [
                'message' => 'asistencia no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [ 
            'fecha' => 'required',
            'estado' => 'required',
            'observaciones' => 'required',
            'id_estudiante' => 'required',
            'id_asignatura_curso' => 'required'
        ]);

       
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
        $asistencias->fecha = $request->fecha;
        $asistencias->estado = $request->estado;
        $asistencias->observaciones = $request->observaciones;
        $asistencias->id_estudiante = $request->id_estudiante;
        $asistencias->id_asignatura_curso = $request->id_asignatura_curso;
        
      
        $asistencias->save();
        
        $data = [
            'message' => 'asistencia actualizada',
            'asistencia' => $asistencias,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}