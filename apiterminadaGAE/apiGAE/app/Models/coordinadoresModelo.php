<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class coordinadoresModelo extends Model
{
    use HasFactory;  
    protected $table = 'coordinadores';
    public $timestamps = false;
    protected $primaryKey = 'id_coordinador';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable=[
        'id_coordinador',
        'id_persona',
        'area_asignada',
        'estado' 
    ];
}
