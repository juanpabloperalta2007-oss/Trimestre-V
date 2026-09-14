<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_usuario' => 'required|string',
            
        ]);
    }

    public function logout(Request $request)
    {
        try {
        $token = JWTAuth::getToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'token no proporcionado'
            ], 400);
        }

        JWTAuth::invalidate($token);

        $cookie = Cookie::forget('jwt_token');

        // Respuesta de ÉXITO correcta (al final del try)
        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente'
        ]); 

    } catch (\Exception $e) {
        // Respuesta de ERROR correcta (dentro del catch)
        return response()->json([
            'success' => false,
            'message' => 'Error al cerrar sesion: ' . $e->getMessage()
        ], 500);
    }
}

    public function me(Request $request)
    {
        try{
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no auntenticado'
                ], 400);
            }
            $user->load('cargos');

            return response()->json([
                'success' => true,
                'data' => [
                    'user' =>[
                        'nombreUsuario' => $user->nombreUsuario,
                        'cargos' => $user->cargos->map(function($cargo){
                            return[
                                'codigo' => $cargos->id_cargo,
                                'nombre'=> $cargos->nombre_cargo
                            ];
                        })
                    ]
                ]
            ], 200);
        } catch (\Exeption $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario: ' . $e->getMessage()
            ], 401);
        }
    }

    public function refresh(Request $request)
    {
        try{
            $token = JWTAuth::refresh(JWTAuth::getToken());

            $cookie = Cookie::make(
                'jwt_token',
                $token,
                auth()->factory()->getTTL(),
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );
            return response()->json([
                'success' => true,
                'data' => [
                    'token' =>$token,
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()-getTTl() *60
                ]
            ], 200)->withCookie($cookie);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al refrescar token: ' . $e->getMessage()
            ], 500);
        }
    }
 





     




}
