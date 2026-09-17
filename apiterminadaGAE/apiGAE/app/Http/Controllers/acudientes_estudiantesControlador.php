<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\acudientes_estudiantesModelo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;  

class acudientes_estudiantesControlador extends Controller
{
    // Funcion Listar trae todos los datos de la tabla
    public function index(){
        $acudientes_estudiantes = acudientes_estudiantesModelo::all(); // traer datos de la tabla
        
        if($acudientes_estudiantes->isEmpty()){
            $data = [
                'message' => 'No hay Usuarios Registrados',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        return response()->json($acudientes_estudiantes, 200);
    }

    // permite enviar datos o crear registros
    public function store(Request $request){
        $validacion = Validator::make($request->all(), [
            'id_acudiente_estudiante' => 'required',
            'id_acudiente' => 'required',
            'id_estudiante' => 'required',
            'parentesco' => 'required',
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }

        // CORRECCIÓN: Uso de cursosModelo y arreglo de la flecha ->
        $cursos = cursosModelo::create([
            'id_acudiente_estudiante' => $request->id_acudiente_estudiante, // Asegúrate de que esto coincida con lo que envías. Antes tenías $request->codigoCargos
            'id_acudiente' => $request->id_acudiente,
            'id_estudiante' => $request->id_estudiante,
            'parentesco' => $request->parentesco
        ]);

        if(!$acudientes_estudiantes){
            $data = [
                'message' => 'Error al crear el acudiente_estudiante',
                'status' => 500
            ];
            return response()->json($data, 500);
        }
        
        $data = [
            'message' => 'acudiente_estudiante creado Correctamente',
            'acudientes_estudiantes' => $acudientes_estudiantes,
            'status' => 201
        ];
        return response()->json($data, 201);
    }

    // buscar por un registro
    public function show($id_acudiente_estudiante){
        // CORRECCIÓN: cargosModelo y variable con $
        $acudientes_estudiantes = acudientes_estudiantesModelo::find($id_acudiente_estudiante);
        
        if(!$acudientes_estudiantes){ 
            $data = [
                'message' => 'acudiente_estudiante no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'acudiente_estudiante' => $acudientes_estudiantes,
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // eliminar un registro
    public function destroy($id_curso){
        // CORRECCIÓN: cargosModelo y variable con $
        $acudientes_estudiantes = acudientes_estudiantesModelo::find($id_acudiente_estudiante);
        
        if(!$acudientes_estudiantes){
            $data = [
                'message' => 'acudiente_estudiante no encontrado', // Corregido: Decía "cargo encontrado"
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        $acudientes_estudiantes->delete();
        
        $data = [
            'message' => 'acudiente_estudiante Eliminado',
            'status' => 200
        ];
        return response()->json($data, 200);
    }

    // actualizar un registro
    public function update(Request $request, $id_acudiente_estudiante){
        // CORRECCIÓN: cursosModelo y variable con $
        $acudientes_estudiantes = cursosModelo::find($id_acudiente_estudiante);
       if(!$acudientes_estudiantes){
            $data = [
                'message' => 'acudiente_estudiante no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }
        
        // CORRECCIÓN: Validator en lugar de Validacion
        $validacion = Validator::make($request->all(), [
            'id_acudiente_estudiante' => 'required', // Corregido: id_Cargo a id_cargo para consistencia
            'id_acudiente' => 'required',
            'id_estudiante' => 'required',
            'parentesco' => 'required'
        ]);

        // CORRECCIÓN: if en lugar de id
        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400
            ];
            return response()->json($data, 400);
        }
        
        $acudientes_estudiantes->id_acudiente_estudiante = $request->id_acudiente_estudiante;
        $acudientes_estudiantes->id_acudiente = $request->id_acudiente;
        $acudientes_estudiantes->id_estudiante = $request->id_estudiante;
        $acudientes_estudiantes->parentesco = $request->parentesco;
        
        // CORRECCIÓN: Faltaba guardar en la base de datos
        $cursos->save();
        
        $data = [
            'message' => 'acudiente_estudiante Actualizado',
            'acudiente_estudiante' => $acudientes_estudiantes,
            'status' => 200
        ];
        
        return response()->json($data, 200);
    }
}
