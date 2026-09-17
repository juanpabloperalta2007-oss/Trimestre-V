<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class personasModelo extends Model
{
    protected $table = 'personas';
    public $timestamps = false;
    protected $primaryKey = 'id_persona';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_persona',
        'tipo_documento',
        'numero_documento',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'telefono',
        'correo',
        'id_usuario'
    ];
}
