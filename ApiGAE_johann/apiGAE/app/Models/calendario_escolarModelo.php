<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class calendario_escolarModelo extends Model

{
    use HasFactory;
    protected $table = 'calendario_escolar';
    public $timestamps = false;
    protected $primaryKey = 'id_evento';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'titulo',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'tipo_evento',
        'id_curso'
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
