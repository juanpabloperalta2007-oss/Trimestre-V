<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class cursosModelo extends Model
{
    use HasFactory;  
    protected $table = 'cursos';
    public $timestamps = false;
    protected $primaryKey = 'id_curso';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_curso',
        'nombre_curso',
        'estado'
    ];
    
}
