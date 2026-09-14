<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class asignaturasModelo extends Model
{
    protected $table = 'asignaturas';
    public $timestamps = false;
    protected $primaryKey = 'id_asignatura';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_asignatura',
        'nombre_asignatura',
        'id_area'
    ];
}
