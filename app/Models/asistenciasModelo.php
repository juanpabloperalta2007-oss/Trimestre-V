<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class asistenciasModelo extends Model

{
    use HasFactory;
    protected $table = 'asistencias';
    public $timestamps = false;
    protected $primaryKey = 'id_asistencia';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_asistencia',
        'fecha',
        'estado',
        'observaciones',
        'id_estudiante',
        'id_asignatura_curso'
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