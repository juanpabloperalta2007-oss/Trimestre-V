<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\coordinadoresModelo;

class coordinadoresControlador extends Controller
{
   // funcion para buscar las areas
    public function index(){
        $coordinadores = coordinadoresModelo::all(); // traer datos de la tabla  
        
        if($coordinadores->isEmpty()){
            $data = [
                'message' => 'No hay coordinador registrados',
                'status' => 404
            ];
            return response()->json($data, 404);   
        }

        return response()->json($coordinadores, 200);
    }

    //funcion para enviar datos o crear registros   
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
             'id_persona' => 'required',
            'area_asignada' => 'required',
            'estado' => 'required'
        ]);

        if ($validacion->fails()){
            $data =[
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion ->errors (),
                'status' => 400
            ];
            return response ()->json($data,400);
        }
        
        //funcion que crea los registros 
        $coordinadores = coordinadoresModelo::create([
            'id_persona' => $request -> id_persona,
            'area_asignada' => $request -> area_asignada,
            'estado' => $request -> estado
        ]);
        if(!$coordinadores){
            $data =[
                'message' => 'Error al crear un coordinador',
                'status' => 500 
            ];
            return response ()->json($data,500);
        }
        
            $data =[
                'message' => 'coordinador creado correctamente',
                'coordinador' => $coordinadores,
                'status' => 201
            ];
            return response() ->json($data,201);
     }

     // funcion para busca por un registro
     public function show ($id_coordinador){

        $coordinadores = coordinadoresModelo::find($id_coordinador);
        
        if(!$coordinadores){
            $data = [
                'message' => 'Coordinador no encontrado',
                'status' => 404
            ];
            return response()->json($data,404);
        }
            $data =[
                'coordinador' => $coordinadores,
                'staus' => 200
            ];
            return response()->json ($data,200);
     }

      //funcion para eliminar un registro
     public function destroy($id_coordinador){
        $coordinadores = coordinadoresModelo::find($id_coordinador);

        if(!$coordinadores){
            $data =[
            'message' => 'Coordinador no encontrado',
            'status' => 404
            ];
            return response()-> json($data,404);
        }

        $coordinadores -> delete ();
        
        $data = [
            'message' => 'Coordinador eliminado',
            'status' => 200
        ];
        return response ()-> json ($data,200);
     }

     //funcion para actualizar un registro

     public function update (Request $request, $id_coordinador){
        $coordinadores = coordinadoresModelo::find ($id_coordinador);

        if(!$coordinadores){
            $data =[  
                'message' => 'El coordinador no se encunetra',
                'stayus' => 404
            ];
            return response ()-> json($data,404);
        }

        $validacion =Validator::make($request->all(),[
            'id_persona' => 'required',
            'area_asignada' => 'required',
            'estado' => 'required'
        ]);

        if($validacion -> fails()){
            $data =[
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data,400);
        }

        $coordinadores-> id_persona = $request -> id_persona;
        $coordinadores-> area_asignada = $request -> area_asignada;
        $coordinadores -> estado = $request ->estado;

        $coordinadores->save();
        
        $data =[
            'message' => 'Coordinador actualizado correctamente',
            'coordinador' => $coordinadores,
            'status' => 200
        ];
        return response() ->json($data,200);
     }
}
