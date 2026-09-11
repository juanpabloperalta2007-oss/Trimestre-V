<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class usuariosModelo extends Authenticatable implements JWTSubject
{
    use HasFactory;
    protected $table = 'usuarios';
    public $timestamps = false;
    protected $primaryKey = 'id_usuario';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_usuario',
        'login',
        'password_hash',
        'estado'
    ];

    //se oculta el password
    protected $hidden = [
        'password_hash'
    ];

    public function getAuthPassword(){
        return $this->password_hash;
    }
    //identifica el token de que usuario es por medio del id_usuario
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return[
            'id_usuario' => $this->id_usuario

        ];
    }

}
