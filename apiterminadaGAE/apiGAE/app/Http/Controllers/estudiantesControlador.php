<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\estudiantesModelo;

class estudiantesControlador extends Controller
{
    // funcion para buscar las areas 
    public function index(){
        $estudiantes = estudiantesModelo::all(); // traer datos de la tabla  
        
        if($estudiantes->isEmpty()){
            $data = [
                'message' => 'No esta registrado el estudiante',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($estudiantes, 200);
    }

    //funcion para enviar datos o crear registros   
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_persona' => 'required',
            'codigo_lista' => 'required',
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
        $estudiantes = estudiantesModelo::create([
            'id_persona' => $request -> id_persona,
            'codigo_lista' => $request -> codigo_lista,
            'estado' => $request -> estado
        ]);
        if(!$estudiantes){
            $data =[
                'message' => 'Error al crear un estudiante',
                'status' => 500 
            ];
            return response ()->json($data,500);
        }
        
            $data =[
                'message' => 'Estudiante creado correctamente',
                'estudiante' => $estudiantes,
                'status' => 201
            ];
            return response() ->json($data,201);
     }

     // funcion para busca por un registro
     public function show ($id_estudiante){

        $estudiantes = estudiantesModelo::find($id_estudiante);
        
        if(!$estudiantes){
            $data = [
                'message' => 'Docente no encontrado',
                'status' => 404
            ];
            return response()->json($data,404);
        }
            $data =[
                'estudiante' => $estudiantes,
                'staus' => 200
            ];
            return response()->json ($data,200);
     }

     //funcion para eliminar un registro
     public function destroy($id_estudiante){
        $estudiantes = estudiantesModelo::find($id_estudiante);

        if(!$estudiantes){
            $data =[
            'message' => 'Estudiante no encontrado',
            'status' => 404
            ];
            return response()-> json($data,404);
        }

        $estudiantes -> delete ();
        
        $data = [
            'message' => 'Estudiante eliminado',
            'status' => 200
        ];
        return response ()-> json ($data,200);
     }

     //funcion para actualizar un registro

     public function update (Request $request, $id_estudiante){
        $estudiantes = estudiantesModelo::find ($id_estudiante);

        if(!$estudiantes){
            $data =[  
                'message' => 'El estudiante no se encunetra',
                'stayus' => 404
            ];
            return response ()-> json($data,404);
        }

        $validacion =Validator::make($request->all(),[
            'id_persona' => 'required',
            'codigo_lista' => 'required',
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
        
        $estudiantes-> id_persona = $request -> id_persona;
        $estudiantes-> codigo_lista = $request -> codigo_lista;
        $estudiantes -> estado = $request -> estado;

        $estudiantes->save();
        
        $data =[
            'message' => 'Estudiante actualizado correctamente',
            'estudiante' => $estudiantes,
            'status' => 200
        ];
        return response() ->json($data,200);
     }
}
