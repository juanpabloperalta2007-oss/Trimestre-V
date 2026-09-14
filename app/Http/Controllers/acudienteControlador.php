<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\acudienteModelo;

class acudienteControlador extends Controller
{
    // funcion para buscar las areas
    public function index(){
        $acudiente = acudienteModelo::all(); // traer datos de la tabla  
        
        if($acudiente->isEmpty()){
            $data = [
                'message' => 'No hay acudiente registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($acudiente, 200);
    }

    //funcion para enviar datos o crear registros   
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_persona' => 'required',
            'direccion' => 'required'
        ]);

        if ($validacion->fails()){
            $data =[
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion ->errors (),
                'status' => 400
            ];
            return response()->json($data,400);
        }
        
        //funcion que crea los registros 
        $acudiente = acudienteModelo::create([
            'id_persona' => $request -> id_persona,
            'direccion' => $request -> direccion
        ]);
        if(!$acudiente){
            $data =[
                'message' => 'Error al crear un acudiente',
                'status' => 500 
            ];
            return response ()->json($data,500);
        }
        
            $data =[
                'message' => 'Acudiente creado correctamente',
                'acudiente' => $acudiente,
                'status' => 201
            ];
            return response() ->json($data,201);
     }

     // funcion para busca por un registro
     public function show ($id_acudiente){

        $acudiente = acudienteModelo::find($id_acudiente);
        
        if(!$acudiente){
            $data = [
                'message' => 'Acudiente no encontrado',
                'status' => 404
            ];
            return response()->json($data,404);
        }
            $data =[
                'acudiente' => $acudiente,
                'staus' => 200
            ];
            return response()->json ($data,200);
     }

     //funcion para eliminar un registro
     public function destroy($id_acudiente){
        $acudiente = acudienteModelo::find($id_acudiente);

        if(!$acudiente){
            $data =[
            'message' => 'Acudiente no encontrado',
            'status' => 404
            ];
            return response()-> json($data,404);
        }

        $acudiente -> delete();
        
        $data = [
            'message' => 'Acudiente eliminado',
            'status' => 200
        ];
        return response ()-> json ($data,200);
     }

     //funcion para actualizar un registro

     public function update (Request $request, $id_acudiente){
        $acudiente = acudienteModelo::find ($id_acudiente);

        if(!$acudiente){
            $data =[
                'message' => 'El acudiente no se encunetra',
                'status' => 404
            ];
            return response ()-> json($data,404);
        }

        $validacion =Validator::make($request->all(),[
            'id_persona' => 'required',
            'direccion' => 'required'
        ]);

        if($validacion -> fails()){
            $data =[
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data,400);
        }

        $acudiente-> id_persona = $request -> id_persona;
        $acudiente-> direccion = $request -> direccion;

        $acudiente->save();
        
        $data =[
            'message' => 'Acudeinte actualizado correctamente',
            'acudiente' => $acudiente,
            'status' => 200
        ];
        return response() ->json($data,200);
    }
}
