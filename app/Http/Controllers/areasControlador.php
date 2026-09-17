<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\areasModelo;

class areasControlador extends Controller
{
    // funcion para buscar las areas
    public function index(){
        $areas = areasModelo::all(); // traer datos de la tabla  
        
        if($areas->isEmpty()){
            $data = [
                'message' => 'No hay areas Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($areas, 200);
    } 

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'nombre_area' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $areas = areasModelo::create([
             'nombre_area' => $request->nombre_area
        ]);

        if(!$areas){
            $data = [
                'message' => 'Error al crear el area',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'Area creado Correctamente',
            'area' => $areas,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

        // buscar por un registro
    public function show($id_area){
        
        $areas = areasModelo::find($id_area);
        
        if(!$areas){ 
            $data = [
                'message' => 'Area no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'area' => $areas,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_area){
        $areas = areasModelo::find($id_area);
        
        if(!$areas){
            $data = [
                'message' => 'Area no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $areas->delete();
        
        $data = [
            'message' => 'Area Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

     // actualizar un registro
    public function update(Request $request, $id_area){
      $areas = areasModelo::find($id_area);
       if(!$areas){
            $data = [
                'message' => 'Area no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [
               'nombre_area' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
    
        $areas->nombre_area = $request->nombre_area;
        
        $areas->save();
        
        $data = [
            'message' => 'Area Actualizado',
            'area' => $areas,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}
