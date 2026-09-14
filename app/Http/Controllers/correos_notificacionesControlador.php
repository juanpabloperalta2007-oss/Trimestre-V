<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\correos_notificacionesModelo;

class correos_notificacionesControlador extends Controller

{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $correos_notificaciones = correos_notificacionesModelo::all(); // traer datos de la tabla
        
        if($correos_notificaciones->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($correos_notificaciones, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'asunto' => 'required',
            'mensaje' => 'required',
            'fecha_envio' => 'required',
            'tipo_notificacion' => 'required',
            'estado_envio' => 'required',
            'id_docente' => 'required',
            'id_acudiente' => 'required',
            'id_estudiante' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $correos_notificaciones = correos_notificacionesModelo::create([
            'asunto' => $request->asunto,
            'mensaje' => $request->mensaje,
            'fecha_envio' => $request->fecha_envio,
            'tipo_notificacion' => $request->tipo_notificacion,
            'estado_envio' => $request->estado_envio,
            'id_docente' => $request->id_docente,
            'id_acudiente' => $request->id_acudiente,
            'id_estudiante' => $request->id_estudiante
        ]);

        if(!$correos_notificaciones){
            $data = [
                'message' => 'Error al crear el correo de notificaciones',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'correo de notificaciones creado correctamente',
            'correos_notificaciones' => $correos_notificaciones,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_correo ){
        $correos_notificaciones = correos_notificacionesModelo::find($id_correo);
        
        if(!$correos_notificaciones){ 
            $data = [
                'message' => 'correo de notificaciones no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'correos_notificaciones' => $correos_notificaciones,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_correo){
        $correos_notificaciones = correos_notificacionesModelo::find($id_correo);

        if(!$correos_notificaciones){
            $data = [
                'message' => 'correo de notificaciones no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $correos_notificaciones->delete();
        
        $data = [
            'message' => 'correo de notificaciones eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_correo){
        
        $correos_notificaciones = correos_notificacionesModelo::find($id_correo );
       if(!$correos_notificaciones){
            $data = [
                'message' => 'correo de la notificaciones no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
       
        $validacion = Validator::make($request->all(), [ 
            'asunto' => 'required',
            'mensaje' => 'required',
            'fecha_envio' => 'required',
            'tipo_notificacion' => 'required',
            'estado_envio' => 'required',
            'id_docente' => 'required',
            'id_acudiente' => 'required',
            'id_estudiante' => 'required'
        ]);

       
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
    
        $correos_notificaciones->update($request->all());
        
        $data = [
            'message' => 'correo de notificaciones actualizado',
            'correos_notificaciones' => $correos_notificaciones,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}