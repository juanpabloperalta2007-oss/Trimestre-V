<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\calendario_escolarModelo;

class calendario_escolarControlador extends Controller

{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $calendario_escolar = calendario_escolarModelo::all(); // traer datos de la tabla
        
        if($calendario_escolar->isEmpty()){
            $data = [
                'message' => 'No hay candelario escolar registrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($calendario_escolar, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'titulo' => 'required',
            'descripcion' => 'required',
            'fecha_inicio' => 'required',
            'fecha_fin' => 'required',
            'tipo_evento' => 'required',
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

        $calendario_escolar = calendario_escolarModelo::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'tipo_evento' => $request->tipo_evento,
            'id_curso' => $request->id_curso
        ]);

        if(!$calendario_escolar){
            $data = [
                'message' => 'Error al crear el calendario escolar',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'calendario escolar creado correctamente',
            'calendario_escolar' => $calendario_escolar,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_evento){
        $calendario_escolar = calendario_escolarModelo::find($id_evento);
        
        if(!$calendario_escolar){ 
            $data = [
                'message' => 'calendario escolar no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'calendario_escolar' => $calendario_escolar,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_evento){
        $calendario_escolar = calendario_escolarModelo::find($id_evento);

        if(!$calendario_escolar){
            $data = [
                'message' => 'calendario escolar no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $calendario_escolar->delete();
        
        $data = [
            'message' => 'calendario_escolar Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_evento){
        $calendario_escolar = calendario_escolarModelo::find($id_evento);
       if(!$calendario_escolar){
            $data = [
                'message' => 'registro no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [ 
            'titulo' => 'required',
            'descripcion' => 'required',
            'fecha_inicio' => 'required',
            'fecha_fin' => 'required',
            'tipo_evento' => 'required',
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
        
        $calendario_escolar->update($request->all());


        
        $data = [
            'message' => 'calendario escolar actualizado',
            'calendario_escolar' => $calendario_escolar,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}
