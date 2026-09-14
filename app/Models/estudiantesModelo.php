<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class estudiantesModelo extends Model
{
    use HasFactory;  
    protected $table = 'estudiantes';
    public $timestamps = false;
    protected $primaryKey = 'id_estudiante';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_estudiante',
        'id_persona',
        'codigo_lista',
        'estado'  
    ];
}
