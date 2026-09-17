<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\asignaturas_cursosModelo;

class asignaturas_cursosControlador extends Controller

{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $asignaturas_cursos = asignaturas_cursosModelo::all(); // traer datos de la tabla
        
        if($asignaturas_cursos->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($asignaturas_cursos, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'id_asignatura' => 'required',
            'id_curso' => 'required',
            'id_docente' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $asignaturas_cursos = asignaturas_cursosModelo::create([
            'id_asignatura' => $request->id_asignatura,
            'id_curso' => $request->id_curso,
            'id_docente' => $request->id_docente
        ]);

        if(!$asignaturas_cursos){
            $data = [
                'message' => 'Error al crear el asignatura_curso',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'asignatura_curso creado Correctamente',
            'asignatura_curso' => $asignaturas_cursos,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_asignatura_curso){
        $asignaturas_cursos = asignaturas_cursosModelo::find($id_asignatura_curso);
        
        if(!$asignaturas_cursos){ 
            $data = [
                'message' => 'asignaturas_curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'asignatura_curso' => $asignaturas_cursos,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_asignatura_curso){
        $asignaturas_cursos = asignaturas_cursosModelo::find($id_asignatura_curso);

        if(!$asignaturas_cursos){
            $data = [
                'message' => 'asignatura_curso no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $asignaturas_cursos->delete();
        
        $data = [
            'message' => 'asignatura_curso Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_asignatura_curso){
        $asignaturas_cursos = asignaturas_cursosModelo::find($id_asignatura_curso );
       if(!$asignaturas_cursos){
            $data = [
                'message' => 'asignatura_curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
      
        $validacion = Validator::make($request->all(), [ 
            'id_curso' => 'required',
            'id_docente' => 'required'
        ]);

       
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
        $asignaturas_cursos->id_asignatura_curso = $request->id_asignatura_curso;
        
       
        $asignaturas_cursos->save();
        
        $data = [
            'message' => 'asignatura_curso Actualizado',
            'asignatura_curso' => $asignaturas_cursos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}