<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class coordinadores_cursosModelo extends Model

{   
     use HasFactory;
    protected $table = 'coordinadores_cursos';
    public $timestamps = false;
    protected $primaryKey = 'id_coordinadores_cursos';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_coordinadores_cursos',
        'id_coordinador',
        'id_curso',
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