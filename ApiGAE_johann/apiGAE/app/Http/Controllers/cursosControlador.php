<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\cursosModelo;

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
            'estado' => 'required',
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
            'id_curso' => $request->id_curso, // Asegúrate de que esto coincida con lo que envías. Antes tenías $request->codigoCargos
            'nombre_curso' => $request->nombre_curso,
            'estado' => $request->estado,
        ]);

        if(!$cursos){
            $data = [
                'message' => 'Error al crear el curso',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'curso creado Correctamente',
            'curso' => $cursos,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_curso){
        $cursos = cursosModelo::find($id_curso);
        
        if(!$cursos){ 
            $data = [
                'message' => 'curso no encontrado',
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
                'message' => 'curso no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $cursos->delete();
        
        $data = [
            'message' => 'curso Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $curso){
        // CORRECCIÓN: cargosModelo y variable con $
        $cursos = cursosModelo::find($id_curso );
       if(!$cursos){
            $data = [
                'message' => 'curso no encontrado',
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
        
        $cursos->id_curso = $request->id_curso;
        $cursos->id_curso = $request->id_curso;
        
        // CORRECCIÓN: Faltaba guardar en la base de datos
        $cursos->save();
        
        $data = [
            'message' => 'curso Actualizado',
            'curso' => $cursos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}