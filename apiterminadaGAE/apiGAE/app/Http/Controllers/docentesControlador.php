<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\docentesModelo;

class docentesControlador extends Controller
{
    // funcion para buscar las areas
    public function index(){
        $docentes = docentesModelo::all(); // traer datos de la tabla  
        
        if($docentes->isEmpty()){
            $data = [
                'message' => 'No hay docentes registrados',
                'status' => 404
            ];
            return response()->json($data, 404);  
        }

        return response()->json($docentes, 200);
    }

    //funcion para enviar datos o crear registros   
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_persona' => 'required',
            'id_cargo' => 'required'
        ]);

        if ($validacion->fails()){
            $data =[
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion ->errors (),
                'status' => 400
            ];
            return response() ->json($data,201);
        }
        
        //funcion que crea los registros 
        $docentes = docentesModelo::create([
            'id_persona' => $request -> id_persona,
            'id_cargo' => $request -> id_cargo
        ]);
        if(!$docentes){
            $data =[
                'message' => 'Error al crear un docente',
                'status' => 500 
            ];
            return response ()->json($data,500);
        }
        
            $data =[
                'message' => 'Docente creado correctamente',
                'docente' => $docentes,
                'status' => 201
            ];
            return response() ->json($data,201);
     }

     // funcion para busca por un registro
     public function show ($id_docente){

        $docentes = docentesModelo::find($id_docente);
        
        if(!$docentes){
            $data = [
                'message' => 'Docente no encontrado',
                'status' => 404
            ];
            return response()->json($data,404);
        }
            $data =[
                'docente' => $docentes,
                'staus' => 200
            ];
            return response()->json ($data,200);
     }

     //funcion para eliminar un registro
     public function destroy($id_docente){
        $docentes = docentesModelo::find($id_docente);

        if(!$docentes){
            $data =[
            'message' => 'Docente no encontrado',
            'status' => 404
            ];
            return response()-> json($data,404);
        }

        $docentes -> delete ();
        
        $data = [
            'message' => 'Docente eliminado',
            'status' => 200
        ];
        return response()-> json ($data,200);
     }

     //funcion para actualizar un registro

     public function update (Request $request, $id_docente){
        $docentes = docentesModelo::find ($id_docente);

        if(!$docentes){
            $data =[  
                'message' => 'El docente no se encunetra',
                'stayus' => 404
            ];
            return response ()-> json($data,404);
        }

        $validacion =Validator::make($request->all(),[
            'id_persona' => 'required',
            'id_cargo' => 'required'
        ]);

        if($validacion -> fails()){
            $data =[
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data,400);
        }

        $docentes-> id_persona = $request -> id_persona;
        $docentes-> id_cargo = $request -> id_cargo;

        $docentes->save();
        
        $data =[
            'message' => 'Docente actualizado correctamente',
            'docente' => $docentes,
            'status' => 200
        ];
        return response() ->json($data,200);
     }
}
