<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\cargosModelo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;  

class cargosControlador extends Controller
{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $cargos = cargosModelo::all(); // traer datos de la tabla
        
        if($cargos->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($cargos, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
           'nombre_cargo' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $cargos = cargosModelo::create([
            'id_cargo' => $request->id_cargo, 
            'nombre_cargo' => $request->nombre_cargo
        ]);

        if(!$cargos){
            $data = [
                'message' => 'Error al crear el Cargo',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'Cargo creado Correctamente',
            'cargo' => $cargos,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_cargos){
        $cargos = cargosModelo::find($id_cargos);
        
        if(!$cargos){ 
            $data = [
                'message' => 'Cargo no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'cargo' => $cargos,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($codigocargos){
        $cargos = cargosModelo::find($codigocargos);
        
        if(!$cargos){
            $data = [
                'message' => 'Cargo no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $cargos->delete();
        
        $data = [
            'message' => 'Cargo Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $codigocargos){
        $cargos = cargosModelo::find($codigocargos);
       if(!$cargos){
            $data = [
                'message' => 'Cargo no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        
        $validacion = Validator::make($request->all(), [
            'nombre_cargo' => 'required'
        ]);

        
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
        $cargos->nombre_cargo = $request->nombre_cargo;
        
        $cargos->save();
        
        $data = [
            'message' => 'Cargo Actualizado',
            'cargo' => $cargos,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}