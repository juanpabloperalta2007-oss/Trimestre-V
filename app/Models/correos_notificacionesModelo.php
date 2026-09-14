<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;;

class correos_notificacionesModelo extends Model

{
    use HasFactory;
    protected $table = 'correos_notificaciones';
    public $timestamps = false;
    protected $primaryKey = 'id_correo';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'asunto',
        'mensaje',
        'fecha_envio',
        'tipo_notificacion',
        'estado_envio',
        'id_docente',
        'id_acudiente',
        'id_estudiante'
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Devuelve un array con claims personalizados para agregar al JWT.
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
    
}