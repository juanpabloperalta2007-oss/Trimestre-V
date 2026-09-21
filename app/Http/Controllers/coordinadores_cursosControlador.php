<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\coordinadores_cursosModelo;

class coordinadores_cursosControlador extends Controller

{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $coordinadores_cursos = coordinadores_cursosModelo::all(); // traer datos de la tabla
        
        if($coordinadores_cursos->isEmpty()){
            $data = [
                'message' => 'No hay coordinador  registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($coordinadores_cursos, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'id_coordinador' => 'required',
            'id_curso' => 'required',
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $coordinadores_cursos = coordinadores_cursosModelo::create([
            'id_coordinador' => $request->id_coordinador,
            'id_curso' => $request->id_curso,
        ]);

        if(!$coordinadores_cursos){
            $data = [
                'message' => 'Error al crear el coordinador de curso',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'coordinador de curso creado correctamente',
            'coordinador_curso' => $coordinadores_cursos,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_coordinadores_cursos){
        $coordinadores_cursos = coordinadores_cursosModelo::find($id_coordinadores_cursos);
        
        if(!$coordinadores_cursos){ 
            $data = [
                'message' => 'cordinador de curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'coordinador_curso' => $coordinadores_cursos,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_coordinadores_cursos){
        $coordinadores_cursos = coordinadores_cursosModelo::find($id_coordinadores_cursos);

        if(!$coordinadores_cursos){
            $data = [
                'message' => 'coordinador de curso no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $coordinadores_cursos->delete();
        
        $data = [
            'message' => 'coordinador de curso eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_coordinadores_cursos){
        $coordinadores_cursos = coordinadores_cursosModelo::find($id_coordinadores_cursos );
       if(!$coordinadores_cursos){
            $data = [
                'message' => 'coordinado de curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
      
        $validacion = Validator::make($request->all(), [
            'id_coordinador' => 'required',
            'id_curso' => 'required'
        ]);

       
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
         $coordinadores_cursos->id_coordinador = $request->id_coordinador;
         $coordinadores_cursos->id_curso = $request->id_curso;

         $coordinadores_cursos->save();
        
        $data = [
            'message' => 'coordinador de curso actualizado',
            'coordinador_curso' => $coordinadores_cursos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}