<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\usuariosModelo;

class usuariosControlador extends Controller
{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $usuarios = usuariosModelo::all(); // traer datos de la tabla
        
        if($usuarios->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($usuarios, 200);
    }
    
    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'login' => 'required',
            'password_hash' => 'required',
            'estado' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        $usuarios = usuariosModelo::create([
            'login' =>$request ->login,
            'password_hash' =>Hash::make($request ->password_hash),
            'estado' => $request ->estado,
            
        ]);

        if(!$usuarios){
            $data = [
                'message' => 'Error al crear un usuario',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'Usuario creado Correctamente',
            'usuario' => $usuarios,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_usuario){
        
        $usuarios = usuariosModelo::find($id_usuario);
        
        if(!$usuarios){ 
            $data = [
                'message' => 'Usuario no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'usuario' => $usuarios,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_usuario){
        $usuarios = usuariosModelo::find($id_usuario);
        
        if(!$usuarios){
            $data = [
                'message' => 'Usuario no encontrado', 
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $usuarios->delete();
        
        $data = [
            'message' => 'Usuario Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_usuario){
                $usuarios = usuariosModelo::find($id_usuario);
       if(!$usuarios){
            $data = [
                'message' => 'Usuario no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $validacion = Validator::make($request->all(), [
            'login' => 'required',
            'password_hash' => 'required',
            'estado' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
        $usuarios->login = $request->login;
        $usuarios -> password_hash = $request->password_hash; 
        $usuarios -> estado = $request ->estado;
        
        $usuarios->save();
        
        $data = [
            'message' => 'Usuario Actualizado',
            'usuario' => $usuarios,
            'status' => 200  
        ];
        
        return response()->json($data, 200);
    }
}
