<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\usuariosModelo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exeptions\JWTExeption;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
 

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validar los datos enviados
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password_hash' => 'required|string|min:4'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Buscar usuario por login
        $user = usuariosModelo::where(
            'login',
            $request->login
        )->first();

        // Verificar que exista
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 401);
        }

        // Verificar estado
        if ($user->estado !== 'Activo') {
            return response()->json([
                'success' => false,
                'message' => 'El usuario se encuentra inactivo'
            ], 403);
        }

        // Verificar contraseña
        $hash = hash('sha256',$request->password_hash);
        if ($hash !== $user->password_hash) {
            return response()->json([
            'success' => false,
            'message' => 'Contraseña incorrecta'
        ], 401);
    }

        // Generar token
        try {
            $token = JWTAuth::fromUser($user);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar token: ' . $e->getMessage()
            ], 500);
        }

        // Respuesta
        $responseData = [
            'success' => true,
            'data' => [
                'user' => [
                    'id_usuario' => $user->id_usuario,
                    'login' => $user->login,
                    'estado' => $user->estado
                ],
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth()->factory()->getTTL() * 60
            ]
        ];

        // opcion guardar en cookie

        $cookie = Cookie::make(
            'jwt_token',
            $token,
            auth()-> factory()->getTTL(),
            '/',
            null,
            false,
            true,
            false,
            'lax'
        );
        return response() -> json($responseData,200) -> withCookie($cookie);
    }

    public function logout(Request $request)
    {
        try{
            $token = JWTAuth::getToken();

            if (!$token){
                return response()-> json ([
                    'success' => false,
                    'message' => 'Token no proporcionado'
                ], 400);
            }

            JWTAuth::invalidate($token);

            $cookie = Cookie::forget('jwt_token');

            return response()-> json ([
                'success' => true,
                'message' => 'Seccion cerrada exitosamente'
            ],200) -> withCookie($cookie);
        } catch (JWTException $e){
            return response()-> json ([
                'success' => false,
                'message' => 'Error al cerrar seccion: ' .e->getMessage ()
            ],500);
        }
    }

    public function me (Request $request){

    try{
        $user = auth() ->user ();
        if (!user){
            return response ()-> json ([
                'seccess' => false,
                'message'=> 'Usuario no autenticado'
            ],401);
        }
        $user -> load ('cargos');
        return response () -> json ([
            'success' => true,
            'data' => [
                'user' => [
                    'nombreUsuario' => $user ->nombreUsuario,
                    'cargo' => $user ->cargos ->map(function($cargos){
                        return[
                            'codigo' => $cargos -> id_cargo,
                            'nombre' => $cargos -> nombre_cargo
                        ];
                    })
                ]
            ]
            ],200);
    }catch (\Exeption $e) {
        return response () -> json ([
            'success' => false,
            'message' => 'Error al obtener usuarios: ' .$e ->getMessage()
        ],401);
    }
    }

    public function refresh (Request $request)
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

            return response ()-> json ([
                'success'=> true,
                'data' => [
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()->getTTL()*60
                ]
            ],200)->withCookie($cookie);
        } catch(JWTExption $e){
            return response()-> json ([
                'success' => false,
                'message' => 'Error al refrescar el token: ' .e->getMessage()
            ],500);
        }
    }
}