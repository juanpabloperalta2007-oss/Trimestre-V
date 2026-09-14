<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\cursosModelo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;  

class cursosControlador extends Controller
{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $cursos = cursosModelo::all(); // traer datos de la tabla
        
        if($cursos->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($cursos, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'nombre_curso' => 'required',
            'estado' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $cursos = cursosModelo::create([
            'nombre_curso' => $request->nombre_curso,
            'estado' => $request->estado
        ]);

        if(!$cursos){
            $data = [
                'message' => 'Error al crear el Curso',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'Curso creado Correctamente',
            'cursos' => $cursos,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_curso){
        $cursos = cursosModelo::find($id_curso);
        
        if(!$cursos){ 
            $data = [
                'message' => 'Curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'curso' => $cursos,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_curso){
        $cursos = cursosModelo::find($id_curso);
        
        if(!$cursos){
            $data = [
                'message' => 'Curso no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $cursos->delete();
        
        $data = [
            'message' => 'Curso Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_curso){
       $cursos = cursosModelo::find($id_curso);
       if(!$cursos){
            $data = [
                'message' => 'Curso no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        
        $validacion = Validator::make($request->all(), [
            'nombre_curso' => 'required',
            'estado' => 'required'
        ]);

       
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
        $cursos->nombre_curso = $request->nombre_curso;
        $cursos->estado = $request->estado;
        
      
        $cursos->save();
        
        $data = [
            'message' => 'Curso Actualizado',
            'curso' => $cursos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}  