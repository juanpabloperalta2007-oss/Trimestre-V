<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class acudientes_estudiantesModelo extends Model
{
    use HasFactory;  
    protected $table = 'acudientes_estudiantes';
    public $timestamps = false;
    protected $primaryKey = 'id_acudiente_estudiante';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_acudiente_estudiante',
        'id_acudiente',
        'id_estudiante',
        'parentesco'
    ];
    
}
