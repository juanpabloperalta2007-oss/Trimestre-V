<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\personasModelo;

class personasControlador extends Controller
{
   // funcion para buscar las areas
    public function index(){
        $personas = personasModelo::all(); // traer datos de la tabla
        
        if($personas->isEmpty()){
            $data = [
                'message' => 'No hay personas Registradas',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($personas, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'tipo_documento' => 'required',
            'numero_documento'=> 'required',
            'primer_nombre'=> 'required',
            'segundo_nombre'=> 'required',
            'primer_apellido'=> 'required',
            'segundo_apellido'=> 'required',
            'telefono'=> 'required',
            'correo'=> 'required',
            'id_usuario' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $personas = personasModelo::create([ 
            'tipo_documento' => $request->tipo_documento,
            'numero_documento'=>$request->numero_documento,
            'primer_nombre'=> $request->primer_nombre,
            'segundo_nombre'=> $request ->segundo_nombre,
            'primer_apellido'=> $request ->primer_apellido,
            'segundo_apellido'=> $request -> segundo_apellido,
            'telefono'=>$request ->telefono ,
            'correo'=> $request -> correo,
            'id_usuario' => $request -> id_usuario
        ]);

        if(!$personas){
            $data = [
                'message' => 'Error al crear una persona',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'Persona creado Correctamente',
            'persona' => $personas,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_persona){
        
        $personas = personasModelo::find($id_persona);
        
        if(!$personas){ 
            $data = [
                'message' => 'Persona no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'persona' => $personas,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_persona){
        $personas = personasModelo::find($id_persona);
        
        if(!$personas){
            $data = [
                'message' => 'Persona no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $personas->delete();
        
        $data = [
            'message' => 'Persona Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

     // actualizar un registro
    public function update(Request $request, $id_persona){
                $personas = personasModelo::find($id_persona);
       if(!$personas){
            $data = [
                'message' => 'Persona no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [
            'tipo_documento' => 'required',
            'numero_documento'=> 'required',
            'primer_nombre'=> 'required',
            'segundo_nombre'=> 'required',
            'primer_apellido'=> 'required',
            'segundo_apellido'=> 'required',
            'telefono'=> 'required',
            'correo'=> 'required',
            'id_usuario' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $personas->tipo_documento = $request->tipo_documento;
        $personas->numero_documento = $request->numero_documento;
        $personas->primer_nombre = $request->primer_nombre;
        $personas->segundo_nombre = $request->segundo_nombre;
        $personas->primer_apellido = $request->primer_apellido;
        $personas->segundo_apellido = $request->segundo_apellido;
        $personas->telefono = $request->telefono;
        $personas->correo = $request->correo;
        $personas->id_usuario = $request->id_usuario;
        
        
        
        $personas->save();
        
        $data = [
            'message' => 'Persona Actualizado',
            'persona' => $personas,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}
