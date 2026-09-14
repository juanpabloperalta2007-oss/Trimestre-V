<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\asignaturasModelo;

class asignaturasControlador extends Controller
{
    // funcion para buscar las areas
    public function index(){
        $asignaturas = asignaturasModelo::all(); // traer datos de la tabla  
        
        if($asignaturas->isEmpty()){
            $data = [
                'message' => 'No hay asignatura registrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($asignaturas, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'nombre_asignatura' => 'required',
            'id_area' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $asignaturas = asignaturasModelo::create([
             'nombre_asignatura' => $request->nombre_asignatura,
             'id_area' => $request -> id_area
        ]);

        if(!$asignaturas){
            $data = [
                'message' => 'Error al crear la asignatura',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'Asignatura creada Correctamente',
            'asignatura' => $asignaturas,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_asignatura){
        
        $asignaturas = asignaturasModelo::find($id_asignatura);
        
        if(!$asignaturas){ 
            $data = [
                'message' => 'Asignatura no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'asignatura' => $asignaturas,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

     // eliminar un registro
    public function destroy($id_asignatura){
        $asignaturas = asignaturasModelo::find($id_asignatura);
        
        if(!$asignaturas){
            $data = [
                'message' => 'Asignatura no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $asignaturas->delete();
        
        $data = [
            'message' => 'Asignatura eliminada',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_asignatura){
                $asignaturas = asignaturasModelo::find($id_asignatura);
       if(!$asignaturas){
            $data = [
                'message' => 'Asignatura no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [
            'nombre_asignatura' => 'required',
            'id_area' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }


        $asignaturas -> nombre_asignatura = $request ->nombre_asignatura;
        $asignaturas -> id_area = $request -> id_area;
        
        $asignaturas->save();
        
        $data = [
            'message' => 'Asignatura actualizada',
            'asignatura' => $asignaturas,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }

}
  