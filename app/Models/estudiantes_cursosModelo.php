<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class estudiantes_cursosModelo extends Authenticatable implements JWTSubject

{
    use HasFactory;
    protected $table = 'estudiantes_cursos';
    public $timestamps = false;
    protected $primaryKey = 'id_estudiante_curso';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_estudiante',
        'id_curso',
        'anio'
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
