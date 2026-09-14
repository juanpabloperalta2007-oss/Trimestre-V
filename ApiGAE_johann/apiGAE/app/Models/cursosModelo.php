<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;;

class cursosModelo extends Model

{
    use HasFactory;
    protected $table = 'cursos';
    public $timestamps = false;
    protected $primaryKey = 'id_curso';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_correo',
        'nombre_curso',
        'estado',
        
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
