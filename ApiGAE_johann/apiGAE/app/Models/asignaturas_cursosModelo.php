<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class asignaturas_cursosModelo extends Model

{
    use HasFactory;
    protected $table = 'asignaturas_cursos';
    public $timestamps = false;
    protected $primaryKey = 'id_asignatura_curso';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_asignatura_curso',
        'id_asignatura',
        'id_curso',
        'id_docente'
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
