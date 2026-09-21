<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\estudiantes_cursosModelo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class estudiantes_cursosControlador extends Controller
{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $estudiantes_cursos = estudiantes_cursosModelo::all(); // traer datos de la tabla
        
        if($estudiantes_cursos->isEmpty()){
            $data = [
                'message' => 'No hay estudiante de curso registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($estudiantes_cursos, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'id_estudiante' => 'required',
            'id_curso' => 'required',
            'anio' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $estudiantes_cursos = estudiantes_cursosModelo::create([ 
            'id_estudiante' => $request->id_estudiante,
            'id_curso' => $request->id_curso,
            'anio' => $request->anio
        ]);

        if(!$estudiantes_cursos){
            $data = [
                'message' => 'Error al crear el Estudiante de curso',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'estudiante de curso creado Correctamente',
            'estudiante_curso' => $estudiantes_cursos,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_estudiante_curso){
        $estudiantes_cursos = estudiantes_cursosModelo::find($id_estudiante_curso);
        
        if(!$estudiantes_cursos){ 
            $data = [
                'message' => 'estudiante de curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'estudiante_curso' => $estudiantes_cursos,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_estudiante_curso){
        $estudiantes_cursos = estudiantes_cursosModelo::find($id_estudiante_curso);
        
        if(!$estudiantes_cursos){
            $data = [
                'message' => 'estudiante de curso no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $estudiantes_cursos->delete();
        
        $data = [
            'message' => 'estudiante de curso eiminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_estudiante_curso){
        $estudiantes_cursos = estudiantes_cursosModelo::find($id_estudiante_curso );
       if(!$estudiantes_cursos){
            $data = [
                'message' => 'Estudiante no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [
            'id_estudiante' => 'required',
            'id_curso' => 'required',
            'anio' => 'required'
        ]);

      
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
       

         $estudiantes_cursos->update($request->all());

        
        $data = [
            'message' => 'estudiante de curso actualizado',
            'estudiante_curso' => $estudiantes_cursos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}