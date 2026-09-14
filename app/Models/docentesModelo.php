<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class docentesModelo extends Model
{
    use HasFactory;  
    protected $table = 'docentes';
    public $timestamps = false;
    protected $primaryKey = 'id_docente';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_docente',
        'id_persona',
        'id_cargo'  
    ];
}
